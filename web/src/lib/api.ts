const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      body?.detail?.message ?? body?.detail ?? `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return body as T;
}

export type Actor = { id: string; name: string; role: string };
export type Show = {
  id: string;
  name: string;
  venue: string;
  city: string;
  show_date: string;
  status: string;
};
export type Dashboard = {
  tour: {
    id: string;
    name: string;
    artist: string;
    season: string;
    currency: string;
  };
  metrics: {
    open_cues: number;
    awaiting_approval: number;
    posted_entries: number;
    unexplained_variances: number;
  };
  shows: Show[];
  actors: Actor[];
  policy_version: string;
  active_actor_id?: string;
  viewer?: { name: string; email: string };
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
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  summary: string;
  details: Record<string, unknown>;
};

export const api = {
  dashboard: () => request<Dashboard>("/demo/dashboard"),
  reset: () => request<{ status: string }>("/demo/reset", { method: "POST" }),
  setActor: (actor_id: string) =>
    request<{ actor: Actor }>("/demo/actor", {
      method: "POST",
      body: JSON.stringify({ actor_id }),
    }),
  cues: () => request<Cue[]>("/cues"),
  cue: (id: string) => request<Cue>(`/cues/${id}`),
  review: (id: string) =>
    request<Cue>(`/cues/${id}/review`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  approve: (id: string, payload: { decision: string; reason: string }) =>
    request<{ cue: Cue }>(`/cues/${id}/approvals`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  post: (id: string, payload: { idempotency_key: string }) =>
    request<{ cue: Cue; journal: Journal; idempotent_replay: boolean }>(`/cues/${id}/post`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  journals: () => request<Journal[]>("/ledger/journals"),
  reconciliation: () => request<ReconItem[]>("/reconciliation"),
  explain: (id: string, payload: { explanation: string }) =>
    request<ReconItem>(`/reconciliation/${id}/explain`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  audit: () => request<AuditEvent[]>("/audit?limit=40"),
};
