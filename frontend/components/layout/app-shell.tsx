"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";
import { Activity, Database, FileText, Home, ListTodo, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/imports", label: "Data Import", icon: Database },
  { href: "/masters", label: "Masters", icon: Activity },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/audit", label: "Audit", icon: Shield },
  { href: "/items", label: "Items", icon: ListTodo },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937_0%,#0f172a_45%,#09090b_100%)] text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-white/10 bg-black/25 backdrop-blur">
          <div className="border-b border-white/10 px-5 py-6">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">SalonOps Hub</p>
            <h1 className="mt-2 text-xl font-semibold text-white">Operations Control</h1>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-zinc-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="px-4 py-6 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
