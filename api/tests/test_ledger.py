"""Tests for exact-decimal journal-draft invariants."""

from decimal import Decimal

import pytest

from app.domain.ledger import JournalDraft, JournalLine, JournalValidationError, build_journal_draft, parse_amount


def test_decimal_amounts_do_not_round() -> None:
    assert parse_amount("0.10") + parse_amount("0.20") == Decimal("0.30")


def test_balanced_journal_draft_is_accepted() -> None:
    draft = build_journal_draft(
        currency="USD",
        lines=[
            {"account_code": "6200", "show_id": "show-pdx", "debit": "6500.00", "credit": "0.00"},
            {"account_code": "2000", "show_id": "show-pdx", "debit": "0.00", "credit": "6500.00"},
        ],
    )
    assert draft.debit_total == Decimal("6500.00")
    assert draft.credit_total == Decimal("6500.00")


def test_unbalanced_journal_draft_is_rejected() -> None:
    with pytest.raises(JournalValidationError, match="not balanced"):
        JournalDraft(
            currency="USD",
            lines=(
                JournalLine("6200", Decimal("10.00"), Decimal("0.00")),
                JournalLine("2000", Decimal("0.00"), Decimal("9.99")),
            ),
        )


@pytest.mark.parametrize("value", ["NaN", "Infinity", "-0.01", "1.001", "not-money"])
def test_invalid_or_inexact_amount_is_rejected(value: str) -> None:
    with pytest.raises(JournalValidationError):
        parse_amount(value)


def test_each_line_requires_exactly_one_positive_side() -> None:
    with pytest.raises(JournalValidationError, match="exactly one side"):
        JournalLine("6200", Decimal("0.00"), Decimal("0.00"))
    with pytest.raises(JournalValidationError, match="exactly one side"):
        JournalLine("6200", Decimal("1.00"), Decimal("1.00"))
