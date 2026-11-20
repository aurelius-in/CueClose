"""FastAPI contract tests for health, validation, and workflow paths."""

from fastapi.testclient import TestClient

from app.application.workflow import reset_demo
from app.main import app

client = TestClient(app)


def setup_function() -> None:
    reset_demo()


def test_health_reports_seeded_demo_runtime() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["mode"] == "synthetic_tour_demo"
    assert body["persistence"] == "process_memory_seeded"
    assert body["tour_id"] == "tour_northline_2026"


def test_balanced_journal_validation_is_not_posting() -> None:
    response = client.post(
        "/api/v1/ledger/validate",
        json={
            "currency": "USD",
            "lines": [
                {"account_code": "6200", "debit": "6500.00", "credit": "0.00"},
                {"account_code": "2000", "debit": "0.00", "credit": "6500.00"},
            ],
        },
    )
    assert response.status_code == 200
    assert response.json()["status"] == "validated_not_posted"
    assert response.json()["persisted"] is False


def test_unbalanced_journal_validation_returns_422() -> None:
    response = client.post(
        "/api/v1/ledger/validate",
        json={
            "currency": "USD",
            "lines": [
                {"account_code": "6200", "debit": "10.00", "credit": "0.00"},
                {"account_code": "2000", "debit": "0.00", "credit": "9.99"},
            ],
        },
    )
    assert response.status_code == 422


def test_money_as_json_number_is_rejected() -> None:
    response = client.post(
        "/api/v1/ledger/validate",
        json={
            "currency": "USD",
            "lines": [
                {"account_code": "6200", "debit": 1.25, "credit": "0.00"},
                {"account_code": "2000", "debit": "0.00", "credit": "1.25"},
            ],
        },
    )
    assert response.status_code == 422


def test_dashboard_and_cues_are_seeded() -> None:
    dashboard = client.get("/api/v1/demo/dashboard")
    assert dashboard.status_code == 200
    assert dashboard.json()["tour"]["name"] == "Northline Arena Tour"
    cues = client.get("/api/v1/cues")
    assert cues.status_code == 200
    assert len(cues.json()) >= 5


def test_production_manager_cannot_approve_material_amount() -> None:
    response = client.post(
        "/api/v1/cues/cue_001/approvals",
        json={
            "actor_id": "actor_jordan",
            "decision": "approve",
            "reason": "Looks fine",
        },
    )
    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "MATERIALITY"


def test_tour_controller_can_approve_and_post_with_idempotency() -> None:
    approve = client.post(
        "/api/v1/cues/cue_001/approvals",
        json={
            "actor_id": "actor_maya",
            "decision": "approve",
            "reason": "PO TMS-441 and Chicago call sheet agree.",
        },
    )
    assert approve.status_code == 200
    assert approve.json()["cue"]["status"] == "approved"

    first = client.post(
        "/api/v1/cues/cue_001/post",
        json={"actor_id": "actor_maya", "idempotency_key": "demo-post-cue-001"},
    )
    assert first.status_code == 200
    assert first.json()["idempotent_replay"] is False
    assert first.json()["cue"]["status"] == "posted"
    assert first.json()["journal"]["debit_total"] == "8650.00"

    second = client.post(
        "/api/v1/cues/cue_001/post",
        json={"actor_id": "actor_maya", "idempotency_key": "demo-post-cue-001"},
    )
    assert second.status_code == 200
    assert second.json()["idempotent_replay"] is True
    assert second.json()["journal"]["id"] == first.json()["journal"]["id"]


def test_variance_explanation_never_auto_corrects_amounts() -> None:
    before = client.get("/api/v1/reconciliation").json()
    target = next(item for item in before if item["id"] == "rec_002")
    response = client.post(
        "/api/v1/reconciliation/rec_002/explain",
        json={
            "actor_id": "actor_maya",
            "explanation": "Legacy export omitted tax-exclusive tip pool timing.",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "explained"
    assert body["variance"] == target["variance"]
    assert body["ledger_amount"] == target["ledger_amount"]
