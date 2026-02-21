import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import { ShellGate } from "@/components/layout/shell-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "SalonOps Hub",
  description: "業務標準化・KPI可視化・レポート自動化基盤"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <QueryProvider>
          <ShellGate>{children}</ShellGate>
        </QueryProvider>
      </body>
    </html>
  );
}
