export type Actor = { id: string; name: string; role: string };
export type Show = {
  id: string;
  name: string;
  venue: string;
  city: string;
  show_date: string;
  status: string;
};
export type Evidence = {
  id: string;
  kind: string;
  label: string;
  captured_at: string;
  excerpt: string;
  channel: string;
};
export type Recommendation = {
  account_code: string;
  account_name: string;
  show_id: string | null;
  confidence: number;
  rationale: string;
  evidence_ids: string[];
  policy_notes: string[];
};
export type Cue = {
  id: string;
  vendor_id: string;
  vendor_name: string;
  currency: string;
  amount: string;
  description: string;
  received_at: string;
  status: string;
  suggested_show_id: string | null;
  approval_required: boolean;
  materiality_threshold: string;
  posted_journal_id: string | null;
  hold_reason: string | null;
  evidence: Evidence[];
  recommendation: Recommendation | null;
};
export type Journal = {
  id: string;
  cue_id: string;
  currency: string;
  posted_at: string;
  posted_by: string;
  idempotency_key: string;
  memo: string;
  debit_total: string;
  credit_total: string;
  lines: Array<{
    account_code: string;
    account_name: string;
    debit: string;
    credit: string;
    show_id: string | null;
  }>;
};
export type ReconItem = {
  id: string;
  show_id: string;
  account_code: string;
  ledger_amount: string;
  legacy_amount: string;
  variance: string;
  status: string;
  explanation: string | null;
  explained_by: string | null;
};
export type AuditEvent = {
  id: string;
  at: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  details: Record<string, unknown>;
};

type Store = {
  tour: {
    id: string;
    name: string;
    artist: string;
    season: string;
    currency: string;
  };
  policy_version: string;
  actors: Actor[];
  shows: Show[];
  cues: Record<string, Cue>;
  journals: Record<string, Journal>;
  reconciliations: Record<string, ReconItem>;
  audit: AuditEvent[];
  idempotency: Record<string, string>;
};

export const DEFAULT_ACTOR_ID = "actor_maya";
export const DEFAULT_GUEST_ACTOR_ID = "actor_jordan";

type ViewerSession = { actorId: string };

declare global {
  // eslint-disable-next-line no-var
  var __cuecloseStore: Store | undefined;
  // eslint-disable-next-line no-var
  var __cuecloseSessions: Record<string, ViewerSession> | undefined;
}

function money(n: number) {
  return n.toFixed(2);
}

