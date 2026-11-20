"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useDemo } from "@/components/demo/DemoProvider";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/utils";

export default function CommandPage() {
  const { dashboard, loading, error, actorId, setActorId, refresh } = useDemo();

  if (loading && !dashboard) {
    return <p className="text-cue-slate">Loading tour close workspace…</p>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-white p-6 shadow-panel">
        <h1 className="font-display text-2xl text-cue-navy">API unavailable</h1>
        <p className="mt-2 text-cue-slate">{error}</p>
        <Button className="mt-4" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }
  if (!dashboard) return null;

  const metrics = [
    { label: "Open cues", value: dashboard.metrics.open_cues },
    { label: "Awaiting approval", value: dashboard.metrics.awaiting_approval },
    { label: "Posted entries", value: dashboard.metrics.posted_entries },
    { label: "Unexplained variances", value: dashboard.metrics.unexplained_variances },
  ];

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[28px] border border-cue-line/70 bg-white/80 p-8 shadow-panel"
      >
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-cue-mist/80 to-transparent" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cue-green">
            Active tour
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-cue-navy sm:text-5xl">
            {dashboard.tour.name}
          </h1>
          <p className="mt-3 text-lg text-cue-slate">
            {dashboard.tour.artist} · {dashboard.tour.season} · policy{" "}
            <span className="font-mono text-sm text-cue-navy">{dashboard.policy_version}</span>
          </p>
          <p className="mt-4 max-w-xl text-cue-slate">
            Recommendations arrive with evidence. Authority is checked on the server. Posting is
            exact, idempotent, and reversible only through a later correcting entry.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app/cues">
              <Button>Open cue inbox</Button>
            </Link>
            <Link href="/app/reconciliation">
              <Button variant="secondary">Review variances</Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            className="rounded-2xl border border-cue-line/80 bg-white/90 p-5"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-cue-slate">
              {metric.label}
            </div>
            <div className="mt-3 font-display text-4xl font-bold text-cue-navy">{metric.value}</div>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
          <h2 className="font-display text-2xl font-bold text-cue-navy">Show slate</h2>
          <div className="mt-4 divide-y divide-cue-line/70">
            {dashboard.shows.map((show) => (
              <div key={show.id} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-cue-navy">
                    {show.name} · {show.venue}
                  </div>
                  <div className="text-sm text-cue-slate">
                    {show.city} · {show.show_date}
                  </div>
                </div>
                <div className="text-sm font-medium text-cue-green">{show.status.replaceAll("_", " ")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cue-line/80 bg-white/90 p-6">
          <h2 className="font-display text-2xl font-bold text-cue-navy">Acting role</h2>
          <p className="mt-2 text-sm text-cue-slate">
            Switch persona to demonstrate delegated authority. Tour managers can contextualize but
            cannot post.
          </p>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-cue-slate">
            Actor
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-cue-line bg-cue-paper px-3 py-3 text-sm font-semibold text-cue-navy"
            value={actorId}
            onChange={(event) => setActorId(event.target.value)}
          >
            {dashboard.actors.map((actor) => (
              <option key={actor.id} value={actor.id}>
                {actor.name} · {roleLabel(actor.role)}
              </option>
            ))}
          </select>
        </div>
      </section>
    </div>
  );
}
