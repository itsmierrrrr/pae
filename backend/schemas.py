"""
Pए Backend — Pydantic Schemas (Domain Model)

Every important field in the ProductPassport carries metadata:
  source, confidence, status.
This is the canonical data contract for the entire system.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


# ── Enums ──────────────────────────────────────────────────────────────

class FieldSource(str, Enum):
    AI_EXTRACTED = "AI_EXTRACTED"
    VOICE_ANSWER = "VOICE_ANSWER"
    USER_ENTERED = "USER_ENTERED"
    SYSTEM_DERIVED = "SYSTEM_DERIVED"


class FieldStatus(str, Enum):
    MISSING = "MISSING"
    LOW_CONFIDENCE = "LOW_CONFIDENCE"
    CONFIRMED = "CONFIRMED"
    NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION"


class ProductStatus(str, Enum):
    DRAFT = "DRAFT"
    PROCESSING = "PROCESSING"
    PRODUCTIZED = "PRODUCTIZED"
    INTERVIEWING = "INTERVIEWING"
    INTERVIEW_COMPLETE = "INTERVIEW_COMPLETE"
    VERIFICATION_PENDING = "VERIFICATION_PENDING"
    VERIFIED = "VERIFIED"
    MARKET_PACK_GENERATING = "MARKET_PACK_GENERATING"
    MARKET_READY = "MARKET_READY"


class InterviewStatus(str, Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class QuestionStatus(str, Enum):
    PENDING = "PENDING"
    ASKED = "ASKED"
    ANSWERED = "ANSWERED"
    SKIPPED = "SKIPPED"


class AnswerStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION"
    REJECTED = "REJECTED"


class MarketPackStatus(str, Enum):
    INCOMPLETE = "incomplete"
    GENERATING = "GENERATING"
    DRAFT = "DRAFT"
    READY = "READY"
    INVALID = "INVALID"


# ── Field Metadata ────────────────────────────────────────────────────

class PassportField(BaseModel):
    """Canonical structured value with confidence and extraction source."""
    value: Any = None
    confidence: float = 0.0
    source: str = "empty"

    @property
    def is_present(self) -> bool:
        if self.value is None:
            return False
        if isinstance(self.value, str) and self.value.strip() == "":
            return False
        if isinstance(self.value, list) and len(self.value) == 0:
            return False
        return True


class FieldMeta(BaseModel):
    """Metadata attached to every important passport field."""
    value: Any = None
    confidence: float = 0.0
    source: FieldSource = FieldSource.AI_EXTRACTED
    status: FieldStatus = FieldStatus.MISSING


# ── Nested Value Objects ──────────────────────────────────────────────

class Dimensions(BaseModel):
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    unit: str = "cm"


class Weight(BaseModel):
    value: Optional[float] = None
    unit: str = "g"


class Packaging(BaseModel):
    type: Optional[str] = None
    dimensions: Optional[str] = None
    weight: Optional[str] = None


class Provenance(BaseModel):
    artisan_name: Optional[str] = None
    craft_region: Optional[str] = None
    community: Optional[str] = None
    source_type: Optional[str] = None


# ── Product Passport ──────────────────────────────────────────────────

class ProductPassport(BaseModel):
    """The canonical source of truth for a product."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: Optional[str] = None
    version: int = 1

    title: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    description: Optional[str] = None

    materials: list[str] = Field(default_factory=list)
    colors: list[str] = Field(default_factory=list)
    dimensions: Optional[Dimensions] = None
    weight: Optional[Weight] = None

    craft_method: Optional[str] = None
    technique: Optional[str] = None
    origin: Optional[str] = None
    origin_region: Optional[str] = None
    artisan_story: Optional[str] = None
    use_case: Optional[str] = None
    color: Optional[str] = None
    cost_basis: Optional[float] = None
    certifications: list[str] = Field(default_factory=list)
    hsn_code: Optional[str] = None
    gst_breakup: Optional[dict[str, Any]] = None

    customization_available: Optional[bool] = None
    customization_details: Optional[str] = None
    care_instructions: Optional[str] = None
    quantity_available: Optional[int] = None

    price: Optional[float] = None
    currency: str = "INR"

    images: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)

    packaging: Optional[Packaging] = None
    provenance: Optional[Provenance] = None

    # Per-field metadata
    fields: dict[str, FieldMeta] = Field(default_factory=dict)

    completeness_score: float = 0.0
    status: ProductStatus = ProductStatus.DRAFT

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Interview Models ──────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = ""
    field: str = ""
    question: str = ""
    priority: float = 0.0
    reason: str = ""
    status: QuestionStatus = QuestionStatus.PENDING


