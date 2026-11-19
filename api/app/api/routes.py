"""Thin FastAPI route adapters."""

from fastapi import APIRouter, HTTPException

from app.api.schemas import HealthResponse, JournalValidationRequest, JournalValidationResponse
from app.domain.ledger import JournalValidationError, build_journal_draft

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", mode="foundation_demo", persistence="not_configured")


@router.post("/ledger/validate", response_model=JournalValidationResponse)
def validate_journal(request: JournalValidationRequest) -> JournalValidationResponse:
    try:
        draft = build_journal_draft(
            currency=request.currency,
            lines=[line.model_dump() for line in request.lines],
        )
    except JournalValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    return JournalValidationResponse(
        status="validated_not_posted",
        persisted=False,
        balanced=True,
        currency=draft.currency,
        debit_total=f"{draft.debit_total:.2f}",
        credit_total=f"{draft.credit_total:.2f}",
        line_count=len(draft.lines),
    )
