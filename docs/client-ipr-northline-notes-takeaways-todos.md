# Northline IPR Demo — Notes, Takeaways, and To-Dos

**Source:** [`client-ipr-demo-transcript-northline.md`](./client-ipr-demo-transcript-northline.md)  
**Hypothetical call:** Friday, November 20, 2026 (~32 min)  
**Attendees:** Oliver Ellison; Dana Ruiz (EP); Marcus Hale (tour controller); Priya Shah (production manager); Chris Lang (tour manager); Elena Voight (IT)

---

## Notes

### What was shown (current CueClose)

- Synthetic Northline Arena Tour demo: splash → command dashboard → cue inbox → evidence + heuristic recommendation → role-gated approve/hold → idempotent journal post → reconciliation explanation → audit trail.
- Server-side policy deny path demonstrated (production manager blocked on material cue).
- Explicit labeling that confidence is a heuristic, data is synthetic, and posting stays human-authorized.

### What the room cared about

- **Dana:** Stop drowning in PDFs/Slack threads; do not force another daily login; want producer-level “why did costs move” answers with receipts.
- **Marcus:** Controls first. No silent ledger adjustments. Shadow mode before any autonomy. Parallel run vs legacy before cutover. Auditor-reconstructable trail.
- **Priya:** Show-level clarity (Chicago vs Denver); evidence beside the decision; duplicate bills from multiple PAs.
- **Chris:** Will not open a desktop portal mid-changeover; will tap a short “which show?” text/Teams prompt; wants budget yell before wrap-meeting surprise.
- **Elena:** Path to Entra/Teams later; preferred channel per person; expiry + escalation; architecture clarity on identity/channels vs posting; auditor export; guest/shared-demo safety concerns.

### Tension that shaped priorities

- “Meet people where they are” vs portal-first demo gap (Dana/Chris pushed hard).
- Autonomy enthusiasm (Dana) vs material auto-post refusal (Marcus).
- IT integration skepticism (“Slack later never happens”) → simulated ambient cards accepted as near-term proof, real connectors deferred honestly.
- Shared public demo store anxiety → pilot tenancy required for real data.

### Non-goals stated or implied

- Not ripping out NetSuite / legacy close next month.
- Not a nightclub-themed UI; Command stays finance-serious.
- Not free-form AI SQL into the books.
- Not claiming simulated Teams/Slack as a finished enterprise connector.

---

## Takeaways

1. **Buy signal is workflow + trust, not feature count.** Evidence, deny paths, idempotent posting, and explainable reconciliation mattered more than flashy AI.
2. **Pilot framing must be parallel-run.** Hydrate, process alongside legacy, explain deltas for consecutive closes, then discuss cutover.
3. **Ambient UX is table stakes for adoption.** Tour managers will use channel prompts; they will not adopt another dashboard for routine exceptions.
4. **Same decisions, delegated carefully.** Progressive autonomy (shadow → advisory → supervised allowlist) with an off switch; material spend stays controller-gated.
5. **Show context is the operational failure mode.** Missing show assignment and city filters are immediate product gaps.
6. **Server remains authority.** Channel cards are doors into workflow state; role, expiry, one-time use, and audit stay centralized.
7. **Easy near-term slice exists on today’s spine.** Waiting-on-me, filters, needs-info, message preview, registered asks, duplicate banner, soft budget alerts, audit pack, mobile cards.
8. **Follow-ups Oliver committed to on the call:** written story summary, proposed two-week slice, architecture one-pager (identity/channels vs posting).

---

## Decisions / working agreements (from the close)

| Topic | Agreement |
|---|---|
| Cutover | Not day one; parallel run until deltas are “boring” |
| Autonomy default | Shadow first; no material auto-post without Marcus allowlist |
| Ambient near-term | In-app Message Preview (Teams/Slack/email/SMS simulation) |
| Ambient later | Real Entra / Graph connectors after workflow is right |
| Budget caps | Soft alerts first; hard stops only on a short list (offline) |
| Demo vs pilot | Synthetic demo stays labeled; Northline pilot needs isolation + real identity |
| UI tone | Expressive splash OK; Command denser/more sober |

