// FastAPI(backend) 호출. 서버 컴포넌트와 서버 액션에서만 쓴다.
// 브라우저가 백엔드를 직접 부르지 않으므로 CORS 설정이나 공개 환경변수가 필요 없다.

import type { Ticket, TicketStatus } from "./types";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.detail ?? `백엔드 오류 (${res.status})`);
  }
  return res.json();
}

export function listTickets(status?: TicketStatus) {
  return request<Ticket[]>(`/tickets${status ? `?status=${status}` : ""}`);
}

export function getTicket(id: string) {
  return request<Ticket>(`/tickets/${encodeURIComponent(id)}`);
}

export function createTicket(email: string) {
  return request<Ticket>("/tickets", { method: "POST", body: JSON.stringify({ email }) });
}

export function decideTicket(id: string, decision: { approved: boolean; reviewer: string; note: string }) {
  return request<Ticket>(`/tickets/${encodeURIComponent(id)}/decision`, {
    method: "POST",
    body: JSON.stringify(decision),
  });
}