function now() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function seed(): Store {
  const cues: Record<string, Cue> = {
    cue_001: {
      id: "cue_001",
      vendor_id: "vendor_rig",
      vendor_name: "Northwind Rigging Co.",
      currency: "USD",
      amount: "8650.00",
      description: "Arena overhead package and overnight stand-by for Chicago",
      received_at: "2026-11-13T06:12:00Z",
      status: "awaiting_approval",
      suggested_show_id: "show_chi",
      approval_required: true,
      materiality_threshold: "2500.00",
      posted_journal_id: null,
      hold_reason: null,
      evidence: [
        {
          id: "ev_001a",
          kind: "pdf_invoice",
          label: "INV-88421 Northwind",
          captured_at: "2026-11-13T06:10:00Z",
          excerpt: "Overhead package CHI 11/12 · stand-by to 04:00 · PO TMS-441",
          channel: "email_ingest",
        },
        {
          id: "ev_001b",
          kind: "show_call_sheet",
          label: "Chicago call sheet",
          captured_at: "2026-11-12T14:00:00Z",
          excerpt: "Rigging load-in confirmed 08:00; overnight hold authorized by production.",
          channel: "ops_packet",
        },
      ],
      recommendation: {
        account_code: "6200",
        account_name: "Production - Rigging",
        show_id: "show_chi",
        confidence: 0.91,
        rationale:
          "Vendor category, PO TMS-441, and Chicago call sheet all point to show_chi. Amount exceeds production manager autonomy; tour controller approval required.",
        evidence_ids: ["ev_001a", "ev_001b"],
        policy_notes: ["Materiality > 2500.00 requires tour_controller", "No auto-post"],
      },
    },
    cue_002: {
      id: "cue_002",
      vendor_id: "vendor_cater",
      vendor_name: "Stagecraft Catering",
      currency: "USD",
      amount: "1840.50",
      description: "Artist and crew buyout for Detroit show day",
      received_at: "2026-11-15T01:40:00Z",
      status: "in_review",
      suggested_show_id: "show_det",
      approval_required: true,
      materiality_threshold: "2500.00",
      posted_journal_id: null,
      hold_reason: null,
      evidence: [
        {
          id: "ev_002a",
          kind: "pdf_invoice",
          label: "SC-2291 Stagecraft",
          captured_at: "2026-11-15T01:38:00Z",
          excerpt: "Detroit buyout 84 covers · dietary riders attached",
          channel: "email_ingest",
        },
      ],
      recommendation: {
        account_code: "6400",
        account_name: "Hospitality - Catering",
        show_id: "show_det",
        confidence: 0.88,
        rationale:
          "Invoice references Detroit cover count and hospitality rider. Within production manager autonomy if show tagging is confirmed.",
        evidence_ids: ["ev_002a"],
        policy_notes: ["Below materiality threshold for tour_controller"],
      },
    },
    cue_003: {
      id: "cue_003",
      vendor_id: "vendor_freight",
      vendor_name: "Lakehaul Freight",
      currency: "USD",
      amount: "4125.00",
      description: "Truck jump Detroit to Toronto plus border bond",
      received_at: "2026-11-16T09:05:00Z",
      status: "new",
      suggested_show_id: "show_tor",
      approval_required: true,
      materiality_threshold: "2500.00",
      posted_journal_id: null,
      hold_reason: null,
      evidence: [
        {
          id: "ev_003a",
          kind: "pdf_invoice",
          label: "LH-77302 Lakehaul",
          captured_at: "2026-11-16T09:00:00Z",
          excerpt: "Jump DET→YYZ · 3 trailers · border bond 375.00",
          channel: "email_ingest",
        },
      ],
      recommendation: {
        account_code: "6300",
        account_name: "Logistics - Freight",
        show_id: "show_tor",
        confidence: 0.84,
        rationale:
          "Freight jump is attributed to the destination show (Toronto) per tour logistics policy.",
        evidence_ids: ["ev_003a"],
        policy_notes: ["Destination-show attribution for jumps", "Material approval required"],
      },
    },
    cue_004: {
      id: "cue_004",
      vendor_id: "vendor_radio",
      vendor_name: "Clearwave RF Services",
      currency: "USD",
      amount: "975.00",
      description: "RF coordination and spare pack for Boston",
      received_at: "2026-11-18T20:22:00Z",
      status: "held",
      suggested_show_id: "show_bos",
      approval_required: true,
      materiality_threshold: "2500.00",
      posted_journal_id: null,
      hold_reason: "Shared house RF language needs tour manager clarification",
      evidence: [
        {
          id: "ev_004a",
          kind: "pdf_invoice",
          label: "CW-551 Clearwave",
          captured_at: "2026-11-18T20:20:00Z",
          excerpt: "Boston RF day rate + spare pack · venue conflict note attached",
          channel: "email_ingest",
        },
      ],
      recommendation: {
        account_code: "6500",
        account_name: "Technical - RF",
        show_id: "show_bos",
        confidence: 0.67,
        rationale:
          "Likely Boston technical cost, but venue conflict note mentions a shared bill with house RF.",
        evidence_ids: ["ev_004a"],
        policy_notes: ["Low confidence < 0.75 forces hold path"],
      },
    },
    cue_005: {
      id: "cue_005",
      vendor_id: "vendor_local",
      vendor_name: "Beacon Local Crew",
      currency: "USD",
      amount: "3200.00",
      description: "Local stagehands and forklift for Toronto load-in",
      received_at: "2026-11-16T18:45:00Z",
      status: "new",
      suggested_show_id: "show_tor",
      approval_required: true,
      materiality_threshold: "2500.00",
      posted_journal_id: null,
      hold_reason: null,
      evidence: [
        {
          id: "ev_005a",
          kind: "pdf_invoice",
          label: "BLC-1904 Beacon",
          captured_at: "2026-11-16T18:40:00Z",
          excerpt: "Load-in 22 hands · 2 forklifts · steward overtime 2.0 hrs",
          channel: "email_ingest",
        },
      ],
      recommendation: {
        account_code: "6100",
        account_name: "Labor - Local Crew",
        show_id: "show_tor",
        confidence: 0.93,
        rationale: "Steward summary and call sheet agree on headcount.",
        evidence_ids: ["ev_005a"],
        policy_notes: ["Material approval required"],
      },
    },
  };

  return {
    tour: {
      id: "tour_northline_2026",
      name: "Northline Arena Tour",
      artist: "The Meridian Signal",
      season: "2026",
      currency: "USD",
    },
    policy_version: "policy.v1.tour-close",
    actors: [
      { id: "actor_maya", name: "Maya Chen", role: "tour_controller" },
      { id: "actor_jordan", name: "Jordan Blake", role: "production_manager" },
      { id: "actor_sam", name: "Sam Okonkwo", role: "tour_manager" },
      { id: "actor_elena", name: "Elena Ruiz", role: "executive_producer" },
      { id: "actor_audit", name: "Priya Natarajan", role: "auditor" },
      { id: "actor_admin", name: "Chris Vogel", role: "administrator" },
    ],
    shows: [
      {
        id: "show_chi",
        name: "Chicago",
        venue: "United Center",
        city: "Chicago, IL",
        show_date: "2026-11-12",
        status: "closed_pending_finance",
      },
      {
        id: "show_det",
        name: "Detroit",
        venue: "Little Caesars Arena",
        city: "Detroit, MI",
        show_date: "2026-11-14",
        status: "closed_pending_finance",
      },
      {
        id: "show_tor",
        name: "Toronto",
        venue: "Scotiabank Arena",
        city: "Toronto, ON",
        show_date: "2026-11-16",
        status: "in_settlement",
      },
      {
        id: "show_bos",
        name: "Boston",
        venue: "TD Garden",
        city: "Boston, MA",
        show_date: "2026-11-18",
        status: "load_out",
      },
    ],
    cues,
    journals: {},
    reconciliations: {
      rec_001: {
        id: "rec_001",
        show_id: "show_chi",
        account_code: "6200",
        ledger_amount: "0.00",
        legacy_amount: "8650.00",
        variance: "-8650.00",
        status: "unexplained",
        explanation: null,
        explained_by: null,
      },
      rec_002: {
        id: "rec_002",
        show_id: "show_det",
        account_code: "6400",
        ledger_amount: "0.00",
        legacy_amount: "1800.00",
        variance: "-1800.00",
        status: "unexplained",
        explanation: null,
        explained_by: null,
      },
    },
    audit: [
      {
        id: "audit_seed",
        at: now(),
        actor_id: "system",
        actor_name: "CueClose Demo Runtime",
        action: "demo.seeded",
        entity_type: "tour",
        entity_id: "tour_northline_2026",
        summary: "Synthetic Northline Arena Tour dataset loaded",
        details: { cue_count: Object.keys(cues).length },
      },
    ],
    idempotency: {},
  };
}

