"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "/app/", label: "Command" },
  { href: "/app/cues/", label: "Cue inbox" },
  { href: "/app/ledger/", label: "Ledger" },
  { href: "/app/reconciliation/", label: "Reconciliation" },
  { href: "/app/audit/", label: "Audit" },
];

export function AppShell({
  children,
  actorName,
  onReset,
}: {
  children: React.ReactNode;
  actorName?: string;
  onReset?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="cue-shell min-h-screen">
      <header className="border-b border-cue-line/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <LogoWordmark />
          <nav className="flex flex-wrap items-center gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/app/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-cue-navy text-white"
                      : "text-cue-slate hover:bg-cue-mist hover:text-cue-navy",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm text-cue-slate">
            {actorName ? <span className="hidden sm:inline">Acting as {actorName}</span> : null}
            {onReset ? (
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg border border-cue-line bg-white px-3 py-1.5 font-semibold text-cue-navy hover:border-cue-navy/30"
              >
                Reset demo
              </button>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
