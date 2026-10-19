// backend/api.py 응답 형태와 맞춘 타입

export type TicketStatus = "processing" | "pending_approval" | "done" | "failed";

export type Order = {
  order_id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: string;
  order_date: string;
};

export type Proposal = {
  action: "환불" | "교환" | "안내" | "확인필요";
  amount: number;
  reason: string;
  summary: string;
};

export type Ticket = {
  id: string;
  email: string;
  status: TicketStatus;
  pending: { order: Order | null; category: string; proposal: Proposal } | null;
  reviewer: string | null;
  result: string | null;
  reply: string | null;
  reply_path: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

export const STATUS_LABEL: Record<TicketStatus, string> = {
  processing: "처리 중",
  pending_approval: "승인 대기",
  done: "완료",
  failed: "실패",
};
