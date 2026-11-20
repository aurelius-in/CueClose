"""Application services for cue review, approval, posting, and reconciliation."""

from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from app.domain.ledger import JournalValidationError, build_journal_draft
from app.domain.models import (
    ApprovalDecision,
    ApprovalRecord,
    AuditEvent,
    CueStatus,
    JournalEntry,
    JournalLineRecord,
    ReconciliationItem,
    utc_now_iso,
)
from app.domain.money import format_money
from app.domain.policy import can_decide, can_post
from app.infrastructure.seed import ensure_seeded, reset_and_seed
from app.infrastructure.store import STORE, DemoStore


class WorkflowError(Exception):
    def __init__(self, message: str, *, code: str = "workflow_error") -> None:
        super().__init__(message)
        self.code = code


def _audit(
    store: DemoStore,
    *,
    actor_id: str,
    actor_name: str,
    action: str,
    entity_type: str,
    entity_id: str,
    summary: str,
    details: dict | None = None,
) -> None:
    store.audit.insert(
        0,
        AuditEvent(
            id=f"audit_{uuid4().hex[:10]}",
            at=utc_now_iso(),
            actor_id=actor_id,
            actor_name=actor_name,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            summary=summary,
            details=details or {},
        ),
    )


def get_dashboard(store: DemoStore = STORE) -> dict:
    ensure_seeded(store)
    summary = store.tour_summary()
    return {
        "tour": {
            "id": summary.id,
            "name": summary.name,
            "artist": summary.artist,
            "season": summary.season,
            "currency": summary.currency,
        },
        "metrics": {
            "open_cues": summary.open_cues,
            "awaiting_approval": summary.awaiting_approval,
            "posted_entries": summary.posted_today,
            "unexplained_variances": summary.unexplained_variances,
        },
        "shows": [
            {
                "id": s.id,
                "name": s.name,
                "venue": s.venue,
                "city": s.city,
                "show_date": s.show_date,
                "status": s.status,
            }
            for s in summary.shows
        ],
        "actors": [{"id": a.id, "name": a.name, "role": a.role.value} for a in store.actors.values()],
        "policy_version": store.policy_version,
    }


def list_cues(store: DemoStore = STORE) -> list[dict]:
    ensure_seeded(store)
    ordered = sorted(store.cues.values(), key=lambda c: c.received_at, reverse=True)
    return [_serialize_cue(c) for c in ordered]


def get_cue(cue_id: str, store: DemoStore = STORE) -> dict:
    ensure_seeded(store)
    cue = store.cues.get(cue_id)
    if cue is None:
        raise WorkflowError(f"Unknown cue: {cue_id}", code="not_found")
    return _serialize_cue(cue)


def advance_to_review(cue_id: str, actor_id: str, store: DemoStore = STORE) -> dict:
    ensure_seeded(store)
    actor = store.actors.get(actor_id)
    cue = store.cues.get(cue_id)
    if actor is None or cue is None:
        raise WorkflowError("Unknown actor or cue", code="not_found")
    if cue.status not in {CueStatus.NEW, CueStatus.HELD}:
        raise WorkflowError(f"Cue cannot enter review from {cue.status}", code="invalid_state")
    cue.status = CueStatus.IN_REVIEW
    if cue.recommendation and cue.recommendation.confidence >= 0.75:
        cue.status = CueStatus.AWAITING_APPROVAL
    _audit(
        store,
        actor_id=actor.id,
        actor_name=actor.name,
        action="cue.reviewed",
        entity_type="cue",
        entity_id=cue.id,
        summary=f"{actor.name} opened review for {cue.vendor_name}",
        details={"status": cue.status.value},
    )
    return _serialize_cue(cue)


