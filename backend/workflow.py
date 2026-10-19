"""
고객 불만 메일 처리 순서도

    접수 → 분류(LangChain, 작은 모델)
             ├─ 배송지연 → 배송 조회(일반 코드) ─┐
             └─ 그 외   → 원인 분석(Claude 에이전트) ─┤
                                                 ↓
                                         사람 승인(멈춤)
                                   ├─ 승인 → 실행(DB 기록) → 답장 초안(LangChain) → 답장 저장
                                   └─ 거절 → 담당자 이관 ────→ 답장 초안(LangChain) → 답장 저장

LangSmith: LANGSMITH_TRACING=true 와 LANGSMITH_API_KEY 를 설정하면 모든 단계가 자동 기록된다.
"""

import asyncio
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Literal, TypedDict

from claude_agent_sdk import ClaudeAgentOptions, ResultMessage, create_sdk_mcp_server, query, tool
from langchain.chat_models import init_chat_model
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt
from langsmith import traceable
from pydantic import BaseModel, Field

import db
import rag

SMALL_MODEL = "claude-haiku-5-5"     # 분류·답장용 (싸고 빠름). 문자열만 바꾸면 다른 모델로 교체
AGENT_MODEL = "claude-sonnet-5-5"    # 원인 분석 에이전트용
OUTBOX = Path(__file__).parent / "outbox"


# =====================================================================
# 1. 순서도가 공유하는 상태 (업무 서류철)
# =====================================================================
class Ticket(TypedDict, total=False):
    email: str              # 고객 메일 원문
    order_id: str | None    # 메일에서 뽑은 주문번호
    order: dict | None      # 주문 정보
    category: str           # 분류 결과
    urgent: bool
    proposal: dict          # 해결안 {"action", "amount", "reason", "summary"}
    approved: bool
    reviewer: str
    reviewer_note: str
    result: str             # 실제 처리 결과
    reply: str              # 고객 답장
    reply_path: str


# =====================================================================
# 2. LangChain: 작은 모델로 분류와 답장 작성
# =====================================================================
# 최신 Claude 모델은 temperature 설정을 받지 않는다 (넣으면 400 에러). 분류 결과는 Pydantic 형식으로 고정한다.
small_llm = init_chat_model(SMALL_MODEL, model_provider="anthropic")


class Classification(BaseModel):
    category: Literal["배송지연", "제품불량", "환불요청", "기타"] = Field(description="불만 유형")
    urgent: bool = Field(description="화가 많이 났거나 법적 조치·SNS 언급 등 급한 건이면 true")


def receive(ticket: Ticket) -> Ticket:
    """[접수] 일반 코드. 메일에서 주문번호(A-1234 형식)를 뽑고 주문을 조회한다."""
    match = re.search(r"[A-Z]-\d{4}", ticket["email"])
    order_id = match.group(0) if match else None
    return {"order_id": order_id, "order": db.get_order(order_id) if order_id else None}


def classify(ticket: Ticket) -> Ticket:
    """[분류] LangChain + 작은 모델. 결과 형식을 Pydantic으로 강제한다."""
    result = small_llm.with_structured_output(Classification).invoke(
        f"다음 고객 메일의 불만 유형을 분류해 줘.\n\n{ticket['email']}"
    )
    return {"category": result.category, "urgent": result.urgent}


def route_after_classify(ticket: Ticket) -> str:
    # 주문을 못 찾았거나, 급하거나, 배송지연이 아니면 Claude 에이전트가 분석
    if ticket.get("order") and ticket["category"] == "배송지연" and not ticket["urgent"]:
        return "shipping_lookup"
    return "analyze"


def shipping_lookup(ticket: Ticket) -> Ticket:
    """[배송 조회] 단순 건은 AI 없이 정해진 규칙으로 해결안을 만든다."""
    s = db.get_shipment(ticket["order_id"])
    summary = (
        f"{s['carrier']} 송장 {s['tracking_no']}, 현재 상태 '{s['status']}' "
        f"({s['location']}, {s['last_update']} 기준). 택배사에 확인 요청 후 고객 안내."
    )
    return {"proposal": {"action": "안내", "amount": 0, "reason": "배송 지연 안내", "summary": summary}}


