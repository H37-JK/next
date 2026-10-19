"""
직원용 승인 API (FastAPI).

실행:
    uv run --env-file .env uvicorn api:app --reload
    → http://localhost:8000/docs 에서 바로 눌러 볼 수 있다.

흐름:
    POST /tickets                    메일 접수 → 백그라운드에서 분류·분석 후 '승인 대기'로 멈춤
    GET  /tickets?status=pending_approval   승인 대기 목록
    GET  /tickets/{id}               한 건 상세 (해결안, 처리 결과, 답장)
    POST /tickets/{id}/decision      승인/거절 → 백그라운드에서 실행·답장 작성 후 '완료'

AI 처리는 수십 초 걸릴 수 있어서 요청은 바로 202로 돌려주고, 화면은 상태를 다시 조회한다.
"""

import uuid
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import BackgroundTasks, FastAPI, HTTPException
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.types import Command
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, Field

import db
import rag
from workflow import build_app

Status = Literal["processing", "pending_approval", "done", "failed"]


# =====================================================================
# 서버 시작/종료: DB 준비, 승인 대기 상태를 PostgreSQL에 저장하는 순서도 생성
# =====================================================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    rag.init_rag()
    pool = ConnectionPool(
        db.DATABASE_URL,
        kwargs={"autocommit": True, "row_factory": dict_row, "prepare_threshold": 0},
        open=True,
    )
    saver = PostgresSaver(pool)
    saver.setup()  # LangGraph 체크포인트 테이블 생성 (이미 있으면 그대로)
    app.state.graph = build_app(checkpointer=saver)
    yield
    pool.close()


# 브라우저는 이 API를 직접 부르지 않고 Next.js 서버(frontend)가 대신 부르므로 CORS 설정이 필요 없다.
app = FastAPI(title="고객 불만 처리 API", lifespan=lifespan)


# =====================================================================
# 백그라운드 실행: 순서도를 다음 멈춤(승인) 또는 끝까지 돌리고 결과를 tickets 표에 기록
# =====================================================================
def run_graph(ticket_id: str, payload) -> None:
    config = {"configurable": {"thread_id": ticket_id}}
    try:
        state = app.state.graph.invoke(payload, config)
    except Exception as e:  # AI 호출 실패 등. 화면에 원인을 보여 주고 사람이 처리
        db.update_ticket(ticket_id, status="failed", error=f"{type(e).__name__}: {e}")
        return

    if "__interrupt__" in state:
        db.update_ticket(ticket_id, status="pending_approval", pending=state["__interrupt__"][0].value)
    else:
        db.update_ticket(
            ticket_id, status="done",
            result=state.get("result"), reply=state.get("reply"), reply_path=state.get("reply_path"),
        )


# =====================================================================
# API
# =====================================================================
class TicketIn(BaseModel):
    email: str = Field(min_length=1, description="고객 메일 원문", examples=["A-1026 스마트워치 전원이 안 켜져요"])


class Decision(BaseModel):
    approved: bool
    reviewer: str = Field("담당자", description="승인한 직원 (로그인 붙이기 전까지는 직접 입력)")
    note: str = Field("", description="거절 사유 등 메모")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/tickets", status_code=202)
def create_ticket(body: TicketIn, background: BackgroundTasks):
    ticket = db.create_ticket(str(uuid.uuid4()), body.email)
    background.add_task(run_graph, ticket["id"], {"email": body.email})
    return ticket


@app.get("/tickets")
def list_tickets(status: Status | None = None, limit: int = 50):
    return db.list_tickets(status, limit)


@app.get("/tickets/{ticket_id}")
def get_ticket(ticket_id: str):
    ticket = db.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(404, "없는 티켓")
    return ticket


@app.post("/tickets/{ticket_id}/decision", status_code=202)
def decide(ticket_id: str, decision: Decision, background: BackgroundTasks):
    if not db.claim_for_decision(ticket_id, decision.reviewer):
        if not db.get_ticket(ticket_id):
            raise HTTPException(404, "없는 티켓")
        raise HTTPException(409, "승인 대기 상태가 아님 (이미 처리됐거나 아직 분석 중)")
    background.add_task(run_graph, ticket_id, Command(resume=decision.model_dump()))
    return db.get_ticket(ticket_id)
