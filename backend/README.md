# 고객 불만 메일 자동 처리 (LangGraph + Claude Agent SDK + LangChain + LangSmith)

고객 불만 메일을 받아 분류하고, 원인을 분석하고, **담당자 승인을 받은 뒤** 처리 기록과 답장을 만드는 예제 프로그램이다.
예제 DB(PostgreSQL, Docker로 실행)와 예제 데이터가 함께 들어 있어서 API 키만 있으면 바로 돌려 볼 수 있다.
패키지 관리는 [uv](https://docs.astral.sh/uv/)로 한다.

## 흐름

```
접수(코드) → 분류(LangChain, Haiku)
              ├─ 배송지연 → 배송 조회(코드) ──────────┐
              └─ 그 외   → 원인 분석(Claude 에이전트) ─┤
                                                      ↓
                                              담당자 승인 (멈춤)
                                   ├─ 승인 → DB에 처리 기록(코드) ─┐
                                   └─ 거절 → 담당자 이관(코드) ────┤
                                                                   ↓
                                                답장 작성(LangChain) → outbox 폴더에 저장
```

| 도구 | 맡은 일 | 파일 위치 |
| --- | --- | --- |
| LangGraph | 전체 순서도, 승인 단계에서 멈췄다가 이어서 실행 | `workflow.py` 5번 `build_app()` |
| Claude Agent SDK | 원인 분석. 어떤 데이터를 어떤 순서로 볼지 Claude가 판단 | `workflow.py` 3번 `analyze()` |
| LangChain | 작은 모델로 분류(결과 형식 강제)와 답장 작성 | `workflow.py` 2번, `draft_reply()` |
| RAG (pgvector) | 규정 문서·비슷한 과거 사례를 '뜻'으로 검색해 에이전트에게 근거로 제공 | `rag.py`, `docs/` |
| LangSmith | 모든 단계의 입력·출력·시간·비용 기록 (선택) | 환경변수만 설정 |

## RAG: SQL 조회와 벡터 검색을 같이 쓴다

에이전트가 쓰는 도구는 두 종류다.

| 도구 | 찾는 방법 | 언제 |
| --- | --- | --- |
| `get_order`, `get_shipment`, `get_past_tickets` | SQL (정확한 키) | 주문번호·고객 이름처럼 열쇠가 있을 때 |
| `search_policy` | 벡터 검색 (뜻) | "개봉한 스피커도 반품되나?" 같은 규정 근거 찾기 |
| `search_similar_cases` | 벡터 검색 (뜻) | 다른 고객의 비슷한 불만은 어떻게 처리했는지 |

- 규정 문서는 `docs/*.md`에 있고, `## 제목` 단위로 잘라 PostgreSQL의 `policy_chunks` 테이블에 벡터로 저장한다.
- 과거 상담 이력(`past_tickets`)에도 벡터 열을 붙여서 의미로 찾는다.
- 벡터DB를 따로 두지 않고 같은 PostgreSQL에 pgvector 확장을 켜서 쓴다.
- 임베딩은 로컬 모델 `intfloat/multilingual-e5-large`(fastembed)로 만든다. 추가 API 키는 필요 없지만, **처음 실행할 때 모델 파일 약 2.2GB를 내려받는다.**
- 규정 문서를 고치면 `uv run --env-file .env rag.py`로 다시 색인한다 (검색 결과 미리보기도 출력된다).

## 안전장치

- Claude 에이전트에게는 **읽기 전용 도구 5개만** 준다 (SQL 조회 3개 + 벡터 검색 2개). 파일·터미널 등 기본 도구는 `tools=[]`로 전부 끈다.
- DB에 쓰는 함수(`db.record_action`)는 AI 도구로 등록하지 않았다. **승인 후 일반 코드만** 호출한다.
- AI가 제안한 환불 금액이 주문 금액보다 크면 코드가 주문 금액으로 깎는다.
- 에이전트는 최대 8턴, 건당 $0.5까지만 쓴다 (`max_turns`, `max_budget_usd`).
- 주문을 못 찾았거나 AI가 판단을 못 한 건은 승인해도 담당자에게 넘긴다.

## 실행 방법

준비물: [uv](https://docs.astral.sh/uv/getting-started/installation/), Docker Desktop

```bash
cd backend
uv sync                          # .venv 생성 + 패키지 설치 (pyproject.toml 기준)
docker compose -f ../docker-compose.yml up -d   # 예제 PostgreSQL 켜기 (localhost:5432)

cp .env .env             # Windows PowerShell: Copy-Item .env .env
# .env 파일을 열어 ANTHROPIC_API_KEY 를 채운다 (Claude Console에서 발급)

uv run --env-file .env main.py                                  # 예제 메일 3건 처리
uv run --env-file .env main.py "A-1026 시계 화면이 안 켜져요"   # 직접 쓴 메일 1건
```

테이블과 예제 데이터, 벡터 색인은 처음 실행할 때 `db.init_db()`와 `rag.init_rag()`가 자동으로 만든다.
실행하면 승인 단계마다 터미널에 해결안이 나오고 `y`(승인) / `n`(거절)을 묻는다.
처리 기록은 PostgreSQL의 `actions` 테이블에, 답장은 `outbox/` 폴더에 저장된다.
예제 데이터를 처음 상태로 되돌리려면 프로젝트 맨 위 폴더에서 `docker compose down -v` 후 `docker compose up -d`로 DB를 새로 만들고 다시 실행하면 된다.

이미 있는 PostgreSQL을 쓰려면 `.env`의 `DATABASE_URL`만 그 주소로 바꾸면 된다 (Docker 불필요).

### 직원용 API 서버로 실행 (FastAPI)

터미널에서 y/n 대신, 직원 화면(웹·앱)이 부를 API 서버로 돌린다.

```bash
uv run --env-file .env uvicorn api:app --reload
```

브라우저에서 http://localhost:8000/docs 를 열면 API를 바로 눌러 볼 수 있다.

| 요청 | 하는 일 |
| --- | --- |
| `POST /tickets` `{"email": "..."}` | 메일 접수. 바로 202를 돌려주고, 백그라운드에서 분류·분석 후 `pending_approval`로 멈춘다 |
| `GET /tickets?status=pending_approval` | 승인 대기 목록 |
| `GET /tickets/{id}` | 한 건 상세: `pending`(주문·분류·해결안), `result`, `reply`, `error` |
| `POST /tickets/{id}/decision` `{"approved": true, "reviewer": "김팀장", "note": ""}` | 승인/거절. 백그라운드에서 실행·답장 작성 후 `done` |

- 티켓 상태: `processing`(AI 처리 중) → `pending_approval`(승인 대기) → `processing` → `done`. AI 호출이 실패하면 `failed`와 `error`가 남는다.
- AI 처리는 수십 초 걸릴 수 있어서, 화면은 몇 초마다 `GET /tickets/{id}`로 상태를 다시 조회하면 된다.
- 승인 대기 상태는 LangGraph `PostgresSaver`로 PostgreSQL에 저장된다. 서버를 껐다 켜도 대기 건이 남는다.
- 두 사람이 같은 건을 동시에 승인하면 한 명만 성공하고 나머지는 409를 받는다.
- 아직 로그인이 없어서 `reviewer`는 요청에 직접 적는다. 정식으로 쓰려면 사내 로그인(SSO)을 붙여 거기서 가져와야 한다.
- 직원 화면은 `../frontend`(Next.js)에 있다. Next.js 서버가 이 API를 대신 부르므로 CORS 설정은 없다.

### LangSmith로 기록 보기 (선택)

```bash
# .env 에서 아래 세 줄의 주석(#)을 풀고 키를 채운다
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_...       # smith.langchain.com 에서 발급
LANGSMITH_PROJECT=complaint-bot
```

LangSmith 웹 화면에서 메일 한 건마다 분류 → 분석 → 승인 → 답장이 한 줄로 이어져 보이고, 단계별 소요 시간과 토큰 비용을 확인할 수 있다.

## 실제 회사에 붙일 때 바꾸는 곳

| 지금 (예제) | 실제 운영 |
| --- | --- |
| `docker-compose.yml`의 예제 PostgreSQL | `DATABASE_URL`을 회사 DB로 교체, 쿼리는 회사 테이블에 맞게 수정 (AI 조회용 계정은 SELECT만 허용) |
| `main.py`의 `input()` 승인 | `api.py`(FastAPI)를 부르는 사내 웹 화면이나 슬랙 버튼 |
| `reviewer`를 요청에 직접 입력 | 사내 로그인(SSO)에서 직원 정보 가져오기 |
| `docs/환불교환규정.md` 예제 규정 | 회사 실제 규정·FAQ·매뉴얼을 `docs/`에 넣고 다시 색인 |
| `outbox/` 폴더에 답장 저장 | SMTP나 메일 서비스 API로 발송 |
| `SAMPLE_EMAILS` 목록 | 메일함을 주기적으로 읽어 새 메일마다 `handle()` 호출 |

## 확인한 것

AI 호출 부분을 가짜 응답으로 바꿔 전체 흐름(분기, 승인 멈춤과 재개, 금액 상한, DB 기록, 답장 저장)이 끝까지 도는 것을 확인했다.
실제 API 키로 Claude를 호출하는 테스트는 하지 못했으니, 처음 돌릴 때 에러가 나면 메시지를 그대로 알려 주면 된다.
모델 이름(`claude-haiku-5-5`, `claude-sonnet-5-5`)은 `workflow.py` 위쪽에서 바꿀 수 있다.
