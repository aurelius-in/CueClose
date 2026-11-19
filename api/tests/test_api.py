"""FastAPI contract tests for health and journal-draft validation."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_is_explicit_about_demo_limits() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "mode": "foundation_demo", "persistence": "not_configured"}


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
