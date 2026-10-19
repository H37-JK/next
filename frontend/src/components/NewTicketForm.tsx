"use client";

import { useActionState } from "react";

import { createTicketAction } from "@/app/actions";

export function NewTicketForm() {
  const [state, action, pending] = useActionState(createTicketAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <textarea
        name="email"
        rows={3}
        placeholder="고객 메일 내용 (예: A-1026 스마트워치 전원이 안 켜져요)"
        className="rounded border border-neutral-300 bg-transparent p-2 text-sm dark:border-neutral-700"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {pending ? "접수 중..." : "메일 접수"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
