# CueClose Demo Walkthrough

**Product presentation script for Horizon Arena Tour**  
Audience: stakeholders and peer engineers · Runtime: ~12–15 minutes · Editions: Classic then Pro

> The tour keeps moving. The books keep up.

Use this as a spoken guide while driving the live demo at `http://127.0.0.1:3847`.  
Reset anytime with **Reset demo** (tour controller). Prefer a clean seed before you start.

---

## Before you start (2 min, off-mic or quiet)

| Check | Action |
|---|---|
| App running | `cd web && npm run build && npm run start -- --port 3847` (or `./scripts/run.sh`) |
| Browser | Fresh tab; splash should show CueClose brand |
| Edition | Set header **Edition** to **Classic** for the opening arc |
| Persona | Plan to use **Maya Chen** (tour controller) for material posts; **Jordan Blake** for the denial beat |
| Talking frame | Product demo of CueClose for stakeholders and peers |

**Opening line (pick one):**

- “CueClose is touring-finance coordination for live production close. Cues arrive with evidence. The model recommends. Humans decide. The ledger stays exact.”
- “We are walking Horizon Arena Tour: ambient invoices, role-gated approvals, balanced posting, and reconciliation that explains variance instead of rewriting it.”

---

## Timed arc

| Block | Clock | Goal |
|---|---|---|
| 0. Brand splash | 0:00–0:45 | Brand moment; set the promise |
| 1. Command (Classic) | 0:45–2:30 | Tour context, metrics, persona |
| 2. Material approve + post | 2:30–5:30 | Core trust story |
| 3. Authority denial | 5:30–7:00 | Policy is real |
| 4. Hold path | 7:00–8:00 | Low confidence stays visible |
| 5. Ledger + recon + audit | 8:00–10:00 | Close loop |
| 6. Switch to Pro | 10:00–13:30 | Waiting-on-me, filters, duplicate gate |
| 7. Close | 13:30–15:00 | Principles + Q&A handoff |

---

## Block 0 · Brand splash (0:45)

**Click:** Land on `/`. Let the splash breathe.

**Say:**
- CueClose brand: Cue green, Close navy.
- Tagline: the tour keeps moving; the books keep up.
- This workspace uses synthetic Horizon Arena Tour data and simulated channels.

**Do not:** Rush into the inbox. Let stakeholders register the product name.

**Enter:** Click into the workspace / Command.

---

## Block 1 · Command, Classic (≈1:45)

**Click:** Confirm **Edition = Classic**. Open **Command**.

**Point at:**
- Active tour name: Horizon Arena Tour
- Policy version badge
- Metric tiles: open cues, awaiting approval, posted entries, unexplained variances
- Show slate (cities / venues)
- Acting role control

**Say:**
- “Classic is the core close path: inbox, evidence, approvals, posting, reconciliation, audit.”
- “Recommendations are visible. Posting only happens after a server-checked human approval.”
- “Personas are bound on the server. The browser does not send an actor id to authorize a write.”

**Engineer aside (optional, 20 sec):**
- One-process Next.js demo API mirrors the FastAPI contract under `/api/v1`.
- Domain money uses exact decimals; API amounts are decimal strings.

---

## Block 2 · Material approve and post (≈3:00)

**Click:** **Cue inbox** → open **Northwind Rigging Co.** (`cue_001`, about $8,650).

**Point at:**
- Invoice number and amount
- Status: awaiting approval
- Evidence excerpts (invoice + call sheet)
- Recommendation: account, show, confidence, policy notes
- Disabled or enabled decision controls depending on persona

**Switch actor to Maya Chen** (tour controller) if needed.

**Say:**
- “This amount sits above the materiality threshold, so tour controller approval is required.”
- “Evidence is preserved with the cue. The model never posts on its own.”

**Click:**
1. **Approve** with a short reason (example: “PO and call sheet match Chicago stand-by.”)
2. **Post journal**

**Point at:** Balanced debit/credit totals on the resulting journal.

**Say:**
- “Posting is idempotent. A second submit with the same key does not double the books.”
- “Posted lines are not edited in place. Corrections use a later reversing path in the product rules.”

---

## Block 3 · Authority denial (≈1:30)

**Click:** Switch acting role to **Jordan Blake** (production manager).  
Open another material cue still awaiting approval, or attempt an approval Jordan cannot make.

**Say:**
- “Same UI. Different authority. The API returns a policy code such as MATERIALITY.”
- “Channel messages can request action. They cannot grant authority.”

**Point at:** Error / disabled state with plain language. Cue status unchanged.

