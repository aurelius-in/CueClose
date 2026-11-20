"""Exact money helpers shared across domain services."""

from decimal import Decimal, InvalidOperation

CENT = Decimal("0.01")
ZERO = Decimal("0.00")


class MoneyError(ValueError):
    """Raised when a money amount violates exact-cent rules."""


def parse_money(value: str) -> Decimal:
    """Parse a finite exact-cent decimal string."""
    if not isinstance(value, str):
        raise MoneyError("Money amounts must be decimal strings")
    try:
        amount = Decimal(value)
    except InvalidOperation as exc:
        raise MoneyError(f"Invalid decimal amount: {value!r}") from exc
    if not amount.is_finite():
        raise MoneyError("Money amounts must be finite")
    if amount.quantize(CENT) != amount:
        raise MoneyError("Money amounts may have at most two fractional digits")
    return amount.quantize(CENT)


def format_money(amount: Decimal) -> str:
    """Serialize a Decimal as a two-fraction-digit string."""
    return f"{amount.quantize(CENT):.2f}"