---

## To-dos

### Priority 0 — client follow-through (Oliver)

- [ ] Send written summary of user stories + proposed **two-week slice**
- [ ] Send architecture one-pager: identity, channels, decision requests vs ledger posting
- [ ] Keep synthetic/public demo clearly labeled; document guest vs signed-in behavior for Elena

### Working-session split (Nov 2026)

**Implement before the collaborative interview (done / in progress):**
- [x] **Waiting-on-me home** + role-aware queue on Command
- [x] **Show / venue filters** (and waiting-on-me toggle) on cue inbox
- [x] **Duplicate-invoice warning** with forced acknowledge before approve

**Reserve for live design with the team (more interesting tradeoffs):**
- [ ] **Needs-info state** + tour-manager assign-show prompt (channel card, expiry, escalation)
- [ ] **Ambient Message Preview** (Teams / Slack / email / SMS → same approval API)
- [ ] **Registered asks** with citations (“why did Portland production move?”)
- Optional if time: shadow ladder, budget soft alerts, auditor export, mobile decision cards

### Priority 1 — remaining ambient / orchestration slice

- [ ] **Needs-info state** + tour-manager assign-show prompt (simulated channel card)
- [ ] **Expiry + escalation** (tour manager → production manager)
- [ ] **Ambient Message Preview** panel (Teams / Slack / email / SMS cards → same approval API)
- [ ] **Mobile-first decision cards** (approve / hold / needs-info / assign show)

### Priority 2 — trust and finance controls

- [ ] **Registered asks:** what’s waiting for me; why did {show} production move; open recon breaks (cited)
- [ ] **Shadow / advisory / supervised ladder** UI with evaluation counts; default shadow
- [x] **Duplicate-invoice warning** (vendor + date + amount near-match) before approve
- [ ] **Show budget soft-cap alerts** as exception cues
- [ ] **Auditor export pack** (cue + evidence + decision + journal + recon explanation)

### Priority 3 — pilot readiness

- [ ] Tenant isolation plan for Northline pilot data
- [ ] Role mapping sketch to real people (controller / production / tour manager / producer)
- [ ] Entra + Teams connector spike notes (feature-flagged; not required for demo theater)
- [ ] Parallel-run checklist: legacy export in → CueClose process → delta review cadence

### Already true in current demo (do not re-build; keep intact)

- [x] Evidence-backed cue detail
- [x] Server-enforced materiality / role gates
- [x] Approval with reason
- [x] Idempotent balanced posting
- [x] Reconciliation explanation without silent ledger rewrite
- [x] Append-only audit trail (demo-grade)

---

## User stories to track (from call)

1. Filter cues by show (Priya)
2. See evidence before approve (Priya)
3. Material gate for controller (Marcus)
4. Needs-info “which show?” to tour manager via channel (Chris)
5. Escalate on expiry (Elena / Priya)
6. Approve from simulated Teams card with server checks (Dana / Marcus)
7. Idempotent re-post safe (Marcus)
8. Explain legacy variance without mutating GL (Marcus)
9. Producer ask with citations (Dana)
10. Shadow recommendations before autonomy (Marcus / Priya)
11. Soft budget cap exception (Chris / Priya)
12. Acknowledge possible duplicate before approve (Priya)
13. Export auditor pack per show/period (Elena / Marcus)
14. Phone-sized decision card on site (Chris)
15. Parallel pilot until consecutive clean reconciliations (Marcus / Elena)

---

## Open questions (not closed on the call)

- Exact dollar materiality thresholds and hard-stop account list
- Per-person channel preferences and SLA/expiry defaults (24h was floated)
- Which legacy export format Northline would actually provide first
- Whether producer asks are in-app only at first, or also email-in
- Pilot success metric: how many consecutive periods / what delta tolerance
