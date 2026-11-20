"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Cue } from "@/lib/api";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";

export default function CuesPage() {
  const [cues, setCues] = useState<Cue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        setCues(await api.cues());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cues");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
          Each cue preserves source evidence and a model recommendation. Nothing posts until a
          server-checked approval path succeeds.
        </p>
      </div>

      <div className="space-y-3">
        {cues.map((cue) => (
          <div
            key={cue.id}
            className="flex flex-col gap-4 rounded-2xl border border-cue-line/80 bg-white/90 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold text-cue-navy">{cue.vendor_name}</h2>
                <StatusBadge status={cue.status} />
              </div>
              <p className="mt-1 text-sm text-cue-slate">{cue.description}</p>
              <p className="mt-2 font-mono text-xs text-cue-slate">
                {cue.id} · received {new Date(cue.received_at).toLocaleString()}
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
