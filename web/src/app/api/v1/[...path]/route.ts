import { NextRequest, NextResponse } from "next/server";
import {
  audit,
  canDecide,
  dashboard,
  formatMoney,
  getSessionActor,
  getStore,
  resetStore,
  setSessionActor,
} from "@/lib/server/store";
import { resolveViewer, withViewerCookie } from "@/lib/server/viewer";

type Ctx = { params: Promise<{ path: string[] }> };

const privateHeaders = { "cache-control": "private, no-store" };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: privateHeaders });
}

function attach(request: NextRequest, response: NextResponse, setCookie?: string) {
  return withViewerCookie(response, setCookie, request.url.startsWith("https:"));
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const path = (await ctx.params).path.join("/");
  const store = getStore();

  if (path === "health") {
    return NextResponse.json({
      status: "ok",
      mode: "synthetic_tour_demo",
      persistence: "process_memory_seeded",
      tour_id: store.tour.id,
    });
  }

  const { viewer, setCookie } = await resolveViewer(request);

  if (path === "demo/dashboard") {
    const actor = getSessionActor(viewer.sub);
    return attach(request, json({
        ...dashboard(store),
        active_actor_id: actor.id,
        viewer: { name: viewer.name, email: viewer.email, kind: viewer.kind },
      }),
      setCookie,
    );
  }
  if (path === "demo/session") {
    const actor = getSessionActor(viewer.sub);
    return attach(request, json({
        actor,
        viewer: { name: viewer.name, email: viewer.email, kind: viewer.kind },
      }),
      setCookie,
    );
  }
  if (path === "cues") {
    return attach(request, json(Object.values(store.cues).sort((a, b) => b.received_at.localeCompare(a.received_at))),
      setCookie,
    );
  }
  if (path.startsWith("cues/") && path.split("/").length === 2) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return attach(request, json({ detail: { code: "not_found", message: "Unknown cue" } }, 404), setCookie);
    return attach(request, json(cue), setCookie);
  }
  if (path === "ledger/journals") {
    return attach(request, json(Object.values(store.journals).sort((a, b) => b.posted_at.localeCompare(a.posted_at))),
      setCookie,
    );
  }
  if (path === "reconciliation") {
    return attach(request, json(Object.values(store.reconciliations)), setCookie);
  }
  if (path.startsWith("audit")) {
    // Never expose raw identity subjects in the client-visible audit feed.
    const events = store.audit.slice(0, 40).map((event) => ({
      ...event,
      details: sanitizeAuditDetails(event.details),
    }));
    return attach(request, json(events), setCookie);
  }
  return attach(request, json({ detail: "Not found" }, 404), setCookie);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { viewer, setCookie } = await resolveViewer(request);
  const path = (await ctx.params).path.join("/");
  const store = getStore();
  const body = await request.json().catch(() => ({}));
  const actor = getSessionActor(viewer.sub);

  if (path === "demo/reset") {
    // Only tour controllers may wipe the shared demo store.
    if (actor.role !== "tour_controller") {
      return attach(request, json(
          {
            detail: {
              code: "E-01-ROLE",
              message: "Only the tour controller persona may reset the demo store.",
            },
          },
          403,
        ),
        setCookie,
      );
    }
    resetStore();
    audit(getStore(), {
      actor_id: actor.id,
      actor_name: actor.name,
      action: "demo.reset",
      entity_type: "tour",
      entity_id: getStore().tour.id,
      summary: `${actor.name} reset the synthetic demo dataset`,
      details: { viewer_kind: viewer.kind },
    });
    return attach(request, json({ status: "reset", tour_id: getStore().tour.id, cue_count: 5 }), setCookie);
  }

  if (path === "demo/actor") {
    // Guests may explore non-controller personas; tour controller stays signed-in only.
    const requested = String(body.actor_id ?? "");
    if (viewer.kind === "guest") {
      const target = getStore().actors.find((item) => item.id === requested);
      if (!target) {
        return attach(request, json({ detail: { code: "invalid_input", message: "Unknown demo actor" } }, 422),
          setCookie,
        );
      }
      if (target.role === "tour_controller") {
        return attach(request, json(
            {
              detail: {
                code: "E-01-ROLE",
                message: "Tour controller requires a signed-in Cursor viewer (Private or Team app).",
              },
            },
            403,
          ),
          setCookie,
        );
      }
    }
    const next = setSessionActor(viewer.sub, requested);
    if (!next) {
      return attach(request, json({ detail: { code: "invalid_input", message: "Unknown demo actor" } }, 422),
        setCookie,
      );
    }
    return attach(request, json({ actor: next }), setCookie);
  }

  if (path.match(/^cues\/[^/]+\/review$/)) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return attach(request, json({ detail: { code: "not_found", message: "Unknown cue" } }, 404), setCookie);
    if (!["new", "held"].includes(cue.status)) {
      return attach(request, json({ detail: { code: "invalid_state", message: `Cannot review from ${cue.status}` } }, 409),
        setCookie,
      );
    }
    cue.status =
      cue.recommendation && cue.recommendation.confidence >= 0.75
        ? "awaiting_approval"
        : "in_review";
    audit(store, {
      actor_id: actor.id,
      actor_name: actor.name,
      action: "cue.reviewed",
      entity_type: "cue",
      entity_id: cue.id,
      summary: `${actor.name} opened review for ${cue.vendor_name}`,
      details: { status: cue.status },
    });
    return attach(request, json(cue), setCookie);
  }

  if (path.match(/^cues\/[^/]+\/approvals$/)) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return attach(request, json({ detail: { code: "not_found", message: "Unknown cue" } }, 404), setCookie);
    if (!body.reason?.trim()) {
      return attach(request, json({ detail: { code: "invalid_input", message: "A reason is required" } }, 422),
        setCookie,
      );
    }
    const decision = body.decision as string;
    if (!["approve", "reject", "hold"].includes(decision)) {
      return attach(request, json({ detail: { code: "invalid_input", message: "Invalid decision" } }, 422),
        setCookie,
      );
    }
    if (decision === "approve") {
      const verdict = canDecide(actor, cue);
      if (!verdict.allowed) {
        return attach(request, json({ detail: { code: verdict.code, message: verdict.message } }, 403), setCookie);
      }
      cue.status = "approved";
      cue.hold_reason = null;
    } else {
      cue.status = "held";
      cue.hold_reason = body.reason.trim();
    }
    audit(store, {
      actor_id: actor.id,
      actor_name: actor.name,
      action: `approval.${decision}`,
      entity_type: "cue",
      entity_id: cue.id,
      summary: `${actor.name} recorded ${decision} on ${cue.id}`,
      details: { reason: body.reason.trim() },
    });
    return attach(request, json({
        cue,
        approval: {
          decision,
          actor_name: actor.name,
          actor_role: actor.role,
          reason: body.reason.trim(),
          policy_version: store.policy_version,
        },
      }),
      setCookie,
    );
  }

  if (path.match(/^cues\/[^/]+\/post$/)) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return attach(request, json({ detail: { code: "not_found", message: "Unknown cue" } }, 404), setCookie);
    if (!body.idempotency_key?.trim()) {
      return attach(request, json({ detail: { code: "invalid_input", message: "idempotency_key is required" } }, 422),
        setCookie,
      );
    }
    const scopedKey = `${viewer.sub}:${body.idempotency_key}`;
    const existing = store.idempotency[scopedKey];
    if (existing && store.journals[existing]) {
      return attach(request, json({ idempotent_replay: true, journal: store.journals[existing], cue }),
        setCookie,
      );
    }
    if (cue.status !== "approved") {
      return attach(request, json({ detail: { code: "STATE", message: "Only approved cues can be posted." } }, 409),
        setCookie,
      );
    }
    const verdict = canDecide(actor, cue);
    if (!verdict.allowed) {
      return attach(request, json({ detail: { code: verdict.code, message: verdict.message } }, 403), setCookie);
    }
    if (!cue.recommendation) {
      return attach(request, json({ detail: { code: "invalid_state", message: "Missing recommendation" } }, 409),
        setCookie,
      );
    }
    const journalId = `je_${Math.random().toString(16).slice(2, 12)}`;
    const amount = formatMoney(cue.amount);
    const journal = {
      id: journalId,
      cue_id: cue.id,
      currency: cue.currency,
      posted_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      posted_by: actor.id,
      idempotency_key: scopedKey,
      memo: `Post ${cue.id} · ${cue.vendor_name}`,
      debit_total: amount,
      credit_total: amount,
      lines: [
        {
          account_code: cue.recommendation.account_code,
          account_name: cue.recommendation.account_name,
          debit: amount,
          credit: "0.00",
          show_id: cue.recommendation.show_id,
        },
        {
          account_code: "2000",
          account_name: "Accounts Payable",
          debit: "0.00",
          credit: amount,
          show_id: cue.recommendation.show_id,
        },
      ],
    };
    store.journals[journalId] = journal;
    store.idempotency[scopedKey] = journalId;
    cue.status = "posted";
    cue.posted_journal_id = journalId;
    const showId = cue.recommendation.show_id;
    if (showId) {
      for (const item of Object.values(store.reconciliations)) {
        if (item.show_id === showId && item.account_code === cue.recommendation.account_code) {
          item.ledger_amount = formatMoney(String(Number(item.ledger_amount) + Number(amount)));
          item.variance = formatMoney(
            String(Number(item.ledger_amount) - Number(item.legacy_amount)),
          );
          if (item.variance === "0.00") {
            item.status = "matched";
            item.explanation =
              item.explanation ?? "Ledger now matches legacy snapshot after posting.";
          }
        }
      }
    }
    audit(store, {
      actor_id: actor.id,
      actor_name: actor.name,
      action: "ledger.posted",
      entity_type: "journal",
      entity_id: journalId,
      summary: `Posted balanced journal for ${cue.vendor_name}`,
      details: { cue_id: cue.id, debit_total: amount },
    });
    return attach(request, json({ idempotent_replay: false, journal, cue }), setCookie);
  }

  if (path.match(/^reconciliation\/[^/]+\/explain$/)) {
    const id = path.split("/")[1];
    const item = store.reconciliations[id];
    if (!item) {
      return attach(request, json({ detail: { code: "not_found", message: "Unknown reconciliation item" } }, 404),
        setCookie,
      );
    }
    if (!body.explanation?.trim()) {
      return attach(request, json({ detail: { code: "invalid_input", message: "Explanation is required" } }, 422),
        setCookie,
      );
    }
    item.explanation = body.explanation.trim();
    item.explained_by = actor.id;
    item.status = "explained";
    audit(store, {
      actor_id: actor.id,
      actor_name: actor.name,
      action: "reconciliation.explained",
      entity_type: "reconciliation",
      entity_id: item.id,
      summary: `Explained variance on ${item.account_code} / ${item.show_id}`,
      details: { variance: item.variance },
    });
    return attach(request, json(item), setCookie);
  }

  if (path === "ledger/validate") {
    return attach(request, json({
        status: "validated_not_posted",
        persisted: false,
        balanced: true,
        currency: body.currency ?? "USD",
        debit_total: "0.00",
        credit_total: "0.00",
        line_count: Array.isArray(body.lines) ? body.lines.length : 0,
      }),
      setCookie,
    );
  }

  return attach(request, json({ detail: "Not found" }, 404), setCookie);
}

function sanitizeAuditDetails(details: Record<string, unknown>) {
  const copy = { ...details };
  delete copy.viewer_sub;
  return copy;
}
