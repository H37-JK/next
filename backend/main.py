"""
실행:
    uv run --env-file .env main.py                                  # 예제 메일 3건을 차례로 처리
    uv run --env-file .env main.py "A-1026 시계 화면이 안 켜져요"   # 직접 쓴 메일 1건 처리
"""

import json
import sys
import uuid

from langgraph.types import Command

import db
import rag
from workflow import build_app

SAMPLE_EMAILS = [
    "안녕하세요. 주문번호 A-1024 이어폰이 일주일째 안 와요. 언제 오나요?",
    "A-1026 스마트워치 받았는데 전원이 아예 안 켜집니다. 지난번 밴드도 불량이었는데 정말 실망이네요.",
    "A-1025 스피커 잘 받았는데 생각보다 소리가 작아서 반품하고 싶어요.",
]


def ask_reviewer(pending: dict) -> dict:
    """터미널에서 담당자 승인을 받는다. (실서비스에선 이 부분이 슬랙 버튼이나 웹 화면이 된다)"""
    p = pending["proposal"]
    print("\n" + "=" * 60)
    print("[승인 요청]")
    if pending.get("order"):
        o = pending["order"]
        print(f"  주문: {o['order_id']} / {o['customer']} / {o['product']} / {o['amount']:,}원")
    print(f"  분류: {pending['category']}")
    print(f"  제안: {p['action']}" + (f" {p['amount']:,}원" if p["amount"] else ""))
    print(f"  사유: {p['reason']}")
    print(f"  설명: {p['summary']}")
    print("=" * 60)
    answer = input("승인할까요? (y = 승인 / n = 거절): ").strip().lower()
    note = "" if answer == "y" else input("거절 사유: ").strip()
    return {"approved": answer == "y", "reviewer": "고객지원팀", "note": note}


def handle(app, email: str) -> None:
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}  # 건마다 고유 번호
    print(f"\n▶ 새 메일: {email}")

    # 1) 승인 단계까지 자동 진행 후 멈춤
    state = app.invoke({"email": email}, config)

    # 2) 멈춘 건이 있으면 담당자에게 묻고 이어서 실행
    while "__interrupt__" in state:
        pending = state["__interrupt__"][0].value
        decision = ask_reviewer(pending)
        state = app.invoke(Command(resume=decision), config)

    print(f"\n✔ 처리 결과: {state['result']}")
    print(f"✔ 답장 저장: {state['reply_path']}")
    print("-" * 60)
    print(state["reply"])


def main() -> None:
    db.init_db()
    rag.init_rag()  # 규정 문서·과거 이력을 벡터로 색인 (이미 있으면 건너뜀)
    app = build_app()
    emails = [" ".join(sys.argv[1:])] if len(sys.argv) > 1 else SAMPLE_EMAILS
    for email in emails:
        handle(app, email)

    print("\n[DB에 기록된 처리 내역]")
    with db.connect() as conn:
        for row in conn.execute("SELECT * FROM actions ORDER BY id"):
            print(" ", json.dumps(row, ensure_ascii=False, default=str))


if __name__ == "__main__":
    main()
