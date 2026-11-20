# Walkthrough script — CueClose × Northline working session

**Tone:** calm, precise, slightly humble, collaborative. You are not pitching theater. You are running a normal design/architecture working session with teammates.

**Props:** architecture PDF, live app with Edition toggle (Baseline ↔ Northline pilot), before/after mockups in the PDF.

**Time box suggestion:** ~25–35 minutes plus open Q&A.

---

## 0. Open (90 seconds)

“Thanks for spending time on this. I brought a small touring-finance demo called CueClose, plus a hypothetical client engagement with Northline Live Entertainment from an IPR-style call.

I’m going to treat this the way I’d treat a real working session: show what exists, show what the client asked for, show a thin slice I already implemented, and leave the thornier orchestration questions for us to design together. If something feels off, interrupt me. I’d rather course-correct than finish a monologue.”

---

## 1. Why two editions side-by-side (60–90 seconds)

Switch the header **Edition** control into view.

“I’m showing Baseline and Northline pilot in the same app on purpose.

In a normal team session we don’t throw away the working spine to impress people. We keep the known-good path visible, then prove a reversible delta. Baseline is the pre-ask product: cues, evidence, role gates, posting, reconciliation, audit. Pilot adds three mechanical Northline asks: waiting-on-me, show filters, and a duplicate acknowledge gate.

That also mirrors how I’d work with a client: never pretend the wishlist is already shipped, and never demo vapor.”

---

## 2. Client story in one breath (60 seconds)

“Northline doesn’t want to rip out NetSuite next month. They want an exception desk beside it. Dana, the EP, is tired of Slack archaeology. Marcus, the controller, will walk if we silently rewrite ledgers or auto-post material spend. Priya needs city filters and duplicate protection. Chris will tap a text for ‘which show?’ but will not open a desktop portal during changeover.

So the architecture bar is: same decisions, same controls, better plumbing, ambient where it earns adoption, parallel run until reconciliation deltas are boring.”

---

## 3. Baseline tour (3–4 minutes)

Set Edition = **Baseline**.

1. Command: metrics, show slate, persona switch.  
2. Cue inbox: inspect Northwind or Stagecraft.  
3. Show evidence + recommendation.  
4. Switch to Jordan, try material approve if useful (deny).  
5. Approve as Maya, post, mention idempotency briefly.  
6. Reconciliation unexplained variance.  
7. Audit trail.

“This is the honest spine. It’s already opinionated about authority: the browser doesn’t get to invent who approved.”

---

## 4. Open the PDF — before/after (2 minutes)

“Here’s the visual argument for the Command redesign. Before: tour overview first. After: waiting-on-me first, with Northline copper as a client accent, not a product identity swap.

I’m not trying to make CueClose look like a nightclub. Finance-serious chrome, expressive splash only. That matched Dana’s note and Marcus’s trust posture.”

Point at duplicate mockup page.

“Duplicate warning is intentionally interrupting. Approving a PA resubmit should feel slightly annoying. That’s the feature.”

---

## 5. Pilot edition live (4–5 minutes)

Set Edition = **Northline pilot**.

1. Command: Waiting on me list; switch personas and show the queue change.  
2. Inbox: show filter Chicago/Detroit; waiting-on-me toggle.  
3. Open `cue_006` Stagecraft resubmit: duplicate panel vs `cue_002`.  
4. Try Approve without checkbox (disabled / 409). Acknowledge, approve.

“These were the two asks that were valuable and mostly mechanical, so I shipped them before this session. That frees us to spend brainpower on the harder ones.”

---

## 6. Architecture narrative (5–6 minutes)

Walk PDF context map + module table + sequences.

Talking points:

- Parallel run context: CueClose explains deltas; it does not overwrite NetSuite.  
- Modular monolith: classification recommends, policy decides, ledger posts, orchestration later routes humans.  
- “Channels are doors; server owns state.”  
- Progressive autonomy defaults to shadow.  
- Concerns you’d raise unprompted: ambient before decision_request design; shared demo stores vs tenant isolation; LLM free-form SQL.

“I’m deliberately leaving needs-info, ambient message cards, and cited producer asks unimplemented. Those have real tradeoffs around identity, expiry, escalation, and query safety. That’s the collaborative part.”

---

## 7. Invite the room (pivot)

“If we had thirty minutes to implement something together, I’d vote for either:

A) needs-info assign-show with a simulated Teams card and expiry, or  
B) a registered ask: ‘Why did Detroit hospitality move?’ with citations.

Which feels more useful to explore?”

Then follow their lead. Stay flexible. Summarize tradeoffs before coding.

---

## 8. Close (45 seconds)

“Regardless of what we build next, I’d keep three promises to Northline: no silent ledger magic, shadow before autonomy, and ambient UX that still hits the same authorization path.

Happy to dig into any ‘what if the client wanted X instead’ angle. That’s usually where the real architecture work shows up.”

---

## Delivery posture checklist

- [ ] Speak slowly; leave silence after demos  
- [ ] Say “I don’t know yet” if true, then propose how you’d learn  
- [ ] Prefer diagrams over jargon piles  
- [ ] Credit client tension (Marcus vs Dana) as useful requirements, not drama  
- [ ] Never claim simulated Slack is a finished Entra connector  
- [ ] Offer alternatives when challenged; don’t defend a design as sacred  
