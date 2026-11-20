"use client";

import { useEffect, useState } from "react";
import { useDemo } from "@/components/demo/DemoProvider";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, type ReconItem } from "@/lib/api";
import { money } from "@/lib/utils";

export default function ReconciliationPage() {
  const { refresh } = useDemo();
  const [items, setItems] = useState<ReconItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setItems(await api.reconciliation());
  }

  useEffect(() => {
    void load().catch((err) =>
      setError(err instanceof Error ? err.message : "Failed to load reconciliation"),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cue-green">
          Reconciliation
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold text-cue-navy">Explain, never invent</h1>
        <p className="mt-2 max-w-2xl text-cue-slate">
          Variances against the legacy snapshot are explained in place. CueClose never silently
          rewrites either side to force a match.
        </p>
      </div>

      {error ? <p className="text-[#9F1239]">{error}</p> : null}
      {message ? <p className="rounded-xl bg-cue-mist px-4 py-3 text-sm text-cue-navy">{message}</p> : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-cue-navy">
                  {item.account_code} · {item.show_id}
                </h2>
                <p className="mt-1 font-mono text-xs text-cue-slate">{item.id}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Ledger" value={money(item.ledger_amount)} />
              <Metric label="Legacy" value={money(item.legacy_amount)} />
              <Metric label="Variance" value={money(item.variance)} emphasize />
            </div>
            {item.explanation ? (
              <p className="mt-4 rounded-xl bg-cue-paper px-4 py-3 text-sm text-cue-navy">
                {item.explanation}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                <textarea
                  className="min-h-20 w-full rounded-xl border border-cue-line bg-cue-paper px-3 py-3 text-sm"
                  placeholder="Explain the variance without changing amounts…"
                  value={drafts[item.id] ?? ""}
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [item.id]: event.target.value }))
                  }
                />
                <Button
                  onClick={() =>
                    void (async () => {
                      setError(null);
                      try {
                        await api.explain(item.id, {
                          explanation: drafts[item.id] ?? "",
                        });
                        setMessage(`Explained ${item.id}`);
                        await load();
                        await refresh();
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Explain failed");
                      }
                    })()
                  }
                >
                  Record explanation
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-cue-line/70 bg-cue-paper/60 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cue-slate">{label}</div>
      <div className={`mt-1 font-display text-xl font-bold ${emphasize ? "text-cue-green" : "text-cue-navy"}`}>
        {value}
      </div>
    </div>
  );
}