# =====================================================================
# 3. Claude Agent SDK: 판단이 필요한 원인 분석 (DB는 읽기 전용 도구만)
# =====================================================================
def _text(data) -> dict:
    return {"content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False)}]}


@tool("get_order", "주문번호로 주문 정보(고객, 상품, 금액, 상태)를 조회한다", {"order_id": str})
async def tool_get_order(args):
    return _text(db.get_order(args["order_id"]) or "해당 주문 없음")


@tool("get_shipment", "주문번호로 배송 정보(택배사, 송장, 현재 위치)를 조회한다", {"order_id": str})
async def tool_get_shipment(args):
    return _text(db.get_shipment(args["order_id"]) or "배송 정보 없음")


@tool("get_past_tickets", "고객 이름으로 과거 문의·처리 이력을 조회한다", {"customer": str})
async def tool_get_past_tickets(args):
    return _text(db.get_past_tickets(args["customer"]))


# ----- RAG 도구: 정확한 키가 없을 때 '뜻'으로 찾는다 (rag.py, pgvector) -----
@tool("search_policy", "환불·교환·배송 규정 문서에서 질문과 관련된 조항을 의미 검색한다", {"question": str})
async def tool_search_policy(args):
    return _text(rag.search_policy(args["question"]))


@tool("search_similar_cases", "다른 고객의 과거 상담 중 이번 불만과 비슷한 처리 사례를 의미 검색한다", {"complaint": str})
async def tool_search_similar_cases(args):
    return _text(rag.search_similar_tickets(args["complaint"]))


readonly_db = create_sdk_mcp_server(
    name="company_db",
    tools=[tool_get_order, tool_get_shipment, tool_get_past_tickets, tool_search_policy, tool_search_similar_cases],
)

ANALYST_PROMPT = """너는 쇼핑몰 고객지원 분석가야.
도구로 주문, 배송, 과거 이력을 필요한 만큼 조회해서 불만의 원인을 찾고 해결안을 제안해.
해결안은 반드시 search_policy로 찾은 규정에 근거해야 하고, search_similar_cases로 비슷한 과거 처리와 일관되게 맞춰.
너는 제안만 하고 실제 처리는 하지 않는다. 금액은 주문 금액을 넘을 수 없다.

마지막 답변은 반드시 아래 JSON 하나만 출력해:
{"action": "환불" | "교환" | "안내" | "확인필요", "amount": 환불금액(정수, 없으면 0),
 "reason": "한 줄 사유", "summary": "근거가 된 조회 결과와 규정 조항 제목을 포함한 2~3문장 설명"}"""


def _parse_json(text: str) -> dict:
    match = re.search(r"\{.*\}", text, re.DOTALL)
    try:
        return json.loads(match.group(0)) if match else {}
    except json.JSONDecodeError:
        return {}


@traceable(name="claude-원인분석")  # Agent SDK 호출도 LangSmith 화면에 함께 보이게
def analyze(ticket: Ticket) -> Ticket:
    # 순서도는 동기(invoke)로 돌고, 에이전트만 자기 이벤트 루프에서 돈다.
    # (Windows에서 비동기 psycopg와 Agent SDK의 하위 프로세스가 같은 루프를 못 쓰기 때문)
    return asyncio.run(_analyze(ticket))


async def _analyze(ticket: Ticket) -> Ticket:
    options = ClaudeAgentOptions(
        model=AGENT_MODEL,
        system_prompt=ANALYST_PROMPT,
        tools=[],                                   # 파일·터미널 같은 기본 도구는 전부 끔
        mcp_servers={"db": readonly_db},            # 읽기 전용 DB 도구만 제공
        allowed_tools=[
            "mcp__db__get_order", "mcp__db__get_shipment", "mcp__db__get_past_tickets",
            "mcp__db__search_policy", "mcp__db__search_similar_cases",
        ],
        max_turns=8,                                # 무한 반복 방지
        max_budget_usd=0.5,                         # 건당 비용 상한
    )
    prompt = f"주문번호: {ticket.get('order_id') or '메일에 없음'}\n\n고객 메일:\n{ticket['email']}"

    final_text = ""
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, ResultMessage):
            final_text = message.result or ""

    proposal = _parse_json(final_text)
    if proposal.get("action") not in {"환불", "교환", "안내", "확인필요"}:
        proposal = {"action": "확인필요", "amount": 0, "reason": "AI 분석 결과 해석 실패", "summary": final_text}

    # 안전장치: AI가 제안한 금액이 주문 금액을 넘으면 깎는다
    max_amount = (ticket.get("order") or {}).get("amount", 0)
    proposal["amount"] = max(0, min(int(proposal.get("amount") or 0), max_amount))
    return {"proposal": proposal}


