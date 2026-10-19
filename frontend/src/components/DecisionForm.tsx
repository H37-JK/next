"use client";

import { useActionState } from "react";

import { decideAction } from "@/app/actions";

const input = "rounded border border-neutral-300 bg-transparent p-2 text-sm dark:border-neutral-700";

export function DecisionForm({ ticketId }: { ticketId: string }) {
  const [state, action, pending] = useActionState(decideAction.bind(null, ticketId), {});
  return (
    <form action={action} className="flex flex-col gap-2">
      {/* 로그인을 붙이면 승인자는 로그인 정보에서 가져온다 */}
      <input name="reviewer" placeholder="승인자 이름" className={input} />
      <input name="note" placeholder="메모 (거절 사유 등)" className={input} />
      <div className="flex items-center gap-2">
        <button
          name="decision"
          value="approve"
          disabled={pending}
          className="rounded bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          승인
        </button>
        <button
          name="decision"
          value="reject"
          disabled={pending}
          className="rounded bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          거절 (담당자 이관)
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
