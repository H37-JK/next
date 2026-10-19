"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** AI가 처리 중인 동안 몇 초마다 서버 데이터를 다시 불러온다. */
export function AutoRefresh({ seconds = 3 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);
  return null;
}
