import { STATUS_LABEL, type TicketStatus } from "@/lib/types";

const COLOR: Record<TicketStatus, string> = {
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  pending_approval: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  done: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
