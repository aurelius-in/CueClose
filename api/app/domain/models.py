"""Domain value objects and entity shapes for the demo runtime."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from enum import StrEnum
from typing import Any


class CueStatus(StrEnum):
    NEW = "new"
    IN_REVIEW = "in_review"
    AWAITING_APPROVAL = "awaiting_approval"
    APPROVED = "approved"
    POSTED = "posted"
    RECONCILED = "reconciled"
    HELD = "held"


class ApprovalDecision(StrEnum):
    APPROVE = "approve"
    REJECT = "reject"
    HOLD = "hold"


class ActorRole(StrEnum):
    TOUR_CONTROLLER = "tour_controller"
    PRODUCTION_MANAGER = "production_manager"
    TOUR_MANAGER = "tour_manager"
    EXECUTIVE_PRODUCER = "executive_producer"
    AUDITOR = "auditor"
    ADMINISTRATOR = "administrator"


@dataclass(frozen=True, slots=True)
class Actor:
    id: str
    name: str
    role: ActorRole


@dataclass(slots=True)
class Show:
    id: str
    tour_id: str
    name: str
    venue: str
    city: str
    show_date: str
    status: str


@dataclass(slots=True)
class Vendor:
    id: str
    name: str
    category: str


@dataclass(slots=True)
class SourceEvidence:
    id: str
    kind: str
    label: str
    captured_at: str
    excerpt: str
    channel: str


@dataclass(slots=True)
class Recommendation:
    account_code: str
    account_name: str
    show_id: str | None
    confidence: float
    rationale: str
    evidence_ids: list[str]
    policy_notes: list[str] = field(default_factory=list)


@dataclass(slots=True)
class InvoiceCue:
    id: str
    vendor_id: str
    vendor_name: str
    currency: str
    amount: Decimal
    description: str
    received_at: str
    status: CueStatus
    suggested_show_id: str | None
    evidence: list[SourceEvidence]
    recommendation: Recommendation | None = None
    approval_required: bool = True
    materiality_threshold: Decimal = Decimal("2500.00")
    posted_journal_id: str | None = None
    hold_reason: str | None = None


@dataclass(slots=True)
class ApprovalRecord:
    id: str
    cue_id: str
    actor_id: str
    actor_name: str
    actor_role: ActorRole
    decision: ApprovalDecision
    reason: str
    policy_version: str
    state_version: int
    decided_at: str


@dataclass(slots=True)
class JournalLineRecord:
    account_code: str
    account_name: str
    debit: Decimal
    credit: Decimal
    show_id: str | None = None


@dataclass(slots=True)
class JournalEntry:
    id: str
    cue_id: str
    currency: str
    lines: list[JournalLineRecord]
    posted_at: str
    posted_by: str
    idempotency_key: str
    reversal_of: str | None = None
    memo: str = ""


@dataclass(slots=True)
class LegacySnapshotLine:
    account_code: str
    show_id: str | None
    amount: Decimal
    side: str


@dataclass(slots=True)
class ReconciliationItem:
    id: str
    show_id: str
    account_code: str
    ledger_amount: Decimal
    legacy_amount: Decimal
    variance: Decimal
    status: str
    explanation: str | None = None
    explained_by: str | None = None


@dataclass(slots=True)
class AuditEvent:
    id: str
    at: str
    actor_id: str
    actor_name: str
    action: str
    entity_type: str
    entity_id: str
    summary: str
    details: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class TourSummary:
    id: str
    name: str
    artist: str
    season: str
    currency: str
    shows: list[Show]
    open_cues: int
    awaiting_approval: int
    posted_today: int
    unexplained_variances: int


def utc_now_iso() -> str:
    from datetime import UTC

    stamp = datetime.now(tz=UTC).replace(microsecond=0).isoformat()
    return stamp.replace("+00:00", "Z")
