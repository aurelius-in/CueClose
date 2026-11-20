"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useDemo } from "@/components/demo/DemoProvider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type Cue } from "@/lib/api";
import { money } from "@/lib/utils";

export function CueDetailClient({ cueId }: { cueId: string }) {
  const { refresh } = useDemo();
  const [cue, setCue] = useState<Cue | null>(null);
  const [reason, setReason] = useState("Evidence and show tagging are consistent with policy.");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCue(await api.cue(cueId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cue");
    }
  }, [cueId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      await action();
      await load();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (error && !cue) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-white p-6">
        <p>{error}</p>
        <Link href="/app/cues" className="mt-4 inline-block text-cue-green">
          Back to inbox
        </Link>
      </div>
    );
  }
  if (!cue) return <p className="text-cue-slate">Loading cue…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/cues" className="text-sm font-semibold text-cue-green">
          ← Cue inbox
        </Link>
        <h1 className="mt-3 font-display text-4xl font-bold text-cue-navy">{cue.vendor_name}</h1>
        <p className="mt-2 text-cue-slate">{cue.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <StatusBadge status={cue.status} />
          <span className="font-display text-2xl font-bold text-cue-navy">{money(cue.amount)}</span>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-[#FECACA] bg-[#FEF2F2] text-[#9F1239]"
              : "border-cue-green/30 bg-cue-mist text-cue-navy"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
          <h2 className="font-display text-2xl font-bold text-cue-navy">Source evidence</h2>
          <div className="mt-4 space-y-3">
            {cue.evidence.map((item) => (
              <article key={item.id} className="rounded-xl border border-cue-line/70 bg-cue-paper/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-cue-navy">{item.label}</h3>
                  <span className="font-mono text-[11px] text-cue-slate">{item.kind}</span>
                </div>
                <p className="mt-2 text-sm text-cue-slate">{item.excerpt}</p>
                <p className="mt-2 text-xs text-cue-slate">
                  {item.channel} · {new Date(item.captured_at).toLocaleString()}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
          <h2 className="font-display text-2xl font-bold text-cue-navy">Recommendation</h2>
          {cue.recommendation ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-cue-navy px-4 py-4 text-white">
                <div className="text-xs uppercase tracking-[0.16em] text-white/70">Proposed posting</div>
                <div className="mt-2 font-display text-2xl font-bold">
                  {cue.recommendation.account_code} · {cue.recommendation.account_name}
                </div>
                <div className="mt-1 text-sm text-white/80">
                  Show {cue.recommendation.show_id ?? "unassigned"} · confidence{" "}
                  {Math.round(cue.recommendation.confidence * 100)}%
                </div>
              </div>
              <p className="text-sm leading-relaxed text-cue-slate">{cue.recommendation.rationale}</p>
              <ul className="space-y-1 text-sm text-cue-navy">
                {cue.recommendation.policy_notes.map((note) => (
                  <li key={note}>· {note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-3 text-cue-slate">No recommendation attached.</p>
          )}
          {cue.hold_reason ? (
            <p className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#9F1239]">
              Hold: {cue.hold_reason}
            </p>
          ) : null}
        </section>
      </div>

      <section className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
        <h2 className="font-display text-2xl font-bold text-cue-navy">Decision controls</h2>
        <p className="mt-2 text-sm text-cue-slate">
          A model may recommend. It never posts. Decisions record actor, role, policy version, and
          reason.
        </p>
        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-cue-slate">
          Reason
        </label>
        <textarea
          className="mt-2 min-h-24 w-full rounded-xl border border-cue-line bg-cue-paper px-3 py-3 text-sm text-cue-navy"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            disabled={busy || !["new", "held"].includes(cue.status)}
            variant="secondary"
            title={
              ["new", "held"].includes(cue.status)
                ? "Move this cue into review"
                : "Review is only available from new or held"
            }
            onClick={() =>
              void run(async () => {
                await api.review(cue.id);
                setMessage("Cue moved into review / awaiting approval.");
              })
            }
          >
            Open review
          </Button>
          <Button
            disabled={busy || !["awaiting_approval", "in_review", "held"].includes(cue.status)}
            title="Record an approval decision"
            onClick={() =>
              void run(async () => {
                await api.approve(cue.id, {
                  decision: "approve",
                  reason,
                });
                setMessage("Approval recorded. You can post the journal next.");
              })
            }
          >
            Approve
          </Button>
          <Button
            disabled={busy || !["awaiting_approval", "in_review", "held"].includes(cue.status)}
            variant="secondary"
            title="Hold this cue for more context"
            onClick={() =>
              void run(async () => {
                await api.approve(cue.id, {
                  decision: "hold",
                  reason,
                });
                setMessage("Hold recorded.");
              })
            }
          >
            Hold
          </Button>
          <Button
            disabled={busy || cue.status !== "approved"}
            title={
              cue.status === "approved"
                ? "Post a balanced journal for this cue"
                : "Approve the cue before posting"
            }
            onClick={() =>
              void run(async () => {
                const result = await api.post(cue.id, {
                  idempotency_key: `ui-post-${cue.id}-${Date.now()}`,
                });
                setMessage(
                  result.idempotent_replay
                    ? `Idempotent replay of ${result.journal.id}`
                    : `Posted ${result.journal.id} · ${result.journal.debit_total}`,
                );
              })
            }
          >
            Post journal
          </Button>
        </div>
        {cue.status !== "approved" && cue.status !== "posted" ? (
          <p className="mt-3 text-xs text-cue-slate">
            Post journal stays disabled until this cue is approved.
          </p>
        ) : null}
      </section>
    </div>
  );
}
