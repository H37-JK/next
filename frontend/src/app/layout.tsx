import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "고객 불만 처리",
  description: "AI가 분석한 고객 불만 처리안을 직원이 승인하는 화면",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <Link href="/tickets" className="font-bold">
              고객 불만 처리
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