def decide_approval(
    *,
    cue_id: str,
    actor_id: str,
    decision: str,
    reason: str,
    store: DemoStore = STORE,
) -> dict:
    ensure_seeded(store)
    actor = store.actors.get(actor_id)
    cue = store.cues.get(cue_id)
    if actor is None or cue is None:
        raise WorkflowError("Unknown actor or cue", code="not_found")
    if cue.status not in {CueStatus.AWAITING_APPROVAL, CueStatus.IN_REVIEW, CueStatus.HELD}:
        raise WorkflowError(f"Cue is not approvable from {cue.status}", code="invalid_state")
    try:
        decision_enum = ApprovalDecision(decision)
    except ValueError as exc:
        raise WorkflowError("decision must be approve, reject, or hold", code="invalid_input") from exc
    if not reason.strip():
        raise WorkflowError("A reason is required for every decision", code="invalid_input")

    verdict = can_decide(actor, cue)
    if decision_enum == ApprovalDecision.APPROVE and not verdict.allowed:
        raise WorkflowError(verdict.message, code=verdict.code)
    if decision_enum == ApprovalDecision.HOLD and actor.role.value not in {
        "tour_controller",
        "production_manager",
        "tour_manager",
    }:
        raise WorkflowError("Only operations roles may place a hold", code="E-01-ROLE")

    record = ApprovalRecord(
        id=f"apr_{uuid4().hex[:10]}",
        cue_id=cue.id,
        actor_id=actor.id,
        actor_name=actor.name,
        actor_role=actor.role,
        decision=decision_enum,
        reason=reason.strip(),
        policy_version=store.policy_version,
        state_version=len([a for a in store.approvals.values() if a.cue_id == cue.id]) + 1,
        decided_at=utc_now_iso(),
    )
    store.approvals[record.id] = record

    if decision_enum == ApprovalDecision.APPROVE:
        cue.status = CueStatus.APPROVED
        cue.hold_reason = None
    elif decision_enum == ApprovalDecision.REJECT:
        cue.status = CueStatus.HELD
        cue.hold_reason = reason.strip()
    else:
        cue.status = CueStatus.HELD
        cue.hold_reason = reason.strip()

    _audit(
        store,
        actor_id=actor.id,
        actor_name=actor.name,
        action=f"approval.{decision_enum.value}",
        entity_type="cue",
        entity_id=cue.id,
        summary=f"{actor.name} recorded {decision_enum.value} on {cue.id}",
        details={
            "reason": record.reason,
            "policy_version": record.policy_version,
            "state_version": record.state_version,
            "verdict_code": verdict.code,
        },
    )
    return {
        "cue": _serialize_cue(cue),
        "approval": {
            "id": record.id,
            "decision": record.decision.value,
            "actor_name": record.actor_name,
            "actor_role": record.actor_role.value,
            "reason": record.reason,
            "policy_version": record.policy_version,
            "state_version": record.state_version,
            "decided_at": record.decided_at,
        },
    }


def post_cue(
    *,
    cue_id: str,
    actor_id: str,
    idempotency_key: str,
    store: DemoStore = STORE,
) -> dict:
    ensure_seeded(store)
    actor = store.actors.get(actor_id)
    cue = store.cues.get(cue_id)
    if actor is None or cue is None:
        raise WorkflowError("Unknown actor or cue", code="not_found")
    if not idempotency_key.strip():
        raise WorkflowError("idempotency_key is required", code="invalid_input")

    existing = store.idempotency.get(idempotency_key)
    if existing and existing in store.journals:
        journal = store.journals[existing]
        return {"idempotent_replay": True, "journal": _serialize_journal(journal), "cue": _serialize_cue(cue)}

    verdict = can_post(actor, cue)
    if not verdict.allowed:
        raise WorkflowError(verdict.message, code=verdict.code)
    if cue.recommendation is None:
        raise WorkflowError("Cannot post without a recommendation", code="invalid_state")

    expense = cue.recommendation.account_code
    expense_name = cue.recommendation.account_name
    show_id = cue.recommendation.show_id
    amount = format_money(cue.amount)
    try:
        draft = build_journal_draft(
            currency=cue.currency,
            lines=[
                {
                    "account_code": expense,
                    "show_id": show_id,
                    "debit": amount,
                    "credit": "0.00",
                },
                {
                    "account_code": "2000",
                    "show_id": show_id,
                    "debit": "0.00",
                    "credit": amount,
                },
            ],
        )
    except JournalValidationError as exc:
        raise WorkflowError(str(exc), code="ledger_invariant") from exc

    journal = JournalEntry(
        id=f"je_{uuid4().hex[:10]}",
        cue_id=cue.id,
        currency=draft.currency,
        lines=[
            JournalLineRecord(
                account_code=expense,
                account_name=expense_name,
                debit=cue.amount,
                credit=Decimal("0.00"),
                show_id=show_id,
            ),
            JournalLineRecord(
                account_code="2000",
                account_name="Accounts Payable",
                debit=Decimal("0.00"),
                credit=cue.amount,
                show_id=show_id,
            ),
        ],
        posted_at=utc_now_iso(),
        posted_by=actor.id,
        idempotency_key=idempotency_key,
        memo=f"Post {cue.id} · {cue.vendor_name}",
    )
    store.journals[journal.id] = journal
    store.idempotency[idempotency_key] = journal.id
    cue.status = CueStatus.POSTED
    cue.posted_journal_id = journal.id

    # Refresh reconciliation for this show/account once posted.
    if show_id:
        _sync_reconciliation_after_post(store, show_id=show_id, account_code=expense, posted=cue.amount)

    _audit(
        store,
        actor_id=actor.id,
        actor_name=actor.name,
        action="ledger.posted",
        entity_type="journal",
        entity_id=journal.id,
        summary=f"Posted balanced journal for {cue.vendor_name}",
        details={
            "cue_id": cue.id,
            "debit_total": format_money(draft.debit_total),
            "credit_total": format_money(draft.credit_total),
            "idempotency_key": idempotency_key,
        },
    )
    return {"idempotent_replay": False, "journal": _serialize_journal(journal), "cue": _serialize_cue(cue)}


def list_journals(store: DemoStore = STORE) -> list[dict]:
    ensure_seeded(store)
    return [
        _serialize_journal(j)
        for j in sorted(store.journals.values(), key=lambda x: x.posted_at, reverse=True)
    ]


def list_reconciliations(store: DemoStore = STORE) -> list[dict]:
    ensure_seeded(store)
    return [_serialize_recon(r) for r in store.reconciliations.values()]


