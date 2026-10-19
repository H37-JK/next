# frontend — 직원 승인 화면 (Next.js)

전체 설명과 실행 순서는 [../README.md](../README.md)를 본다.

```bash
npm install
npm run dev      # http://localhost:3000 (백엔드가 :8000에서 돌고 있어야 함)
npm run build    # 배포용 빌드
npm run lint
```

## 구조 원칙

- **브라우저는 백엔드를 직접 부르지 않는다.** 데이터 조회는 서버 컴포넌트, 접수·승인은 서버 액션(`src/app/actions.ts`)이 `src/lib/api.ts`를 통해 FastAPI를 부른다. 그래서 백엔드 주소(`BACKEND_URL`)는 공개되지 않고 CORS도 필요 없다.
- 이 프로젝트는 `cacheComponents`가 켜져 있다(Next.js 16 기본). 매번 새로 받아야 하는 데이터는 `<Suspense>` 안에서 불러오고, `params`/`searchParams`는 Promise다.
- AI 처리 중인 화면은 `AutoRefresh` 컴포넌트가 3초마다 `router.refresh()`로 다시 불러온다.
- 새 페이지를 추가하면 `npx next typegen`으로 라우트 타입(`PageProps<"/경로">`)을 갱신한다 (`npm run dev`/`build` 중에는 자동).
