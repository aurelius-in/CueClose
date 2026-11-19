"""Framework-independent exact-decimal journal-draft invariants."""

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

CENT = Decimal("0.01")
ZERO = Decimal("0.00")


class JournalValidationError(ValueError):
    """Raised when a draft journal violates a financial invariant."""


def parse_amount(value: str) -> Decimal:
    """Parse a nonnegative exact-cent decimal supplied as a string."""
    if not isinstance(value, str):
        raise JournalValidationError("Money amounts must be decimal strings")
    try:
        amount = Decimal(value)
    except InvalidOperation as exc:
        raise JournalValidationError(f"Invalid decimal amount: {value!r}") from exc
    if not amount.is_finite():
        raise JournalValidationError("Money amounts must be finite")
    if amount < ZERO:
        raise JournalValidationError("Money amounts cannot be negative")
    if amount.quantize(CENT) != amount:
        raise JournalValidationError("Money amounts may have at most two fractional digits")
    return amount.quantize(CENT)


@dataclass(frozen=True, slots=True)
class JournalLine:
    account_code: str
    debit: Decimal
    credit: Decimal
    show_id: str | None = None

    def __post_init__(self) -> None:
        if not self.account_code.strip():
            raise JournalValidationError("Account code is required")
        if self.debit < ZERO or self.credit < ZERO:
            raise JournalValidationError("Journal amounts cannot be negative")
        if (self.debit > ZERO) == (self.credit > ZERO):
            raise JournalValidationError("Each line must have a positive amount on exactly one side")
        if self.debit.quantize(CENT) != self.debit or self.credit.quantize(CENT) != self.credit:
            raise JournalValidationError("Journal amounts may have at most two fractional digits")


@dataclass(frozen=True, slots=True)
class JournalDraft:
    currency: str
    lines: tuple[JournalLine, ...]

    def __post_init__(self) -> None:
        if len(self.currency) != 3 or not self.currency.isalpha() or not self.currency.isupper():
            raise JournalValidationError("Currency must be a three-letter uppercase code")
        if len(self.lines) < 2:
            raise JournalValidationError("A journal draft must contain at least two lines")
        debit_total = sum((line.debit for line in self.lines), ZERO)
        credit_total = sum((line.credit for line in self.lines), ZERO)
        if debit_total != credit_total:
            raise JournalValidationError("Journal draft is not balanced")

    @property
    def debit_total(self) -> Decimal:
        return sum((line.debit for line in self.lines), ZERO)

    @property
    def credit_total(self) -> Decimal:
        return sum((line.credit for line in self.lines), ZERO)


def build_journal_draft(*, currency: str, lines: list[dict[str, str | None]]) -> JournalDraft:
    """Build and validate a draft from transport-neutral primitive values."""
    parsed_lines = [
        JournalLine(
            account_code=str(item["account_code"]),
            show_id=item.get("show_id"),
            debit=parse_amount(item["debit"] or "0"),
            credit=parse_amount(item["credit"] or "0"),
        )
        for item in lines
    ]
    return JournalDraft(currency=currency, lines=tuple(parsed_lines))
