import Link from "next/link";
import { Suspense } from "react";

import { AutoRefresh } from "@/components/AutoRefresh";
import { NewTicketForm } from "@/components/NewTicketForm";
import { StatusBadge } from "@/components/StatusBadge";
import { listTickets } from "@/lib/api";
import { STATUS_LABEL, type TicketStatus } from "@/lib/types";

const TABS: (TicketStatus | undefined)[] = [undefined, "pending_approval", "processing", "done", "failed"];

function isStatus(v: unknown): v is TicketStatus {
  return typeof v === "string" && v in STATUS_LABEL;
}

export default function TicketsPage({ searchParams }: PageProps<"/tickets">) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <h2 className="font-semibold">새 메일 접수</h2>
        <NewTicketForm />
      </section>
      <section className="flex flex-col gap-3">
        <Suspense fallback={<p className="text-sm text-neutral-500">불러오는 중...</p>}>
          {searchParams.then(({ status }) => (
            <TicketList status={isStatus(status) ? status : undefined} />
          ))}
        </Suspense>
      </section>
    </div>
  );
}

async function TicketList({ status }: { status?: TicketStatus }) {
  const tickets = await listTickets(status);
  return (
    <>
      <nav className="flex flex-wrap gap-2 text-sm">
        {TABS.map((tab) => (
          <Link
            key={tab ?? "all"}
            href={tab ? `/tickets?status=${tab}` : "/tickets"}
            className={`rounded px-3 py-1 ${
              tab === status
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "border border-neutral-300 dark:border-neutral-700"
            }`}
          >
            {tab ? STATUS_LABEL[tab] : "전체"}
          </Link>
        ))}
      </nav>
      {tickets.some((t) => t.status === "processing") && <AutoRefresh />}
      {tickets.length === 0 ? (
        <p className="text-sm text-neutral-500">티켓이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-neutral-200 rounded border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {tickets.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tickets/${t.id}`}
                className="flex items-center gap-3 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <StatusBadge status={t.status} />
                <span className="flex-1 truncate text-sm">{t.email}</span>
                <span className="text-xs text-neutral-500">{new Date(t.created_at).toLocaleString("ko-KR")}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
