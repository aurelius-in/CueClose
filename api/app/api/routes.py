"""Thin FastAPI route adapters for CueClose workflows."""

from fastapi import APIRouter, HTTPException

from app.api.schemas import (
    ActorRef,
    ApprovalRequest,
    ExplainVarianceRequest,
    HealthResponse,
    JournalValidationRequest,
    JournalValidationResponse,
    PostRequest,
)
from app.application import workflow
from app.application.workflow import WorkflowError
from app.domain.ledger import JournalValidationError, build_journal_draft
from app.infrastructure.seed import ensure_seeded
from app.infrastructure.store import STORE

router = APIRouter()


def _http(exc: WorkflowError) -> HTTPException:
    status = 404 if exc.code == "not_found" else 409 if exc.code in {"invalid_state", "STATE"} else 403
    if exc.code in {"invalid_input", "ledger_invariant"}:
        status = 422
    return HTTPException(status_code=status, detail={"code": exc.code, "message": str(exc)})


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    ensure_seeded(STORE)
    return HealthResponse(
        status="ok",
        mode="synthetic_tour_demo",
        persistence="process_memory_seeded",
        tour_id=STORE.tour_id,
    )


@router.get("/demo/dashboard")
def dashboard() -> dict:
    return workflow.get_dashboard()


@router.post("/demo/reset")
def reset_demo() -> dict:
    return workflow.reset_demo()


@router.get("/cues")
def cues() -> list[dict]:
    return workflow.list_cues()


@router.get("/cues/{cue_id}")
def cue_detail(cue_id: str) -> dict:
    try:
        return workflow.get_cue(cue_id)
    except WorkflowError as exc:
        raise _http(exc) from exc


@router.post("/cues/{cue_id}/review")
def review_cue(cue_id: str, body: ActorRef) -> dict:
    try:
        return workflow.advance_to_review(cue_id, body.actor_id)
    except WorkflowError as exc:
        raise _http(exc) from exc


@router.post("/cues/{cue_id}/approvals")
def approve_cue(cue_id: str, body: ApprovalRequest) -> dict:
    try:
        return workflow.decide_approval(
            cue_id=cue_id,
            actor_id=body.actor_id,
            decision=body.decision,
            reason=body.reason,
        )
    except WorkflowError as exc:
        raise _http(exc) from exc


@router.post("/cues/{cue_id}/post")
def post_cue(cue_id: str, body: PostRequest) -> dict:
    try:
        return workflow.post_cue(
            cue_id=cue_id,
            actor_id=body.actor_id,
            idempotency_key=body.idempotency_key,
        )
    except WorkflowError as exc:
        raise _http(exc) from exc


@router.get("/ledger/journals")
def journals() -> list[dict]:
    return workflow.list_journals()


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


@router.get("/reconciliation")
def reconciliation() -> list[dict]:
    return workflow.list_reconciliations()


@router.post("/reconciliation/{recon_id}/explain")
def explain(recon_id: str, body: ExplainVarianceRequest) -> dict:
    try:
        return workflow.explain_variance(
            recon_id=recon_id,
            actor_id=body.actor_id,
            explanation=body.explanation,
        )
    except WorkflowError as exc:
        raise _http(exc) from exc


@router.get("/audit")
def audit(limit: int = 50) -> list[dict]:
    return workflow.list_audit(limit=min(max(limit, 1), 200))
