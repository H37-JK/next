"""
예제용 회사 DB (PostgreSQL).
접속 주소는 환경변수 DATABASE_URL 로 정한다. 없으면 docker-compose.yml 의 예제 DB에 붙는다.
실제 회사에서는 DATABASE_URL 만 회사 DB로 바꾸고, 필요하면 함수 안쪽 쿼리를 회사 테이블에 맞게 고치면 된다.
"""

import os

import psycopg
from psycopg import sql
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

DATABASE_URL = os.environ.get(
    "DATABASE_URL", "postgresql://hjk:star8903@localhost:5432/hjk"
)


def connect() -> psycopg.Connection:
    # with connect() as conn: 블록이 끝나면 자동으로 commit 하고 연결을 닫는다.
    return psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=5)


def init_db() -> None:
    """테이블을 만들고 예제 데이터를 넣는다. 이미 있으면 그대로 둔다."""
    with connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                order_id   TEXT PRIMARY KEY,
                customer   TEXT NOT NULL,
                email      TEXT NOT NULL,
                product    TEXT NOT NULL,
                amount     INTEGER NOT NULL,
                status     TEXT NOT NULL,
                order_date TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS shipments (
                order_id    TEXT PRIMARY KEY REFERENCES orders(order_id),
                carrier     TEXT NOT NULL,
                tracking_no TEXT NOT NULL,
                status      TEXT NOT NULL,
                location    TEXT NOT NULL,
                last_update TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS past_tickets (
                id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                customer TEXT NOT NULL,
                date     TEXT NOT NULL,
                summary  TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS actions (
                id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                order_id    TEXT NOT NULL REFERENCES orders(order_id),
                kind        TEXT NOT NULL,
                amount      INTEGER NOT NULL,
                reason      TEXT NOT NULL,
                approved_by TEXT NOT NULL,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            -- API 서버용: 메일 한 건 = 티켓 한 건 (id는 LangGraph thread_id와 같다)
            CREATE TABLE IF NOT EXISTS tickets (
                id         TEXT PRIMARY KEY,
                email      TEXT NOT NULL,
                status     TEXT NOT NULL,          -- processing / pending_approval / done / failed
                pending    JSONB,                  -- 승인 화면에 보여 줄 내용 (주문, 분류, 해결안)
                reviewer   TEXT,
                result     TEXT,
                reply      TEXT,
                reply_path TEXT,
                error      TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            """
        )
        if conn.execute("SELECT COUNT(*) AS n FROM orders").fetchone()["n"] == 0:
            with conn.cursor() as cur:
                cur.executemany(
                    "INSERT INTO orders VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    [
                        ("A-1024", "김민수", "minsu@example.com", "무선 이어폰", 89000, "배송중", "2026-10-08"),
                        ("A-1025", "이서연", "seoyeon@example.com", "블루투스 스피커", 129000, "배송완료", "2026-10-10"),
                        ("A-1026", "박지훈", "jihoon@example.com", "스마트워치", 259000, "배송완료", "2026-10-11"),
                    ],
                )
                cur.executemany(
                    "INSERT INTO shipments VALUES (%s, %s, %s, %s, %s, %s)",
                    [
                        ("A-1024", "한진택배", "5012-3344-1024", "간선 상차 후 정체", "대전 허브", "2026-10-11 14:20"),
                        ("A-1025", "CJ대한통운", "6623-1188-1025", "배송완료", "서울 마포구", "2026-10-13 10:05"),
                        ("A-1026", "CJ대한통운", "6623-1188-1026", "배송완료", "부산 해운대구", "2026-10-14 16:40"),
                    ],
                )
                cur.executemany(
                    "INSERT INTO past_tickets (customer, date, summary) VALUES (%s, %s, %s)",
                    [
                        ("박지훈", "2026-07-02", "이전 주문 스마트밴드 화면 불량으로 교환 처리"),
                        ("이서연", "2026-09-15", "배송 주소 변경 요청, 정상 처리"),
                        ("최유진", "2026-08-21", "스마트워치 수령 직후 전원이 켜지지 않음. 불량 확인 후 배송비 없이 새 제품으로 교환"),
                        ("정다은", "2026-09-03", "블루투스 스피커 음량이 기대보다 작다며 반품 요청. 개봉 제품이라 단순 변심 반품 불가 안내"),
                        ("한승우", "2026-09-28", "이어폰 한쪽에서 소리가 나지 않음. 제품 불량으로 전액 환불"),
                        ("오세린", "2026-10-02", "주문 후 일주일째 배송 미도착. 택배사 확인 후 적립금 3,000원 지급"),
                    ],
                )


# ---------- 읽기 전용 함수 (AI 에이전트에게 도구로 제공) ----------

def get_order(order_id: str) -> dict | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,)).fetchone()


def get_shipment(order_id: str) -> dict | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM shipments WHERE order_id = %s", (order_id,)).fetchone()


def get_past_tickets(customer: str) -> list[dict]:
    with connect() as conn:
        return conn.execute(
            "SELECT date, summary FROM past_tickets WHERE customer = %s ORDER BY date DESC", (customer,)
        ).fetchall()


# ---------- 쓰기 함수 (AI는 못 부르고, 사람 승인 뒤 일반 코드만 호출) ----------

def record_action(order_id: str, kind: str, amount: int, reason: str, approved_by: str) -> int:
    with connect() as conn:
        row = conn.execute(
            "INSERT INTO actions (order_id, kind, amount, reason, approved_by) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (order_id, kind, amount, reason, approved_by),
        ).fetchone()
        return row["id"]


# ---------- 티켓 (API 서버가 진행 상태를 기록) ----------

def create_ticket(ticket_id: str, email: str) -> dict:
    with connect() as conn:
        return conn.execute(
            "INSERT INTO tickets (id, email, status) VALUES (%s, %s, 'processing') RETURNING *",
            (ticket_id, email),
        ).fetchone()


def update_ticket(ticket_id: str, **fields) -> None:
    fields = {k: Jsonb(v) if isinstance(v, dict) else v for k, v in fields.items()}
    query = sql.SQL("UPDATE tickets SET {}, updated_at = now() WHERE id = %s").format(
        sql.SQL(", ").join(sql.SQL("{} = %s").format(sql.Identifier(k)) for k in fields)
    )
    with connect() as conn:
        conn.execute(query, (*fields.values(), ticket_id))


def claim_for_decision(ticket_id: str, reviewer: str) -> bool:
    """승인 대기 건만 '처리 중'으로 바꾼다. 두 사람이 동시에 눌러도 한 명만 성공한다."""
    with connect() as conn:
        row = conn.execute(
            """UPDATE tickets SET status = 'processing', reviewer = %s, updated_at = now()
               WHERE id = %s AND status = 'pending_approval' RETURNING id""",
            (reviewer, ticket_id),
        ).fetchone()
    return row is not None


def get_ticket(ticket_id: str) -> dict | None:
    with connect() as conn:
        return conn.execute("SELECT * FROM tickets WHERE id = %s", (ticket_id,)).fetchone()


def list_tickets(status: str | None = None, limit: int = 50) -> list[dict]:
    with connect() as conn:
        if status:
            return conn.execute(
                "SELECT * FROM tickets WHERE status = %s ORDER BY created_at DESC LIMIT %s", (status, limit)
            ).fetchall()
        return conn.execute("SELECT * FROM tickets ORDER BY created_at DESC LIMIT %s", (limit,)).fetchall()
