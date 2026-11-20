"use client";

import { useEffect, useState } from "react";
import { api, type Journal } from "@/lib/api";
import { money } from "@/lib/utils";

export default function LedgerPage() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setJournals(await api.journals());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ledger");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cue-green">Ledger</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-cue-navy">Posted journals</h1>
        <p className="mt-2 max-w-2xl text-cue-slate">
          Entries are immutable once posted. Corrections use reversal and replacement, never silent
          edits. Amounts travel as decimal strings end to end.
        </p>
      </div>

      {error ? <p className="text-[#9F1239]">{error}</p> : null}

      {journals.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cue-line bg-white/70 p-8 text-cue-slate">
          No journals posted yet. Approve a cue, then post it from the cue detail view.
        </div>
      ) : (
        <div className="space-y-4">
          {journals.map((journal) => (
            <article key={journal.id} className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-cue-navy">{journal.id}</h2>
                  <p className="text-sm text-cue-slate">
                    {journal.memo} · {new Date(journal.posted_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-cue-slate">balanced</div>
                  <div className="font-display text-xl font-bold text-cue-navy">
                    {money(journal.debit_total)}
                  </div>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.14em] text-cue-slate">
                    <tr>
                      <th className="pb-2 pr-4">Account</th>
                      <th className="pb-2 pr-4">Show</th>
                      <th className="pb-2 pr-4">Debit</th>
                      <th className="pb-2">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journal.lines.map((line) => (
                      <tr key={`${journal.id}-${line.account_code}-${line.debit}-${line.credit}`}>
                        <td className="py-2 pr-4 font-medium text-cue-navy">
                          {line.account_code} · {line.account_name}
                        </td>
                        <td className="py-2 pr-4 text-cue-slate">{line.show_id ?? "—"}</td>
                        <td className="py-2 pr-4 font-mono">{money(line.debit)}</td>
                        <td className="py-2 font-mono">{money(line.credit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 font-mono text-xs text-cue-slate">
                idempotency · {journal.idempotency_key}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
