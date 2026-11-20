"""Strict API request and response schemas."""

from pydantic import BaseModel, ConfigDict, Field, field_validator


class JournalLineInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    account_code: str = Field(min_length=1, max_length=32)
    show_id: str | None = Field(default=None, max_length=64)
    debit: str = Field(default="0.00", max_length=64)
    credit: str = Field(default="0.00", max_length=64)

    @field_validator("account_code")
    @classmethod
    def strip_account_code(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("account_code cannot be blank")
        return normalized


class JournalValidationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    currency: str = Field(default="USD", min_length=3, max_length=3)
    lines: list[JournalLineInput] = Field(min_length=2, max_length=500)

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, value: str) -> str:
        if not value.isalpha() or not value.isupper():
            raise ValueError("currency must be a three-letter uppercase code")
        return value


class JournalValidationResponse(BaseModel):
    status: str
    persisted: bool
    balanced: bool
    currency: str
    debit_total: str
    credit_total: str
    line_count: int


class HealthResponse(BaseModel):
    status: str
    mode: str
    persistence: str
    tour_id: str | None = None


class ActorRef(BaseModel):
    model_config = ConfigDict(extra="forbid")

    actor_id: str = Field(min_length=1, max_length=64)


class ApprovalRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    actor_id: str = Field(min_length=1, max_length=64)
    decision: str = Field(min_length=1, max_length=16)
    reason: str = Field(min_length=1, max_length=2000)


class PostRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    actor_id: str = Field(min_length=1, max_length=64)
    idempotency_key: str = Field(min_length=1, max_length=128)


class ExplainVarianceRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    actor_id: str = Field(min_length=1, max_length=64)
    explanation: str = Field(min_length=1, max_length=4000)
