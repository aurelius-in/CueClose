"""Synthetic Northline Arena Tour seed data for the runnable demo."""

from __future__ import annotations

from decimal import Decimal

from app.domain.models import (
    Actor,
    ActorRole,
    CueStatus,
    InvoiceCue,
    Recommendation,
    ReconciliationItem,
    Show,
    SourceEvidence,
    Vendor,
    utc_now_iso,
)
from app.infrastructure.store import STORE, DemoStore


def reset_and_seed(store: DemoStore = STORE) -> DemoStore:
    """Replace runtime state with a deterministic synthetic tour dataset."""
    store.actors.clear()
    store.shows.clear()
    store.vendors.clear()
    store.cues.clear()
    store.approvals.clear()
    store.journals.clear()
    store.reconciliations.clear()
    store.audit.clear()
    store.idempotency.clear()

    store.tour_id = "tour_northline_2026"
    store.tour_name = "Northline Arena Tour"
    store.artist = "The Meridian Signal"
    store.season = "2026"
    store.currency = "USD"
    store.policy_version = "policy.v1.tour-close"

    for actor in (
        Actor("actor_maya", "Maya Chen", ActorRole.TOUR_CONTROLLER),
        Actor("actor_jordan", "Jordan Blake", ActorRole.PRODUCTION_MANAGER),
        Actor("actor_sam", "Sam Okonkwo", ActorRole.TOUR_MANAGER),
        Actor("actor_elena", "Elena Ruiz", ActorRole.EXECUTIVE_PRODUCER),
        Actor("actor_audit", "Priya Natarajan", ActorRole.AUDITOR),
        Actor("actor_admin", "Chris Vogel", ActorRole.ADMINISTRATOR),
    ):
        store.actors[actor.id] = actor

    for show in (
        Show(
            "show_chi",
            store.tour_id,
            "Chicago",
            "United Center",
            "Chicago, IL",
            "2026-11-12",
            "closed_pending_finance",
        ),
        Show(
            "show_det",
            store.tour_id,
            "Detroit",
            "Little Caesars Arena",
            "Detroit, MI",
            "2026-11-14",
            "closed_pending_finance",
        ),
        Show(
            "show_tor",
            store.tour_id,
            "Toronto",
            "Scotiabank Arena",
            "Toronto, ON",
            "2026-11-16",
            "in_settlement",
        ),
        Show(
            "show_bos",
            store.tour_id,
            "Boston",
            "TD Garden",
            "Boston, MA",
            "2026-11-18",
            "load_out",
        ),
    ):
        store.shows[show.id] = show

    for vendor in (
        Vendor("vendor_rig", "Northwind Rigging Co.", "production"),
        Vendor("vendor_cater", "Stagecraft Catering", "hospitality"),
        Vendor("vendor_freight", "Lakehaul Freight", "logistics"),
        Vendor("vendor_local", "Beacon Local Crew", "labor"),
        Vendor("vendor_radio", "Clearwave RF Services", "technical"),
    ):
        store.vendors[vendor.id] = vendor

    store.cues["cue_001"] = InvoiceCue(
        id="cue_001",
        vendor_id="vendor_rig",
        vendor_name="Northwind Rigging Co.",
        currency="USD",
        amount=Decimal("8650.00"),
        description="Arena overhead package and overnight stand-by for Chicago",
        received_at="2026-11-13T06:12:00Z",
        status=CueStatus.AWAITING_APPROVAL,
        suggested_show_id="show_chi",
        evidence=[
            SourceEvidence(
                "ev_001a",
                "pdf_invoice",
                "INV-88421 Northwind",
                "2026-11-13T06:10:00Z",
                "Overhead package CHI 11/12 · stand-by to 04:00 · PO TMS-441",
                "email_ingest",
            ),
            SourceEvidence(
                "ev_001b",
                "show_call_sheet",
                "Chicago call sheet",
                "2026-11-12T14:00:00Z",
                "Rigging load-in confirmed 08:00; overnight hold authorized by production.",
                "ops_packet",
            ),
        ],
        recommendation=Recommendation(
            account_code="6200",
            account_name="Production - Rigging",
            show_id="show_chi",
            confidence=0.91,
            rationale=(
                "Vendor category, PO TMS-441, and Chicago call sheet all point to show_chi. "
                "Amount exceeds production manager autonomy; tour controller approval required."
            ),
            evidence_ids=["ev_001a", "ev_001b"],
            policy_notes=["Materiality > 2500.00 requires tour_controller", "No auto-post"],
        ),
        approval_required=True,
        materiality_threshold=Decimal("2500.00"),
    )

    store.cues["cue_002"] = InvoiceCue(
        id="cue_002",
        vendor_id="vendor_cater",
        vendor_name="Stagecraft Catering",
        currency="USD",
        amount=Decimal("1840.50"),
        description="Artist and crew buyout for Detroit show day",
        received_at="2026-11-15T01:40:00Z",
        status=CueStatus.IN_REVIEW,
        suggested_show_id="show_det",
        evidence=[
            SourceEvidence(
                "ev_002a",
                "pdf_invoice",
                "SC-2291 Stagecraft",
                "2026-11-15T01:38:00Z",
                "Detroit buyout 84 covers · dietary riders attached",
                "email_ingest",
            ),
            SourceEvidence(
                "ev_002b",
                "rider_excerpt",
                "Hospitality rider §4",
                "2026-09-01T00:00:00Z",
                "Show-day buyout billed to hospitality per show unless festival buyout applies.",
                "contract_pack",
            ),
        ],
        recommendation=Recommendation(
            account_code="6400",
            account_name="Hospitality - Catering",
            show_id="show_det",
            confidence=0.88,
            rationale=(
                "Invoice references Detroit cover count and hospitality rider §4. "
                "Within production manager autonomy if show tagging is confirmed."
            ),
            evidence_ids=["ev_002a", "ev_002b"],
            policy_notes=["Below materiality threshold for tour_controller"],
        ),
        approval_required=True,
        materiality_threshold=Decimal("2500.00"),
    )

    store.cues["cue_003"] = InvoiceCue(
        id="cue_003",
        vendor_id="vendor_freight",
        vendor_name="Lakehaul Freight",
        currency="USD",
        amount=Decimal("4125.00"),
        description="Truck jump Detroit to Toronto plus border bond",
        received_at="2026-11-16T09:05:00Z",
        status=CueStatus.NEW,
        suggested_show_id="show_tor",
        evidence=[
            SourceEvidence(
                "ev_003a",
                "pdf_invoice",
                "LH-77302 Lakehaul",
                "2026-11-16T09:00:00Z",
                "Jump DET→YYZ · 3 trailers · border bond 375.00",
                "email_ingest",
            ),
            SourceEvidence(
                "ev_003b",
                "routing_sheet",
                "Tour routing week 46",
                "2026-11-10T12:00:00Z",
                "Detroit 11/14 · Toronto 11/16 · Boston 11/18",
                "ops_packet",
            ),
        ],
        recommendation=Recommendation(
            account_code="6300",
            account_name="Logistics - Freight",
            show_id="show_tor",
            confidence=0.84,
            rationale=(
                "Freight jump is attributed to the destination show (Toronto) per tour logistics policy. "
                "Border bond is included in the same freight control account for settlement."
            ),
            evidence_ids=["ev_003a", "ev_003b"],
            policy_notes=["Destination-show attribution for jumps", "Material approval required"],
        ),
        approval_required=True,
    )

    store.cues["cue_004"] = InvoiceCue(
        id="cue_004",
        vendor_id="vendor_radio",
        vendor_name="Clearwave RF Services",
        currency="USD",
        amount=Decimal("975.00"),
        description="RF coordination and spare pack for Boston",
        received_at="2026-11-18T20:22:00Z",
        status=CueStatus.HELD,
        suggested_show_id="show_bos",
        evidence=[
            SourceEvidence(
                "ev_004a",
                "pdf_invoice",
                "CW-551 Clearwave",
                "2026-11-18T20:20:00Z",
                "Boston RF day rate + spare pack · venue conflict note attached",
                "email_ingest",
            )
        ],
        recommendation=Recommendation(
            account_code="6500",
            account_name="Technical - RF",
            show_id="show_bos",
            confidence=0.67,
            rationale=(
                "Likely Boston technical cost, but venue conflict note mentions a shared bill with "
                "house RF. Hold for tour manager context before approval."
            ),
            evidence_ids=["ev_004a"],
            policy_notes=["Low confidence < 0.75 forces hold path"],
        ),
        approval_required=True,
        hold_reason="Shared house RF language needs tour manager clarification",
    )

    store.cues["cue_005"] = InvoiceCue(
        id="cue_005",
        vendor_id="vendor_local",
        vendor_name="Beacon Local Crew",
        currency="USD",
        amount=Decimal("3200.00"),
        description="Local stagehands and forklift for Toronto load-in",
        received_at="2026-11-16T18:45:00Z",
        status=CueStatus.NEW,
        suggested_show_id="show_tor",
        evidence=[
            SourceEvidence(
                "ev_005a",
                "pdf_invoice",
                "BLC-1904 Beacon",
                "2026-11-16T18:40:00Z",
                "Load-in 22 hands · 2 forklifts · steward overtime 2.0 hrs",
                "email_ingest",
            ),
            SourceEvidence(
                "ev_005b",
                "timesheet_summary",
                "Toronto steward summary",
                "2026-11-16T17:00:00Z",
                "Hands matched call sheet; overtime confirmed by production manager on site.",
                "ops_packet",
            ),
        ],
        recommendation=Recommendation(
            account_code="6100",
            account_name="Labor - Local Crew",
            show_id="show_tor",
            confidence=0.93,
            rationale=(
                "Steward summary and call sheet agree on headcount. "
                "Overtime is evidenced and within labor policy for settlement."
            ),
            evidence_ids=["ev_005a", "ev_005b"],
            policy_notes=["Material approval required"],
        ),
        approval_required=True,
    )

    # Seed one unexplained variance to demonstrate reconciliation discipline.
    store.reconciliations["rec_001"] = ReconciliationItem(
        id="rec_001",
        show_id="show_chi",
        account_code="6200",
        ledger_amount=Decimal("0.00"),
        legacy_amount=Decimal("8650.00"),
        variance=Decimal("-8650.00"),
        status="unexplained",
        explanation=None,
    )
    store.reconciliations["rec_002"] = ReconciliationItem(
        id="rec_002",
        show_id="show_det",
        account_code="6400",
        ledger_amount=Decimal("0.00"),
        legacy_amount=Decimal("1800.00"),
        variance=Decimal("-1800.00"),
        status="unexplained",
        explanation=None,
    )

    store.seeded = True
    store.audit.append(
        __import__("app.domain.models", fromlist=["AuditEvent"]).AuditEvent(
            id="audit_seed",
            at=utc_now_iso(),
            actor_id="system",
            actor_name="CueClose Demo Runtime",
            action="demo.seeded",
            entity_type="tour",
            entity_id=store.tour_id,
            summary="Synthetic Northline Arena Tour dataset loaded",
            details={"cue_count": len(store.cues), "show_count": len(store.shows)},
        )
    )
    return store


def ensure_seeded(store: DemoStore = STORE) -> DemoStore:
    if not store.seeded:
        return reset_and_seed(store)
    return store