**Stakeholder line:** “Finance stays in control even when the desk is moving fast.”

**Engineer line:** “Deterministic policy lives with the domain (`can_decide` / `can_post`), not in the button layer alone.”

---

## Block 4 · Hold path (≈1:00)

**Click:** Open **Clearwave RF** (`cue_004`) or another held / low-confidence cue.

**Say:**
- “When confidence is low, CueClose holds for context instead of forcing a bad post.”
- “Held work escalates to the tour controller after context is attached.”

**Optional:** Show the hold reason and recommendation confidence.

---

## Block 5 · Ledger, reconciliation, audit (≈2:00)

**Click through quickly:**

1. **Ledger** - show the Northwind journal you posted.
2. **Reconciliation** - open an unexplained variance; add a short human explanation.
3. **Audit** - scroll seed → review → approval → post → explain.

**Say:**
- “Reconciliation explains variance. It does not silently rewrite ledger or legacy amounts.”
- “The audit trail is append-only. Stakeholders can see who decided what and why.”

---

## Block 6 · Pro edition desk tools (≈3:30)

**Click:** Header **Edition → Pro**. Note the Pro banner: waiting-on-me, show filters, duplicate acknowledge gate.

### 6a · Waiting-on-me

**Click:** Command. Point at the **Waiting on me** metric and queue.  
Use **Open my queue** or inbox with waiting filter.

**Say:**
- “Pro starts from what needs the active persona, not from a flat pile of every cue.”
- “The queue is role-aware. Maya’s list and Jordan’s list are not the same.”

### 6b · Show filters

**Click:** **Cue inbox**. Use **Show / venue** filter. Toggle **Waiting on me**.

**Say:**
- “City owners can narrow to the show they own while the tour is rolling.”

### 6c · Duplicate acknowledge gate

**Click:** Open the Stagecraft near-duplicate cue (Pro seed, often `cue_006` / similar invoice to SC-2291).

**Point at:**
- Possible duplicates panel with match reasons (same vendor, amount within 5%, received within 14 days, similar invoice number, same show)
- Checkbox: acknowledge before approve
- Approve stays disabled until checked

**Say:**
- “Pro stops a careless double post without pretending this is perfect identity resolution.”
- “Acknowledge is an explicit human step. It is logged with the decision.”

**Optional click:** Check acknowledge → Approve (as Maya if material / policy requires).

---

## Block 7 · Close (≈1:30)

**Say (principles, crisp):**

1. A model may recommend; it never posts.
2. Money is exact decimal, never binary float.
3. Authority is server-checked and audited.
4. Reconciliation explains; it does not auto-correct.
5. Classic tells the close story; Pro adds the operations desk.

**Invite questions:**
- Stakeholders: workflow fit, edition difference, demo vs production persistence.
- Engineers: policy codes, store swap-readiness, API contract parity, edition header/cookie.

**Handouts:**
- Architecture Overview PDF: `docs/architecture/CueClose-Architecture-Overview.pdf`
- This script PDF: `docs/guides/CueClose-Demo-Walkthrough.pdf`

---

## Classic vs Pro talking card

| Topic | Classic | Pro |
|---|---|---|
| Story focus | Approve → post → explain | Desk workload on top of Classic |
| Command | Open / awaiting / posted / variances | Waiting-on-me first |
| Inbox | Full core cue list | Show filter + waiting filter |
| Duplicates | Not emphasized | Acknowledge gate before approve |
| Best for | First-time stakeholders | Operators and peer engineers |

---

## Fallback lines

| If this happens | Say / do |
|---|---|
| API error on load | Retry; confirm the Node process is on port 3847 |
| Wrong persona for material cue | Switch to Maya; name the MATERIALITY rule |
| Already posted cue | Reset demo as Maya, then restart Block 2 |
| Stakeholder asks about real money movement | “Demo channels are simulated. No real payments leave this workspace.” |
| Engineer asks about database | “Seeded process memory today; store interface is swap-ready for Postgres.” |

---

## Guardrails (say out loud at least once)

- Models recommend; they do not post.
- Money is exact decimal, never binary float.
- Channels in this demo are simulated.
- All tour data is synthetic Horizon Arena Tour content.
- Personas are product fiction for the demo narrative.

---

## Related docs

- Architecture overview (HTML + PDF): `docs/architecture/`
- RM-ODP viewpoints and ADRs: `docs/architecture/`, `docs/decisions/`
- Diagrams: `docs/diagrams/`
- Short beat sheet: `docs/guides/demo-script.md`
