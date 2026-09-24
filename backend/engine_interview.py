"""
Pए — Voice Product Interview Engine

Architecture:
    ProductPassport
        → Completeness Analyzer
        → Missing / Low-confidence Fields
        → Priority Scoring
        → Question Generator
        → Artisan Answer
        → Answer Extraction
        → Passport Update
        → Recalculate Completeness
        → Next Question or STOP

The LLM only generates natural-language question wording and
extracts structured values from free-text answers.
All field selection, priority scoring, and stopping logic is deterministic.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Any, Optional

from config import INTERVIEW_COMPLETION_THRESHOLD
from engine_completeness import (
    FIELD_RULES,
    calculate_completeness,
    get_field_label,
    _field_is_present,
    _field_confidence,
    _field_status,
)
from schemas import (
    AnswerStatus,
    CompletenessReport,
    Dimensions,
    ExtractedValue,
    FieldMeta,
    FieldSource,
    FieldStatus,
    InterviewAnswer,
    InterviewQuestion,
    InterviewSession,
    InterviewStatus,
    ProductPassport,
    QuestionStatus,
    Weight,
)


def parse_extraction_json(raw_output: str) -> ExtractedValue | None:
    """Parse constrained extractor output; malformed output is never stored."""
    try:
        parsed = json.loads(raw_output)
        return ExtractedValue.model_validate(parsed)
    except (json.JSONDecodeError, TypeError, ValueError):
        return None


# ── Question Templates (contextual per category) ─────────────────────

QUESTION_TEMPLATES: dict[str, dict[str, str]] = {
    "dimensions": {
        "_default": "What are the approximate dimensions (length, width, height) of the product?",
        "Drinkware": "What are the approximate height and diameter of the {title}?",
        "Wall Art": "What are the approximate length and width of the {title}?",
        "Jewelry": "What are the approximate dimensions of the {title} in centimetres?",
        "Textiles": "What are the approximate length and width of the {title}?",
    },
    "weight": {
        "_default": "Approximately how much does the product weigh?",
        "Drinkware": "Approximately how much does the {title} weigh when empty?",
        "Jewelry": "Approximately how much does the {title} weigh in grams?",
    },
    "materials": {
        "_default": "What material is this product made from?",
        "Drinkware": "What type of clay or ceramic is the {title} made from?",
        "Textiles": "What fabric or fiber is the {title} made from?",
        "Jewelry": "What metal or material is the {title} made from?",
    },
    "care_instructions": {
        "_default": "How should the customer take care of this product?",
        "Drinkware": "Is the {title} dishwasher-safe, or does it require hand washing?",
        "Textiles": "What are the washing and care instructions for the {title}?",
    },
    "customization_available": {
        "_default": "Can customers request any customization for this product?",
    },
    "quantity_available": {
        "_default": "How many units of this product do you currently have available?",
    },
    "artisan_story": {
        "_default": "Could you share a brief story about how this product is made or the tradition behind it?",
    },
    "packaging": {
        "_default": "How is the product packaged for shipping? (box type, padding, etc.)",
    },
    "description": {
        "_default": "Could you describe this product in your own words for a buyer?",
    },
    "craft_method": {
        "_default": "What craft technique is used to make this product?",
    },
    "origin": {
        "_default": "Where is this product made? (city, region, or village)",
    },
    "colors": {
        "_default": "What colors are available for this product?",
    },
    "price": {
        "_default": "What is the selling price of this product?",
    },
    "title": {
        "_default": "What would you like to name this product?",
    },
    "tags": {
        "_default": "What keywords or tags would you associate with this product?",
    },
}


# ── Priority Scoring ─────────────────────────────────────────────────

def _compute_priority(
    field_key: str,
    required: bool,
    base_priority: int,
    passport: ProductPassport,
    target_markets: list[str] | None = None,
) -> float:
    """
    priority_score = business_importance × missingness × market_relevance × confidence_penalty

    This is NOT a static ordering — it changes based on the product's current state.
    """
    # Business importance (from rule definition)
    business_importance = base_priority / 10.0  # normalize to 0-1

    # Missingness factor
    present = _field_is_present(passport, field_key)
    missingness = 0.0 if present else 1.0

    # If present but low confidence, still want to revisit
    conf = _field_confidence(passport, field_key)
    confidence_penalty = 1.0 - conf  # 0 = fully confident, 1 = no confidence

    # If field is present AND confirmed, skip it entirely
    if present and conf >= 0.7:
        return 0.0

    # Market relevance — boost if required by a target market profile
    market_relevance = 1.0
    if target_markets:
        from market_profiles import MARKET_PROFILES
        for mp_id in target_markets:
            profile = MARKET_PROFILES.get(mp_id)
            if profile and field_key in profile.required_fields:
                market_relevance = 1.5
                break

    # Required fields get a 2x boost
    required_boost = 2.0 if required else 1.0

    score = business_importance * max(missingness, confidence_penalty) * market_relevance * required_boost
    return round(score, 4)


def get_prioritized_fields(
    passport: ProductPassport,
    target_markets: list[str] | None = None,
) -> list[dict]:
    """
    Return fields sorted by descending priority score.
    Only includes fields that need attention (score > 0).
    """
    results = []
    for field_key, label, required, base_priority in FIELD_RULES:
        score = _compute_priority(field_key, required, base_priority, passport, target_markets)
        if score > 0:
            status = _field_status(passport, field_key)
            results.append({
                "field": field_key,
                "label": label,
                "required": required,
                "priority_score": score,
                "status": status.value,
                "reason": _build_reason(field_key, required, status, target_markets),
            })
    results.sort(key=lambda x: x["priority_score"], reverse=True)
    return results


def _build_reason(field_key: str, required: bool, status: FieldStatus, target_markets: list[str] | None) -> str:
    """Build a human-readable reason for why this field is being asked."""
    parts = []
    if required:
        parts.append("Required field")
    if status == FieldStatus.MISSING:
        parts.append("currently missing from passport")
    elif status == FieldStatus.LOW_CONFIDENCE:
        parts.append("low confidence — needs confirmation")
    elif status == FieldStatus.NEEDS_CLARIFICATION:
        parts.append("previous answer was unclear")

    if target_markets:
        from market_profiles import MARKET_PROFILES
        for mp_id in target_markets:
            profile = MARKET_PROFILES.get(mp_id)
            if profile and field_key in profile.required_fields:
                parts.append(f"required by {profile.name}")
                break

    return "; ".join(parts) if parts else "Useful for product completeness"


# ── Question Generation ──────────────────────────────────────────────

def generate_question(
    field_key: str,
    passport: ProductPassport,
    reason: str = "",
) -> InterviewQuestion:
    """
    Generate a contextual question for the given field.
    The field is chosen deterministically; only the wording uses templates.
    """
    templates = QUESTION_TEMPLATES.get(field_key, {"_default": f"What is the {get_field_label(field_key).lower()} of this product?"})

    # Pick category-specific template if available
    category = passport.category or ""
    question_text = templates.get(category, templates["_default"])

    # Interpolate product title
    title = passport.title or "product"
    question_text = question_text.replace("{title}", title)

    return InterviewQuestion(
        id=str(uuid.uuid4()),
        field=field_key,
        question=question_text,
        priority=0.0,
        reason=reason,
        status=QuestionStatus.ASKED,
    )


# ── Answer Extraction (Demo Mode) ────────────────────────────────────

# Maps of field → extraction logic from free-text answers
DEMO_EXTRACTIONS: dict[str, dict[str, Any]] = {
    "dimensions": {
        "triggers": ["8 inches tall", "4 inches wide", "10 cm", "8 cm", "8x8x10"],
        "default_value": {"length": 8.0, "width": 8.0, "height": 10.0, "unit": "cm"},
    },
    "weight": {
        "triggers": ["350", "grams", "gram", "g"],
        "default_value": {"value": 350.0, "unit": "g"},
    },
    "care_instructions": {
        "triggers": ["hand wash", "dishwasher", "wipe", "clean"],
        "default_value": "Hand wash only. Do not use in dishwasher. Dry with soft cloth.",
    },
    "customization_available": {
        "triggers": ["yes", "custom", "personalize", "no"],
        "default_value": True,
    },
    "quantity_available": {
        "triggers": ["50", "100", "20", "available"],
        "default_value": 50,
    },
    "materials": {
        "triggers": ["ceramic", "clay", "wood", "cotton", "silk", "bamboo"],
        "default_value": ["Ceramic"],
    },
    "colors": {
        "triggers": ["blue", "red", "green", "white", "natural"],
        "default_value": ["Blue"],
    },
    "artisan_story": {
        "triggers": [],
        "default_value": "Handcrafted by artisans in our village using traditional techniques passed down through generations.",
    },
    "packaging": {
        "triggers": ["box", "bubble", "wrap"],
        "default_value": {"type": "Cardboard box with bubble wrap", "dimensions": "15x15x15 cm", "weight": "100g"},
    },
    "description": {
        "triggers": [],
        "default_value": "A beautifully handcrafted product made with traditional techniques.",
    },
    "craft_method": {
        "triggers": ["hand", "painted", "woven", "carved"],
        "default_value": "Hand-painted",
    },
    "origin": {
        "triggers": ["kutch", "jaipur", "delhi", "village"],
        "default_value": "Kutch, Gujarat",
    },
    "price": {
        "triggers": ["450", "500", "rupee"],
        "default_value": 450.0,
    },
    "title": {
        "triggers": [],
        "default_value": "Handcrafted Product",
    },
    "tags": {
        "triggers": [],
        "default_value": ["handmade", "artisan", "traditional"],
    },
}


def extract_answer(
    field_key: str,
    raw_transcript: str,
    passport: ProductPassport,
) -> InterviewAnswer:
    """
    Extract structured value from artisan's free-text answer.

    In demo mode, uses pattern matching.
    In production, this would call an LLM with a structured output schema.
    """
    transcript_lower = raw_transcript.lower().strip()

    # Check for vague / unusable answers
    vague_phrases = ["medium", "normal", "regular", "not sure", "i don't know", "idk"]
    if transcript_lower in vague_phrases or len(transcript_lower) < 2:
        return InterviewAnswer(
            question_id="",
            raw_transcript=raw_transcript,
            extracted_value=None,
            confidence=0.0,
            field_updates={},
            status=AnswerStatus.NEEDS_CLARIFICATION,
        )

    # Try to extract structured data based on field type
    extracted = _extract_field_value(field_key, transcript_lower, raw_transcript)

    if extracted is None:
        # Fallback: use the raw transcript as the value for string fields
        simple_string_fields = [
            "care_instructions", "artisan_story", "description",
            "craft_method", "origin", "title",
        ]
        if field_key in simple_string_fields:
            extracted = raw_transcript.strip()
            confidence = 0.85
        else:
            return InterviewAnswer(
                question_id="",
                raw_transcript=raw_transcript,
                extracted_value=None,
                confidence=0.0,
                field_updates={},
                status=AnswerStatus.NEEDS_CLARIFICATION,
            )
    else:
        confidence = 0.92

    field_updates = {field_key: extracted}

    return InterviewAnswer(
        question_id="",
        raw_transcript=raw_transcript,
        extracted_value=extracted,
        confidence=confidence,
        field_updates=field_updates,
        status=AnswerStatus.ACCEPTED,
    )


def _extract_field_value(field_key: str, transcript_lower: str, raw: str) -> Any:
    """Attempt to extract a typed value from the transcript."""

    if field_key == "dimensions":
        return _extract_dimensions(transcript_lower)
    elif field_key == "weight":
        return _extract_weight(transcript_lower)
    elif field_key == "price":
        return _extract_number(transcript_lower)
    elif field_key == "quantity_available":
        num = _extract_number(transcript_lower)
        return int(num) if num is not None else None
    elif field_key == "customization_available":
        return _extract_boolean(transcript_lower)
    elif field_key == "materials":
        return _extract_list(raw)
    elif field_key == "colors":
        return _extract_list(raw)
    elif field_key == "tags":
        return _extract_list(raw)
    elif field_key == "packaging":
        return {"type": raw.strip(), "dimensions": None, "weight": None}

    return None


def _extract_dimensions(text: str) -> dict | None:
    """Extract dimensions from text like '8 inches tall and 4 inches wide'."""
    import re
    numbers = re.findall(r'(\d+(?:\.\d+)?)', text)
    if not numbers:
        return None

    unit = "cm"
    if "inch" in text or '"' in text:
        unit = "inch"
    elif "mm" in text:
        unit = "mm"
    elif "cm" in text:
        unit = "cm"
    elif "m " in text or "meter" in text:
        unit = "m"

    nums = [float(n) for n in numbers[:3]]
    result = {"unit": unit}
    if len(nums) >= 3:
        result["length"] = nums[0]
        result["width"] = nums[1]
        result["height"] = nums[2]
    elif len(nums) == 2:
        result["width"] = nums[0]
        result["height"] = nums[1]
    elif len(nums) == 1:
        result["height"] = nums[0]

    return result


def _extract_weight(text: str) -> dict | None:
    import re
    match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|gram|grams|kilogram|oz|pound|lb)', text)
    if match:
        value = float(match.group(1))
        unit_raw = match.group(2).lower()
        unit_map = {"kg": "kg", "g": "g", "gram": "g", "grams": "g", "kilogram": "kg", "oz": "oz", "pound": "lb", "lb": "lb"}
        return {"value": value, "unit": unit_map.get(unit_raw, "g")}

    # Just a number? assume grams
    nums = re.findall(r'(\d+(?:\.\d+)?)', text)
    if nums:
        return {"value": float(nums[0]), "unit": "g"}
    return None


def _extract_number(text: str) -> float | None:
    import re
    nums = re.findall(r'(\d+(?:\.\d+)?)', text)
    return float(nums[0]) if nums else None


def _extract_boolean(text: str) -> bool | None:
    yes_words = ["yes", "yeah", "yep", "sure", "available", "can", "possible", "true"]
    no_words = ["no", "nope", "not", "cannot", "can't", "false", "unavailable"]
    for w in yes_words:
        if w in text:
            return True
    for w in no_words:
        if w in text:
            return False
    return None


def _extract_list(text: str) -> list[str]:
    """Split by commas or 'and'."""
    import re
    items = re.split(r'[,]|\band\b', text)
    return [item.strip() for item in items if item.strip()]


# ── Passport Update ──────────────────────────────────────────────────

def apply_answer_to_passport(
    passport: ProductPassport,
    answer: InterviewAnswer,
    field_key: str,
) -> ProductPassport:
    """
    Update the canonical ProductPassport with extracted answer data.
    Also updates the field metadata.
    """
    if answer.status != AnswerStatus.ACCEPTED:
        return passport

    for fk, value in answer.field_updates.items():
        # Update the actual field
        if fk == "dimensions" and isinstance(value, dict):
            if passport.dimensions is None:
                passport.dimensions = Dimensions()
            if "length" in value and value["length"] is not None:
                passport.dimensions.length = value["length"]
            if "width" in value and value["width"] is not None:
                passport.dimensions.width = value["width"]
            if "height" in value and value["height"] is not None:
                passport.dimensions.height = value["height"]
            if "unit" in value:
                passport.dimensions.unit = value["unit"]

        elif fk == "weight" and isinstance(value, dict):
            if passport.weight is None:
                passport.weight = Weight()
            if "value" in value and value["value"] is not None:
                passport.weight.value = value["value"]
            if "unit" in value:
                passport.weight.unit = value["unit"]

        elif fk == "packaging" and isinstance(value, dict):
            from schemas import Packaging
            passport.packaging = Packaging(
                type=value.get("type"),
                dimensions=value.get("dimensions"),
                weight=value.get("weight"),
            )

        elif fk == "materials" and isinstance(value, list):
            passport.materials = value
        elif fk == "colors" and isinstance(value, list):
            passport.colors = value
        elif fk == "tags" and isinstance(value, list):
            passport.tags = value
        elif fk == "customization_available" and isinstance(value, bool):
            passport.customization_available = value
        elif fk == "quantity_available":
            passport.quantity_available = int(value) if value is not None else None
        elif fk == "price":
            passport.price = float(value) if value is not None else None
        else:
            # Simple string/scalar fields
            if hasattr(passport, fk):
                setattr(passport, fk, value)

        # Update field metadata
        passport.fields[fk] = FieldMeta(
            value=value,
            confidence=answer.confidence,
            source=FieldSource.VOICE_ANSWER,
            status=FieldStatus.CONFIRMED if answer.confidence >= 0.7 else FieldStatus.LOW_CONFIDENCE,
        )

    # Recalculate completeness
    report = calculate_completeness(passport)
    passport.completeness_score = report.score
    passport.updated_at = datetime.utcnow()

    return passport


# ── Interview Session Controller ─────────────────────────────────────

def start_interview(
    passport: ProductPassport,
    target_markets: list[str] | None = None,
) -> InterviewSession:
    """Start a new interview session for a product."""
    report = calculate_completeness(passport)

    session = InterviewSession(
        product_id=passport.id,
        completeness_before=report.score,
    )

    # Generate first question
    prioritized = get_prioritized_fields(passport, target_markets)
    if prioritized:
        top = prioritized[0]
        question = generate_question(top["field"], passport, top["reason"])
        question.session_id = session.id
        question.priority = top["priority_score"]
        session.current_question = question
        session.questions_asked = 1

    return session


def process_answer(
    session: InterviewSession,
    passport: ProductPassport,
    raw_transcript: str,
    target_markets: list[str] | None = None,
) -> tuple[InterviewSession, ProductPassport, InterviewAnswer]:
    """
    Process an artisan's answer:
    1. Extract structured value
    2. Update passport if valid
    3. Recalculate completeness
    4. Either generate next question or stop interview
    """
    current_field = session.current_question.field if session.current_question else ""

    completeness_before = calculate_completeness(passport).score

    # Extract answer for the selected field only.
    answer = extract_answer(current_field, raw_transcript, passport)
    if session.current_question:
        answer.question_id = session.current_question.id

    # Record in history
    history_entry = {
        "question": session.current_question.question if session.current_question else "",
        "field": current_field,
        "answer": raw_transcript,
        "status": answer.status.value,
        "extracted_value": answer.extracted_value,
        "completeness_before": completeness_before,
    }

    if answer.status == AnswerStatus.NEEDS_CLARIFICATION:
        # Re-ask with clarification
        clarification_q = _generate_clarification(current_field, passport)
        clarification_q.session_id = session.id
        session.current_question = clarification_q
        history_entry["clarification"] = True
        session.history.append(history_entry)
        return session, passport, answer

    # Apply answer to passport
    passport = apply_answer_to_passport(passport, answer, current_field)
    session.answers_received += 1
    session.history.append(history_entry)

    # Recalculate completeness
    report = calculate_completeness(passport)
    session.completeness_after = report.score
    history_entry["completeness_after"] = report.score

    # Check stopping conditions
    should_stop = _should_stop_interview(report, passport)

    if should_stop:
        session.status = InterviewStatus.COMPLETED
        session.completed_at = datetime.utcnow()
        session.current_question = None
    else:
        # Generate next question
        prioritized = get_prioritized_fields(passport, target_markets)
        if prioritized:
            top = prioritized[0]
            next_q = generate_question(top["field"], passport, top["reason"])
            next_q.session_id = session.id
            next_q.priority = top["priority_score"]
            session.current_question = next_q
            session.questions_asked += 1
        else:
            # No more fields to ask about
            session.status = InterviewStatus.COMPLETED
            session.completed_at = datetime.utcnow()
            session.current_question = None

    return session, passport, answer


def _should_stop_interview(report: CompletenessReport, passport: ProductPassport) -> bool:
    """
    Stop when:
    - All blocking required fields are confirmed, OR
    - Completeness >= configured threshold
    """
    if report.score >= INTERVIEW_COMPLETION_THRESHOLD:
        return True
    if len(report.blocking_fields) == 0:
        return True
    return False


def _generate_clarification(field_key: str, passport: ProductPassport) -> InterviewQuestion:
    """Generate a clarification question when the answer was vague."""
    label = get_field_label(field_key)

    clarification_map = {
        "dimensions": "Could you give me the approximate height and width in centimetres or inches?",
        "weight": "Could you tell me the approximate weight in grams or kilograms?",
        "price": "Could you tell me the exact price in rupees?",
        "quantity_available": "How many individual units do you have available right now?",
    }

    question_text = clarification_map.get(
        field_key,
        f"Could you provide more specific details about the {label.lower()}?"
    )

    return InterviewQuestion(
        id=str(uuid.uuid4()),
        field=field_key,
        question=question_text,
        priority=10.0,  # Clarifications are top priority
        reason=f"Previous answer for {label} was unclear — need more specific information",
        status=QuestionStatus.ASKED,
    )
