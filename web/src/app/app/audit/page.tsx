"use client";

import { useEffect, useState } from "react";
import { api, type AuditEvent } from "@/lib/api";

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setEvents(await api.audit());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit trail");
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cue-green">Audit</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-cue-navy">Evidence timeline</h1>
        <p className="mt-2 max-w-2xl text-cue-slate">
          Append-only workflow events make every recommendation, hold, approval, and posting
          explainable after the fact.
        </p>
      </div>

      {error ? <p className="text-[#9F1239]">{error}</p> : null}

      <ol className="space-y-3">
        {events.map((event) => (
          <li key={event.id} className="rounded-2xl border border-cue-line/80 bg-white/90 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-cue-navy">{event.summary}</div>
              <div className="font-mono text-xs text-cue-slate">
                {new Date(event.at).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 text-sm text-cue-slate">
              {event.actor_name} · <span className="font-mono">{event.action}</span> ·{" "}
              {event.entity_type}/{event.entity_id}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
