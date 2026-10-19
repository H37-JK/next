# 고객 불만 처리 시스템

AI가 고객 불만 메일을 분류·분석해 해결안을 만들고, 직원이 웹 화면에서 승인하면 처리 기록과 답장을 만든다.

```
브라우저 ──▶ frontend (Next.js, :3000) ──▶ backend (FastAPI, :8000) ──▶ PostgreSQL + pgvector (:5432)
              직원 승인 화면                 LangGraph 순서도               주문·배송·티켓·규정 벡터
              서버 액션으로 API 호출          Claude 에이전트 + RAG          승인 대기 상태(체크포인트)
```

## 폴더 구조

```
next/
├─ docker-compose.yml        PostgreSQL 17 + pgvector
├─ backend/                  Python (uv)
│  ├─ api.py                 FastAPI: 티켓 접수·조회·승인
│  ├─ workflow.py            LangGraph 순서도 (분류 → 분석 → 승인 → 실행 → 답장)
│  ├─ rag.py                 pgvector 의미 검색 (규정 문서, 비슷한 과거 사례)
│  ├─ db.py                  PostgreSQL 조회·기록
│  ├─ main.py                터미널에서 y/n으로 승인하는 버전
│  ├─ docs/                  RAG에 넣는 규정 문서 (*.md)
│  └─ README.md              백엔드 상세 설명
└─ frontend/                 Next.js 16 (App Router, TypeScript, Tailwind)
   └─ src/
      ├─ app/
      │  ├─ tickets/page.tsx        티켓 목록 + 새 메일 접수
      │  ├─ tickets/[id]/page.tsx   상세 + 승인/거절
      │  └─ actions.ts              서버 액션 (접수, 승인)
      ├─ components/                StatusBadge, NewTicketForm, DecisionForm, AutoRefresh
      └─ lib/
         ├─ api.ts                  FastAPI 호출 (서버에서만)
         └─ types.ts                API 응답 타입
```

## 처음 실행

준비물: [uv](https://docs.astral.sh/uv/getting-started/installation/), Node.js 20 이상, Docker Desktop

```bash
# 1) DB
docker compose up -d

# 2) 백엔드 (터미널 1)
cd backend
uv sync
cp .env .env              # ANTHROPIC_API_KEY 채우기
uv run --env-file .env uvicorn api:app --reload

# 3) 프론트엔드 (터미널 2)
cd frontend
npm install
cp .env .env.local        # BACKEND_URL (기본값 그대로면 생략 가능)
npm run dev
```

http://localhost:3000 을 열면 된다. API 문서는 http://localhost:8000/docs.

- 백엔드는 처음 켤 때 테이블·예제 데이터·벡터 색인을 만들고, 임베딩 모델(약 2.2GB)을 한 번 내려받는다.
- Windows PowerShell에서는 `cp` 대신 `Copy-Item`을 쓴다.

## 화면 흐름

1. 목록 화면에서 고객 메일을 붙여 넣고 **메일 접수** → 상세 화면으로 이동
2. AI가 분석하는 동안 "처리 중" (3초마다 자동 갱신)
3. "승인 대기"가 되면 주문 정보와 AI 해결안·근거가 보인다 → 승인자 이름을 적고 **승인** 또는 **거절**
4. "완료"가 되면 처리 결과와 고객 답장 초안이 보인다

## 다음에 할 것

- 직원 로그인 (지금은 승인자 이름을 직접 입력) → Next.js에 인증을 붙이고 백엔드는 토큰으로 직원 확인
- 처리 도중 서버가 꺼진 티켓("처리 중"으로 남음) 다시 실행하는 버튼
- 답장 실제 발송 (지금은 `backend/outbox/`에 파일로 저장)
- 데스크탑 앱이 필요하면 이 웹 화면을 Tauri로 감싸기
