"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import * as api from "@/lib/api";

export type FormState = { error?: string };

export async function createTicketAction(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "메일 내용을 입력하세요." };
  let id: string;
  try {
    id = (await api.createTicket(email)).id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "접수 실패" };
  }
  redirect(`/tickets/${id}`);
}

export async function decideAction(id: string, _: FormState, formData: FormData): Promise<FormState> {
  const reviewer = String(formData.get("reviewer") ?? "").trim();
  if (!reviewer) return { error: "승인자 이름을 입력하세요." };
  try {
    await api.decideTicket(id, {
      approved: formData.get("decision") === "approve",
      reviewer,
      note: String(formData.get("note") ?? ""),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "처리 실패" };
  }
  refresh();
  return {};
}
