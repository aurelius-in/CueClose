"""Deterministic approval and autonomy policy for the demo."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from app.domain.models import Actor, ActorRole, CueStatus, InvoiceCue


@dataclass(frozen=True, slots=True)
class PolicyVerdict:
    allowed: bool
    code: str
    message: str


MATERIALITY = Decimal("2500.00")
MIN_CONFIDENCE_FOR_APPROVAL = 0.75

POSTING_ROLES = {ActorRole.TOUR_CONTROLLER, ActorRole.PRODUCTION_MANAGER}
CONTEXT_ONLY_ROLES = {ActorRole.TOUR_MANAGER, ActorRole.EXECUTIVE_PRODUCER, ActorRole.AUDITOR}


def can_decide(actor: Actor, cue: InvoiceCue) -> PolicyVerdict:
    """Server-side authority check. Channel messages never grant authority."""
    if actor.role in CONTEXT_ONLY_ROLES:
        return PolicyVerdict(
            False,
            "E-01-ROLE",
            f"Role {actor.role} may supply context but cannot approve or post.",
        )
    if actor.role == ActorRole.ADMINISTRATOR:
        return PolicyVerdict(False, "E-01-ADMIN", "Administrators configure policy; they do not approve.")
    if cue.status == CueStatus.HELD and actor.role != ActorRole.TOUR_CONTROLLER:
        return PolicyVerdict(
            False,
            "HOLD-ESCALATION",
            "Held cues require tour controller decision after context is attached.",
        )
    if cue.amount >= MATERIALITY and actor.role != ActorRole.TOUR_CONTROLLER:
        return PolicyVerdict(
            False,
            "MATERIALITY",
            f"Amounts at or above {MATERIALITY} require tour controller approval.",
        )
    if (
        cue.recommendation
        and cue.recommendation.confidence < MIN_CONFIDENCE_FOR_APPROVAL
        and actor.role != ActorRole.TOUR_CONTROLLER
    ):
        return PolicyVerdict(
            False,
            "LOW-CONFIDENCE",
            "Low-confidence recommendations require tour controller oversight.",
        )
    if actor.role in POSTING_ROLES:
        return PolicyVerdict(True, "OK", "Actor is within delegated approval authority.")
    return PolicyVerdict(False, "E-01-UNKNOWN", "No approval path matched.")


def can_post(actor: Actor, cue: InvoiceCue) -> PolicyVerdict:
    if cue.status != CueStatus.APPROVED:
        return PolicyVerdict(False, "STATE", "Only approved cues can be posted.")
    return can_decide(actor, cue)
