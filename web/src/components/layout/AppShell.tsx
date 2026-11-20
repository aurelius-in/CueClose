"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoWordmark } from "@/components/brand/Logo";
import type { DemoEdition } from "@/lib/edition";
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
  edition,
  onEditionChange,
  onReset,
}: {
  children: React.ReactNode;
  actorName?: string;
  edition?: DemoEdition;
  onEditionChange?: (edition: DemoEdition) => void;
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
          <div className="flex flex-wrap items-center gap-3 text-sm text-cue-slate">
            {edition && onEditionChange ? (
              <label className="flex items-center gap-2 rounded-lg border border-cue-line bg-white px-2 py-1.5">
                <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-cue-slate sm:inline">
                  Edition
                </span>
                <select
                  className="rounded-md border-0 bg-transparent text-sm font-semibold text-cue-navy outline-none"
                  value={edition}
                  onChange={(event) => onEditionChange(event.target.value as DemoEdition)}
                >
                  <option value="baseline">Baseline</option>
                  <option value="pilot">Northline pilot</option>
                </select>
              </label>
            ) : null}
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
        {edition === "pilot" ? (
          <div className="border-t border-[#C9894A]/25 bg-[#FBF6F0] px-4 py-2 text-center text-xs font-semibold tracking-wide text-[#7A4E24] sm:px-6 lg:px-8">
            Northline pilot slice · waiting-on-me, show filters, duplicate acknowledge gate
          </div>
        ) : (
          <div className="border-t border-cue-line/70 bg-cue-paper/80 px-4 py-2 text-center text-xs font-semibold tracking-wide text-cue-slate sm:px-6 lg:px-8">
            Baseline edition · pre-Northline ask surface for side-by-side comparison
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
