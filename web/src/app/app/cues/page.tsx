"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useDemo } from "@/components/demo/DemoProvider";
import { api, type Cue, type Show } from "@/lib/api";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";

function CuesPageInner() {
  const searchParams = useSearchParams();
  const { edition } = useDemo();
  const isPro = edition === "pro";
  const [cues, setCues] = useState<Cue[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [showFilter, setShowFilter] = useState<string>(searchParams.get("show") ?? "all");
  const [waitingOnly, setWaitingOnly] = useState(searchParams.get("waiting") === "1");
  const [waitingIds, setWaitingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [cueList, dashboard] = await Promise.all([api.cues(), api.dashboard()]);
        setCues(cueList);
        setShows(dashboard.shows);
        setWaitingIds(new Set(dashboard.waiting_on_me.map((item) => item.id)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cues");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return cues.filter((cue) => {
      if (isPro && showFilter !== "all" && cue.suggested_show_id !== showFilter) return false;
      if (isPro && waitingOnly && !waitingIds.has(cue.id)) return false;
      if (!isPro && cue.id === "cue_006") return false;
      return true;
    });
  }, [cues, showFilter, waitingOnly, waitingIds, isPro]);

  if (loading) return <p className="text-cue-slate">Loading ambient cues…</p>;
  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-white p-6">
        <p className="text-cue-navy">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cue-green">Inbox</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-cue-navy">Ambient cues</h1>
        <p className="mt-2 max-w-2xl text-cue-slate">
          {isPro
            ? "Filter by show for the city you own. Waiting-on-me mirrors the active persona's queue from Command."
            : "Each cue preserves source evidence and a model recommendation. Nothing posts until a server-checked approval path succeeds."}
        </p>
      </div>

      {isPro ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-cue-line/80 bg-white/90 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-cue-slate">
              Show / venue
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-cue-line bg-cue-paper px-3 py-3 text-sm font-semibold text-cue-navy"
              value={showFilter}
              onChange={(event) => setShowFilter(event.target.value)}
            >
              <option value="all">All shows</option>
              {shows.map((show) => (
                <option key={show.id} value={show.id}>
                  {show.name} · {show.venue}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-cue-line bg-cue-paper px-4 py-3 text-sm font-semibold text-cue-navy">
            <input
              type="checkbox"
              checked={waitingOnly}
              onChange={(event) => setWaitingOnly(event.target.checked)}
              className="h-4 w-4 accent-[var(--cue-green)]"
            />
            Waiting on me ({waitingIds.size})
          </label>
        </div>
      ) : null}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-cue-line bg-white/70 p-8 text-center text-cue-slate">
            No cues match this filter.
          </div>
        ) : null}
        {filtered.map((cue) => (
          <div
            key={cue.id}
            className="flex flex-col gap-4 rounded-2xl border border-cue-line/80 bg-white/90 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold text-cue-navy">{cue.vendor_name}</h2>
                <StatusBadge status={cue.status} />
                {isPro && waitingIds.has(cue.id) ? (
                  <span className="rounded-md bg-cue-mist px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-cue-navy">
                    Waiting on me
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-cue-slate">{cue.description}</p>
              <p className="mt-2 font-mono text-xs text-cue-slate">
                {cue.invoice_number} · {cue.suggested_show_id ?? "unassigned show"} · received{" "}
                {new Date(cue.received_at).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-display text-2xl font-bold text-cue-navy">
                  {money(cue.amount)}
                </div>
                <div className="text-xs text-cue-slate">
                  conf{" "}
                  {cue.recommendation
                    ? `${Math.round(cue.recommendation.confidence * 100)}%`
                    : "n/a"}
                </div>
              </div>
              <Link href={`/app/cues/${cue.id}/`}>
                <Button variant="secondary">Inspect</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CuesPage() {
  return (
    <Suspense fallback={<p className="text-cue-slate">Loading ambient cues…</p>}>
      <CuesPageInner />
    </Suspense>
  );
}