class InterviewAnswer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_id: str = ""
    raw_transcript: str = ""
    extracted_value: Any = None
    confidence: float = 0.0
    field_updates: dict[str, Any] = Field(default_factory=dict)
    status: AnswerStatus = AnswerStatus.ACCEPTED


class ExtractedValue(BaseModel):
    value: Any = None
    confidence: float = Field(ge=0.0, le=1.0)


class InterviewSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str = ""
    status: InterviewStatus = InterviewStatus.ACTIVE
    current_question: Optional[InterviewQuestion] = None
    questions_asked: int = 0
    answers_received: int = 0
    completeness_before: float = 0.0
    completeness_after: float = 0.0
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    history: list[dict] = Field(default_factory=list)


# ── Market Profile & Pack ─────────────────────────────────────────────

class DescriptionSection(BaseModel):
    section_id: str
    source_fields: list[str] = Field(default_factory=list)
    format: Literal["prose", "bullet_table", "spec_table"]
    generation: Literal["template", "llm_section"]


class TitleConstraints(BaseModel):
    style: Literal["formal", "evocative", "catalog"] = "catalog"
    max_length: int = 80
    include_fields: list[str] = Field(default_factory=list)
    forbid_marketing_language: bool = False


class ImageSpec(BaseModel):
    style: Literal["plain_background", "lifestyle_closeup", "square_spec"]
    minimum_count: int = 1
    aspect_ratio: Optional[str] = None


class MarketProfile(BaseModel):
    """Data contract that defines one channel's structural requirements."""
    market_id: str
    required_passport_fields: list[str] = Field(default_factory=list)
    description_sections: list[DescriptionSection] = Field(default_factory=list)
    title_constraints: TitleConstraints = Field(default_factory=TitleConstraints)
    tone: Literal["formal_procurement", "narrative_craft", "structured_catalog"] = "structured_catalog"
    language: list[str] = Field(default_factory=lambda: ["English"])
    image_spec: ImageSpec = Field(default_factory=lambda: ImageSpec(style="square_spec"))
    metadata_schema: dict[str, str] = Field(default_factory=dict)
    name: Optional[str] = None
    description: Optional[str] = None

    @property
    def id(self) -> str:
        return self.market_id

    @property
    def required_fields(self) -> list[str]:
        return self.required_passport_fields


class FieldRegistryEntry(BaseModel):
    """Registry metadata used by the completeness engine and market pack generation."""
    weight: int = 1
    required_for: list[str] = Field(default_factory=list)
    extraction_hint: str = ""
    confidence_threshold: float = 0.6


class ValidationError(BaseModel):
    field: str
    message: str
    severity: str = "error"  # error | warning


class ValidationResult(BaseModel):
    valid: bool = False
    errors: list[ValidationError] = Field(default_factory=list)
    warnings: list[ValidationError] = Field(default_factory=list)
    completion_score: float = 0.0


class MarketPack(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str = ""
    passport_id: str = ""
    passport_version: int = 1
    market_profile_id: str = ""
    market_profile_name: str = ""
    market_id: str = ""

    status: MarketPackStatus = MarketPackStatus.DRAFT

    generated_content: dict[str, Any] = Field(default_factory=dict)
    title: str = ""
    sections: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)
    source_fields: list[str] = Field(default_factory=list)
    missing_fields: list[str] = Field(default_factory=list)
    source_passport_id: str = ""

    validation_result: Optional[ValidationResult] = None

    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ── Completeness Report ───────────────────────────────────────────────

class CompletenessReport(BaseModel):
    score: float = 0.0
    required_missing: list[str] = Field(default_factory=list)
    low_confidence: list[str] = Field(default_factory=list)
    complete_fields: list[str] = Field(default_factory=list)
    blocking_fields: list[str] = Field(default_factory=list)


# ── API Request / Response ────────────────────────────────────────────

class CreateProductRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    voice_transcript: Optional[str] = None
    # image is handled via multipart upload


class AnswerRequest(BaseModel):
    raw_transcript: str


class GenerateMarketPacksRequest(BaseModel):
    market_profile_ids: list[str] = Field(default_factory=lambda: ["gem", "india_handmade", "ondc_catalog"])


class ProductResponse(BaseModel):
    passport: ProductPassport
    completeness: CompletenessReport


class InterviewResponse(BaseModel):
    session: InterviewSession
    passport: ProductPassport
    completeness: CompletenessReport


class MarketPacksResponse(BaseModel):
    packs: list[MarketPack]
    passport_id: str
    passport_version: int