# =====================================================================
# 4. 사람 승인 → 실행 / 이관
# =====================================================================
def human_approval(ticket: Ticket) -> Ticket:
    """[사람 승인] 여기서 순서도가 멈춘다. main.py가 담당자 답을 받아 이어서 실행한다."""
    decision = interrupt({"order": ticket.get("order"), "category": ticket["category"], "proposal": ticket["proposal"]})
    return {
        "approved": bool(decision["approved"]),
        "reviewer": decision.get("reviewer", "담당자"),
        "reviewer_note": decision.get("note", ""),
    }


def route_after_approval(ticket: Ticket) -> str:
    # 주문을 못 찾았거나 AI가 판단을 못 한 건은 승인해도 사람이 직접 처리
    can_execute = ticket.get("order") and ticket["proposal"]["action"] != "확인필요"
    return "execute" if ticket["approved"] and can_execute else "escalate"


def execute(ticket: Ticket) -> Ticket:
    """[실행] AI가 아니라 일반 코드가, 승인된 내용만 DB에 기록한다."""
    p = ticket["proposal"]
    action_id = db.record_action(ticket["order_id"], p["action"], p["amount"], p["reason"], ticket["reviewer"])
    amount = f" {p['amount']:,}원" if p["amount"] else ""
    return {"result": f"{p['action']}{amount} 처리 완료 (처리번호 {action_id})"}


def escalate(ticket: Ticket) -> Ticket:
    note = ticket.get("reviewer_note") or "추가 확인 필요"
    return {"result": f"담당자가 직접 확인 후 연락 예정 ({note})"}


def draft_reply(ticket: Ticket) -> Ticket:
    """[답장 초안] LangChain + 작은 모델."""
    customer = (ticket.get("order") or {}).get("customer", "고객")
    msg = small_llm.invoke(
        "쇼핑몰 고객센터 담당자로서 고객에게 보낼 정중한 한국어 답장 메일 본문을 써 줘. "
        "처리 결과에 없는 약속은 하지 마. 5문장 이내.\n\n"
        f"고객 이름: {customer}\n고객 메일: {ticket['email']}\n"
        f"상황 설명: {ticket['proposal']['summary']}\n처리 결과: {ticket['result']}"
    )
    return {"reply": msg.content if isinstance(msg.content, str) else str(msg.content)}


def save_reply(ticket: Ticket) -> Ticket:
    """[답장 저장] 실제 메일 발송 대신 outbox 폴더에 저장한다 (SMTP 연결 전 단계)."""
    OUTBOX.mkdir(exist_ok=True)
    to = (ticket.get("order") or {}).get("email", "unknown")
    path = OUTBOX / f"{datetime.now():%Y%m%d-%H%M%S}-{ticket.get('order_id') or 'no-order'}.txt"
    path.write_text(f"받는 사람: {to}\n\n{ticket['reply']}\n", encoding="utf-8")
    return {"reply_path": str(path)}


# =====================================================================
# 5. 순서도 조립
# =====================================================================
def build_app(checkpointer=None):
    g = StateGraph(Ticket)
    for name, fn in [
        ("receive", receive), ("classify", classify), ("shipping_lookup", shipping_lookup),
        ("analyze", analyze), ("human_approval", human_approval), ("execute", execute),
        ("escalate", escalate), ("draft_reply", draft_reply), ("save_reply", save_reply),
    ]:
        g.add_node(name, fn)

    g.add_edge(START, "receive")
    g.add_edge("receive", "classify")
    g.add_conditional_edges("classify", route_after_classify, ["shipping_lookup", "analyze"])
    g.add_edge("shipping_lookup", "human_approval")
    g.add_edge("analyze", "human_approval")
    g.add_conditional_edges("human_approval", route_after_approval, ["execute", "escalate"])
    g.add_edge("execute", "draft_reply")
    g.add_edge("escalate", "draft_reply")
    g.add_edge("draft_reply", "save_reply")
    g.add_edge("save_reply", END)

    # 승인 대기 중 상태 저장소. 터미널 실행(main.py)은 메모리, API 서버(api.py)는
    # PostgresSaver를 넘겨서 서버를 껐다 켜도 대기 건이 남는다.
    return g.compile(checkpointer=checkpointer or MemorySaver())
