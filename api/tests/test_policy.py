"""Policy authority unit tests."""

from decimal import Decimal

from app.domain.models import (
    Actor,
    ActorRole,
    CueStatus,
    InvoiceCue,
    Recommendation,
)
from app.domain.policy import can_decide


def _cue(*, amount: str, confidence: float, status: CueStatus = CueStatus.AWAITING_APPROVAL) -> InvoiceCue:
    return InvoiceCue(
        id="cue_x",
        vendor_id="v",
        vendor_name="Vendor",
        currency="USD",
        amount=Decimal(amount),
        description="x",
        received_at="2026-11-01T00:00:00Z",
        status=status,
        suggested_show_id="show_chi",
        evidence=[],
        recommendation=Recommendation(
            account_code="6200",
            account_name="Production",
            show_id="show_chi",
            confidence=confidence,
            rationale="r",
            evidence_ids=[],
        ),
    )


def test_tour_manager_cannot_approve() -> None:
    actor = Actor("a", "Sam", ActorRole.TOUR_MANAGER)
    verdict = can_decide(actor, _cue(amount="100.00", confidence=0.9))
    assert verdict.allowed is False
    assert verdict.code == "E-01-ROLE"


def test_production_manager_can_approve_below_materiality() -> None:
    actor = Actor("a", "Jordan", ActorRole.PRODUCTION_MANAGER)
    verdict = can_decide(actor, _cue(amount="1840.50", confidence=0.88))
    assert verdict.allowed is True
