import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AutoRefresh } from "@/components/AutoRefresh";
import { DecisionForm } from "@/components/DecisionForm";
import { StatusBadge } from "@/components/StatusBadge";
import { ApiError, getTicket } from "@/lib/api";

export default function TicketPage({ params }: PageProps<"/tickets/[id]">) {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/tickets" className="text-sm text-neutral-500 hover:underline">
        ← 목록
      </Link>
      <Suspense fallback={<p className="text-sm text-neutral-500">불러오는 중...</p>}>
        {params.then(({ id }) => (
          <TicketDetail id={id} />
        ))}
      </Suspense>
    </div>
  );
}

async function TicketDetail({ id }: { id: string }) {
  const ticket = await getTicket(id).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const p = ticket.pending?.proposal;
  const order = ticket.pending?.order;

  return (
    <>
      {ticket.status === "processing" && <AutoRefresh />}
      <div className="flex items-center gap-3">
        <StatusBadge status={ticket.status} />
        <span className="text-xs text-neutral-500">{ticket.id}</span>
      </div>

      <Section title="고객 메일">
        <p className="whitespace-pre-wrap text-sm">{ticket.email}</p>
      </Section>

      {ticket.status === "processing" && !p && (
        <p className="text-sm text-neutral-500">AI가 분류·분석 중입니다. 화면이 자동으로 갱신됩니다.</p>
      )}

      {ticket.pending && p && (
        <Section title="AI 해결안">
          <dl className="grid grid-cols-[6rem_1fr] gap-y-1 text-sm">
            {order && (
              <>
                <dt className="text-neutral-500">주문</dt>
                <dd>
                  {order.order_id} / {order.customer} / {order.product} / {order.amount.toLocaleString()}원
                </dd>
              </>
            )}
            <dt className="text-neutral-500">분류</dt>
            <dd>{ticket.pending.category}</dd>
            <dt className="text-neutral-500">제안</dt>
            <dd className="font-medium">
              {p.action}
              {p.amount ? ` ${p.amount.toLocaleString()}원` : ""}
            </dd>
            <dt className="text-neutral-500">사유</dt>
            <dd>{p.reason}</dd>
            <dt className="text-neutral-500">근거</dt>
            <dd className="whitespace-pre-wrap">{p.summary}</dd>
          </dl>
        </Section>
      )}

      {ticket.status === "pending_approval" && (
        <Section title="승인">
          <DecisionForm ticketId={ticket.id} />
        </Section>
      )}

      {ticket.status === "failed" && (
        <Section title="오류">
          <p className="whitespace-pre-wrap text-sm text-red-600">{ticket.error}</p>
        </Section>
      )}

      {ticket.status === "done" && (
        <Section title="처리 결과">
          <p className="text-sm">
            {ticket.result}
            {ticket.reviewer && <span className="text-neutral-500"> · 승인자 {ticket.reviewer}</span>}
          </p>
          <h4 className="mt-3 text-sm text-neutral-500">답장 초안</h4>
          <p className="whitespace-pre-wrap rounded bg-neutral-100 p-3 text-sm dark:bg-neutral-900">{ticket.reply}</p>
        </Section>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  );
}
