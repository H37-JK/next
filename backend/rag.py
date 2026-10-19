"""
RAG: 의미로 찾는 검색 (PostgreSQL + pgvector).

- 규정 문서(docs/*.md)를 '## 제목' 단위 조각으로 잘라 벡터로 저장하고, 질문과 뜻이 가까운 조각을 찾는다.
- 과거 상담 이력(past_tickets)도 벡터로 저장해서, 이름이 달라도 비슷한 불만 사례를 찾는다.

임베딩(글 → 숫자 벡터)은 로컬 모델(fastembed)로 만든다. 추가 API 키가 필요 없고,
처음 실행할 때 모델 파일(약 2.2GB)을 한 번 내려받는다.

문서를 고친 뒤 다시 색인하려면:
    uv run --env-file .env rag.py
"""

from pathlib import Path

from fastembed import TextEmbedding
from pgvector.psycopg import register_vector

import db

# 한국어 검색 품질 비교에서 가장 나았던 모델. 더 가볍게 하려면
# "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"(384차원, 220MB)도 되지만 정확도가 떨어진다.
EMBED_MODEL = "intfloat/multilingual-e5-large"
EMBED_DIM = 1024
DOCS_DIR = Path(__file__).parent / "docs"

_model: TextEmbedding | None = None


def embed(texts: list[str], kind: str = "passage") -> list:
    """글 여러 개를 벡터로 바꾼다. 모델은 처음 한 번만 불러온다.
    e5 모델은 저장할 글엔 'passage: ', 검색어엔 'query: '를 앞에 붙여야 성능이 난다."""
    global _model
    if _model is None:
        _model = TextEmbedding(EMBED_MODEL)
    return list(_model.embed([f"{kind}: {t}" for t in texts]))


def connect():
    conn = db.connect()
    register_vector(conn)  # numpy 배열 <-> vector 타입 자동 변환
    return conn


# ---------- 색인 (일반 코드가 미리 해 둠) ----------

def _split_markdown(path: Path) -> list[tuple[str, str]]:
    """'## 제목' 단위로 잘라 (제목, 본문) 목록을 만든다."""
    chunks, title, lines = [], None, []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## "):
            if title and lines:
                chunks.append((title, "\n".join(lines).strip()))
            title, lines = line[3:].strip(), []
        elif title:
            lines.append(line)
    if title and lines:
        chunks.append((title, "\n".join(lines).strip()))
    return chunks


def init_rag(reindex_docs: bool = False) -> None:
    """pgvector를 켜고 규정 문서와 과거 이력을 벡터로 저장한다. 이미 있으면 빠진 것만 채운다."""
    with db.connect() as conn:
        conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    with connect() as conn:
        conn.execute(
            f"""
            CREATE TABLE IF NOT EXISTS policy_chunks (
                id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                source    TEXT NOT NULL,
                title     TEXT NOT NULL,
                content   TEXT NOT NULL,
                embedding vector({EMBED_DIM}) NOT NULL
            );
            ALTER TABLE past_tickets ADD COLUMN IF NOT EXISTS embedding vector({EMBED_DIM});
            """
        )

        # 1) 규정 문서 색인
        if reindex_docs:
            conn.execute("DELETE FROM policy_chunks")
        if conn.execute("SELECT COUNT(*) AS n FROM policy_chunks").fetchone()["n"] == 0:
            rows = [(p.name, t, c) for p in sorted(DOCS_DIR.glob("*.md")) for t, c in _split_markdown(p)]
            vectors = embed([f"{t}\n{c}" for _, t, c in rows])
            with conn.cursor() as cur:
                cur.executemany(
                    "INSERT INTO policy_chunks (source, title, content, embedding) VALUES (%s, %s, %s, %s)",
                    [(s, t, c, v) for (s, t, c), v in zip(rows, vectors)],
                )
            print(f"[RAG] 규정 문서 {len(rows)}조각 색인")

        # 2) 과거 이력 중 아직 벡터가 없는 것만 채움
        todo = conn.execute("SELECT id, summary FROM past_tickets WHERE embedding IS NULL").fetchall()
        if todo:
            vectors = embed([r["summary"] for r in todo])
            with conn.cursor() as cur:
                cur.executemany(
                    "UPDATE past_tickets SET embedding = %s WHERE id = %s",
                    [(v, r["id"]) for r, v in zip(todo, vectors)],
                )
            print(f"[RAG] 과거 이력 {len(todo)}건 색인")


# ---------- 검색 (AI 에이전트에게 읽기 전용 도구로 제공) ----------
# <=> 는 pgvector의 코사인 거리. 1 - 거리 = 유사도(1에 가까울수록 비슷함)

def search_policy(question: str, k: int = 3) -> list[dict]:
    [vec] = embed([question], kind="query")
    with connect() as conn:
        return conn.execute(
            """
            SELECT title, content, round((1 - (embedding <=> %s))::numeric, 3)::float8 AS similarity
            FROM policy_chunks ORDER BY embedding <=> %s LIMIT %s
            """,
            (vec, vec, k),
        ).fetchall()


def search_similar_tickets(complaint: str, k: int = 3) -> list[dict]:
    [vec] = embed([complaint], kind="query")
    with connect() as conn:
        return conn.execute(
            """
            SELECT customer, date, summary, round((1 - (embedding <=> %s))::numeric, 3)::float8 AS similarity
            FROM past_tickets WHERE embedding IS NOT NULL ORDER BY embedding <=> %s LIMIT %s
            """,
            (vec, vec, k),
        ).fetchall()


if __name__ == "__main__":
    db.init_db()
    init_rag(reindex_docs=True)
    for q in ["개봉한 이어폰 소리가 작아서 반품하고 싶어요", "시계 전원이 안 켜져요"]:
        print(f"\n질문: {q}")
        for r in search_policy(q):
            print(f"  규정 {r['similarity']}  {r['title']}")
        for r in search_similar_tickets(q):
            print(f"  사례 {r['similarity']}  {r['summary']}")
