"""Process-local demo store. Swap-ready behind repository accessors."""

from __future__ import annotations

from dataclasses import dataclass, field

from app.domain.models import (
    Actor,
    ApprovalRecord,
    AuditEvent,
    InvoiceCue,
    JournalEntry,
    ReconciliationItem,
    Show,
    TourSummary,
    Vendor,
)


@dataclass
class DemoStore:
    tour_id: str = "tour_northline_2026"
    tour_name: str = "Northline Arena Tour"
    artist: str = "The Meridian Signal"
    season: str = "2026"
    currency: str = "USD"
    actors: dict[str, Actor] = field(default_factory=dict)
    shows: dict[str, Show] = field(default_factory=dict)
    vendors: dict[str, Vendor] = field(default_factory=dict)
    cues: dict[str, InvoiceCue] = field(default_factory=dict)
    approvals: dict[str, ApprovalRecord] = field(default_factory=dict)
    journals: dict[str, JournalEntry] = field(default_factory=dict)
    reconciliations: dict[str, ReconciliationItem] = field(default_factory=dict)
    audit: list[AuditEvent] = field(default_factory=list)
    idempotency: dict[str, str] = field(default_factory=dict)
    policy_version: str = "policy.v1.tour-close"
    seeded: bool = False

    def tour_summary(self) -> TourSummary:
        cues = list(self.cues.values())
        return TourSummary(
            id=self.tour_id,
            name=self.tour_name,
            artist=self.artist,
            season=self.season,
            currency=self.currency,
            shows=sorted(self.shows.values(), key=lambda s: s.show_date),
            open_cues=sum(1 for c in cues if c.status.value in {"new", "in_review", "held"}),
            awaiting_approval=sum(1 for c in cues if c.status.value == "awaiting_approval"),
            posted_today=sum(1 for c in cues if c.status.value in {"posted", "reconciled"}),
            unexplained_variances=sum(1 for r in self.reconciliations.values() if r.status == "unexplained"),
        )


STORE = DemoStore()
