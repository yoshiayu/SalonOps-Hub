"use client";

import type { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export function ShellGate({ children }: PropsWithChildren) {
  const pathname = usePathname();
  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