def explain_variance(
    *,
    recon_id: str,
    actor_id: str,
    explanation: str,
    store: DemoStore = STORE,
) -> dict:
    ensure_seeded(store)
    actor = store.actors.get(actor_id)
    item = store.reconciliations.get(recon_id)
    if actor is None or item is None:
        raise WorkflowError("Unknown actor or reconciliation item", code="not_found")
    if not explanation.strip():
        raise WorkflowError(
            "Explanation is required; variances are never auto-corrected", code="invalid_input"
        )
    item.explanation = explanation.strip()
    item.explained_by = actor.id
    item.status = "explained"
    _audit(
        store,
        actor_id=actor.id,
        actor_name=actor.name,
        action="reconciliation.explained",
        entity_type="reconciliation",
        entity_id=item.id,
        summary=f"Explained variance on {item.account_code} / {item.show_id}",
        details={"variance": format_money(item.variance), "explanation": item.explanation},
    )
    return _serialize_recon(item)


def list_audit(store: DemoStore = STORE, limit: int = 50) -> list[dict]:
    ensure_seeded(store)
    return [
        {
            "id": e.id,
            "at": e.at,
            "actor_id": e.actor_id,
            "actor_name": e.actor_name,
            "action": e.action,
            "entity_type": e.entity_type,
            "entity_id": e.entity_id,
            "summary": e.summary,
            "details": e.details,
        }
        for e in store.audit[:limit]
    ]


def reset_demo(store: DemoStore = STORE) -> dict:
    reset_and_seed(store)
    return {"status": "reset", "tour_id": store.tour_id, "cue_count": len(store.cues)}


def _sync_reconciliation_after_post(
    store: DemoStore, *, show_id: str, account_code: str, posted: Decimal
) -> None:
    for item in store.reconciliations.values():
        if item.show_id == show_id and item.account_code == account_code:
            item.ledger_amount = item.ledger_amount + posted
            item.variance = item.ledger_amount - item.legacy_amount
            if item.variance == Decimal("0.00"):
                item.status = "matched"
                item.explanation = item.explanation or "Ledger now matches legacy snapshot after posting."
            elif item.status == "matched":
                item.status = "unexplained"
            return
    # Create a new reconciliation row if legacy had no placeholder.
    store.reconciliations[f"rec_{uuid4().hex[:8]}"] = ReconciliationItem(
        id=f"rec_{uuid4().hex[:8]}",
        show_id=show_id,
        account_code=account_code,
        ledger_amount=posted,
        legacy_amount=Decimal("0.00"),
        variance=posted,
        status="unexplained",
    )


def _serialize_cue(cue) -> dict:
    return {
        "id": cue.id,
        "vendor_id": cue.vendor_id,
        "vendor_name": cue.vendor_name,
        "currency": cue.currency,
        "amount": format_money(cue.amount),
        "description": cue.description,
        "received_at": cue.received_at,
        "status": cue.status.value,
        "suggested_show_id": cue.suggested_show_id,
        "approval_required": cue.approval_required,
        "materiality_threshold": format_money(cue.materiality_threshold),
        "posted_journal_id": cue.posted_journal_id,
        "hold_reason": cue.hold_reason,
        "evidence": [
            {
                "id": e.id,
                "kind": e.kind,
                "label": e.label,
                "captured_at": e.captured_at,
                "excerpt": e.excerpt,
                "channel": e.channel,
            }
            for e in cue.evidence
        ],
        "recommendation": None
        if cue.recommendation is None
        else {
            "account_code": cue.recommendation.account_code,
            "account_name": cue.recommendation.account_name,
            "show_id": cue.recommendation.show_id,
            "confidence": cue.recommendation.confidence,
            "rationale": cue.recommendation.rationale,
            "evidence_ids": cue.recommendation.evidence_ids,
            "policy_notes": cue.recommendation.policy_notes,
        },
    }


def _serialize_journal(journal: JournalEntry) -> dict:
    return {
        "id": journal.id,
        "cue_id": journal.cue_id,
        "currency": journal.currency,
        "posted_at": journal.posted_at,
        "posted_by": journal.posted_by,
        "idempotency_key": journal.idempotency_key,
        "reversal_of": journal.reversal_of,
        "memo": journal.memo,
        "lines": [
            {
                "account_code": line.account_code,
                "account_name": line.account_name,
                "debit": format_money(line.debit),
                "credit": format_money(line.credit),
                "show_id": line.show_id,
            }
            for line in journal.lines
        ],
        "debit_total": format_money(sum((line.debit for line in journal.lines), Decimal("0.00"))),
        "credit_total": format_money(sum((line.credit for line in journal.lines), Decimal("0.00"))),
    }


def _serialize_recon(item: ReconciliationItem) -> dict:
    return {
        "id": item.id,
        "show_id": item.show_id,
        "account_code": item.account_code,
        "ledger_amount": format_money(item.ledger_amount),
        "legacy_amount": format_money(item.legacy_amount),
        "variance": format_money(item.variance),
        "status": item.status,
        "explanation": item.explanation,
        "explained_by": item.explained_by,
    }