export function getStore(): Store {
  if (!globalThis.__cuecloseStore) {
    globalThis.__cuecloseStore = seed();
  }
  return globalThis.__cuecloseStore;
}

export function resetStore() {
  globalThis.__cuecloseStore = seed();
  return globalThis.__cuecloseStore;
}

function sessions(): Record<string, ViewerSession> {
  if (!globalThis.__cuecloseSessions) {
    globalThis.__cuecloseSessions = {};
  }
  return globalThis.__cuecloseSessions;
}

/** Resolve the demo persona bound to a viewer session. Never trust the browser for this. */
export function getSessionActor(viewerSub: string): Actor {
  const store = getStore();
  const session = sessions()[viewerSub];
  const fallback = viewerSub.startsWith("anon:") ? DEFAULT_GUEST_ACTOR_ID : DEFAULT_ACTOR_ID;
  const actorId = session?.actorId ?? fallback;
  return store.actors.find((actor) => actor.id === actorId) ?? store.actors[0];
}

export function setSessionActor(viewerSub: string, actorId: string): Actor | null {
  const store = getStore();
  const actor = store.actors.find((item) => item.id === actorId);
  if (!actor) return null;
  sessions()[viewerSub] = { actorId: actor.id };
  return actor;
}

export function audit(
  store: Store,
  partial: Omit<AuditEvent, "id" | "at"> & { id?: string; at?: string },
) {
  store.audit.unshift({
    id: partial.id ?? `audit_${Math.random().toString(16).slice(2, 10)}`,
    at: partial.at ?? now(),
    actor_id: partial.actor_id,
    actor_name: partial.actor_name,
    action: partial.action,
    entity_type: partial.entity_type,
    entity_id: partial.entity_id,
    summary: partial.summary,
    details: partial.details,
  });
}

export function dashboard(store: Store) {
  const cues = Object.values(store.cues);
  return {
    tour: store.tour,
    metrics: {
      open_cues: cues.filter((c) => ["new", "in_review", "held"].includes(c.status)).length,
      awaiting_approval: cues.filter((c) => c.status === "awaiting_approval").length,
      posted_entries: cues.filter((c) => ["posted", "reconciled"].includes(c.status)).length,
      unexplained_variances: Object.values(store.reconciliations).filter(
        (r) => r.status === "unexplained",
      ).length,
    },
    shows: store.shows,
    actors: store.actors,
    policy_version: store.policy_version,
  };
}

export function canDecide(actor: Actor, cue: Cue) {
  const amount = Number(cue.amount);
  const confidence = cue.recommendation?.confidence ?? 0;
  if (["tour_manager", "executive_producer", "auditor"].includes(actor.role)) {
    return { allowed: false, code: "E-01-ROLE", message: `Role ${actor.role} cannot approve or post.` };
  }
  if (actor.role === "administrator") {
    return { allowed: false, code: "E-01-ADMIN", message: "Administrators do not approve." };
  }
  if (cue.status === "held" && actor.role !== "tour_controller") {
    return {
      allowed: false,
      code: "HOLD-ESCALATION",
      message: "Held cues require tour controller decision.",
    };
  }
  if (amount >= 2500 && actor.role !== "tour_controller") {
    return {
      allowed: false,
      code: "MATERIALITY",
      message: "Amounts at or above 2500.00 require tour controller approval.",
    };
  }
  if (confidence < 0.75 && actor.role !== "tour_controller") {
    return {
      allowed: false,
      code: "LOW-CONFIDENCE",
      message: "Low-confidence recommendations require tour controller oversight.",
    };
  }
  return { allowed: true, code: "OK", message: "Within delegated authority." };
}

export function formatMoney(value: string) {
  return money(Number(value));
}

export { now, money };
