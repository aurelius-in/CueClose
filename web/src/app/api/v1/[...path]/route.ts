import { NextRequest, NextResponse } from "next/server";
import { requireIdentity } from "../../../../../cursor/identity";
import {
  audit,
  canDecide,
  dashboard,
  formatMoney,
  getSessionActor,
  getStore,
  resetStore,
  setSessionActor,
  type Actor,
} from "@/lib/server/store";

type Ctx = { params: Promise<{ path: string[] }> };

const privateHeaders = { "cache-control": "private, no-store" };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: privateHeaders });
}

async function requireViewer(request: NextRequest) {
  return requireIdentity(request);
}

function sessionActorFor(viewerSub: string): Actor {
  return getSessionActor(viewerSub);
}

export async function GET(request: NextRequest, ctx: Ctx) {
  const path = (await ctx.params).path.join("/");
  const store = getStore();

  // Liveness only: no tour data.
  if (path === "health") {
    return NextResponse.json({
      status: "ok",
      mode: "synthetic_tour_demo",
      persistence: "process_memory_seeded",
      tour_id: store.tour.id,
    });
  }

  const identity = await requireViewer(request);
  if (identity instanceof Response) return identity;

  if (path === "demo/dashboard") {
    const actor = sessionActorFor(identity.sub);
    return json({
      ...dashboard(store),
      active_actor_id: actor.id,
      viewer: { name: identity.name, email: identity.email },
    });
  }
  if (path === "demo/session") {
    const actor = sessionActorFor(identity.sub);
    return json({
      actor,
      viewer: { name: identity.name, email: identity.email },
    });
  }
  if (path === "cues") {
    return json(
      Object.values(store.cues).sort((a, b) => b.received_at.localeCompare(a.received_at)),
    );
  }
  if (path.startsWith("cues/") && path.split("/").length === 2) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return json({ detail: { code: "not_found", message: "Unknown cue" } }, 404);
    return json(cue);
  }
  if (path === "ledger/journals") {
    return json(
      Object.values(store.journals).sort((a, b) => b.posted_at.localeCompare(a.posted_at)),
    );
  }
  if (path === "reconciliation") return json(Object.values(store.reconciliations));
  if (path.startsWith("audit")) return json(store.audit.slice(0, 40));
  return json({ detail: "Not found" }, 404);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const identity = await requireViewer(request);
  if (identity instanceof Response) return identity;

  const path = (await ctx.params).path.join("/");
  const store = getStore();
  const body = await request.json().catch(() => ({}));
  const actor = sessionActorFor(identity.sub);

  if (path === "demo/reset") {
    resetStore();
    audit(getStore(), {
      actor_id: actor.id,
      actor_name: actor.name,
      action: "demo.reset",
      entity_type: "tour",
      entity_id: getStore().tour.id,
      summary: `${actor.name} reset the synthetic demo dataset`,
      details: { viewer_sub: identity.sub },
    });
    return json({ status: "reset", tour_id: getStore().tour.id, cue_count: 5 });
  }

  if (path === "demo/actor") {
    const next = setSessionActor(identity.sub, String(body.actor_id ?? ""));
    if (!next) {
      return json({ detail: { code: "invalid_input", message: "Unknown demo actor" } }, 422);
    }
    return json({ actor: next });
  }

  if (path.match(/^cues\/[^/]+\/review$/)) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return json({ detail: { code: "not_found", message: "Unknown cue" } }, 404);
    if (!["new", "held"].includes(cue.status)) {
      return json(
        { detail: { code: "invalid_state", message: `Cannot review from ${cue.status}` } },
        409,
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
    return json(cue);
  }

  if (path.match(/^cues\/[^/]+\/approvals$/)) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return json({ detail: { code: "not_found", message: "Unknown cue" } }, 404);
    if (!body.reason?.trim()) {
      return json({ detail: { code: "invalid_input", message: "A reason is required" } }, 422);
    }
    const decision = body.decision as string;
    if (!["approve", "reject", "hold"].includes(decision)) {
      return json({ detail: { code: "invalid_input", message: "Invalid decision" } }, 422);
    }
    if (decision === "approve") {
      const verdict = canDecide(actor, cue);
      if (!verdict.allowed) {
        return json({ detail: { code: verdict.code, message: verdict.message } }, 403);
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
    return json({
      cue,
      approval: {
        decision,
        actor_name: actor.name,
        actor_role: actor.role,
        reason: body.reason.trim(),
        policy_version: store.policy_version,
      },
    });
  }

  if (path.match(/^cues\/[^/]+\/post$/)) {
    const id = path.split("/")[1];
    const cue = store.cues[id];
    if (!cue) return json({ detail: { code: "not_found", message: "Unknown cue" } }, 404);
    if (!body.idempotency_key?.trim()) {
      return json(
        { detail: { code: "invalid_input", message: "idempotency_key is required" } },
        422,
      );
    }
    const scopedKey = `${identity.sub}:${body.idempotency_key}`;
    const existing = store.idempotency[scopedKey];
    if (existing && store.journals[existing]) {
      return json({ idempotent_replay: true, journal: store.journals[existing], cue });
    }
    if (cue.status !== "approved") {
      return json({ detail: { code: "STATE", message: "Only approved cues can be posted." } }, 409);
    }
    const verdict = canDecide(actor, cue);
    if (!verdict.allowed) {
      return json({ detail: { code: verdict.code, message: verdict.message } }, 403);
    }
    if (!cue.recommendation) {
      return json({ detail: { code: "invalid_state", message: "Missing recommendation" } }, 409);
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
    return json({ idempotent_replay: false, journal, cue });
  }

  if (path.match(/^reconciliation\/[^/]+\/explain$/)) {
    const id = path.split("/")[1];
    const item = store.reconciliations[id];
    if (!item) {
      return json(
        { detail: { code: "not_found", message: "Unknown reconciliation item" } },
        404,
      );
    }
    if (!body.explanation?.trim()) {
      return json(
        { detail: { code: "invalid_input", message: "Explanation is required" } },
        422,
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
    return json(item);
  }

  if (path === "ledger/validate") {
    return json({
      status: "validated_not_posted",
      persisted: false,
      balanced: true,
      currency: body.currency ?? "USD",
      debit_total: "0.00",
      credit_total: "0.00",
      line_count: Array.isArray(body.lines) ? body.lines.length : 0,
    });
  }

  return json({ detail: "Not found" }, 404);
}
