"""
Pए — Completeness Engine

Purely deterministic. No LLM calls.
Calculates which fields are complete, missing, or low-confidence
and returns a structured CompletenessReport.
"""
from __future__ import annotations

from schemas import (
    CompletenessReport,
    FieldMeta,
    FieldSource,
    FieldStatus,
    ProductPassport,
)


# ── Field Requirement Definitions ─────────────────────────────────────
# Each entry:  (field_key, human_label, required?, base_priority 1-10)

FIELD_RULES: list[tuple[str, str, bool, int]] = [
    ("title",                  "Product Title",        True,  10),
    ("category",               "Category",             True,  10),
    ("materials",              "Materials",             True,  9),
    ("dimensions",             "Dimensions",            True,  9),
    ("weight",                 "Weight",                True,  8),
    ("price",                  "Price",                 True,  8),
    ("description",            "Description",           True,  7),
    ("craft_method",           "Craft Method",          True,  7),
    ("origin",                 "Origin / Region",       True,  6),
    ("colors",                 "Colors",                False, 5),
    ("care_instructions",      "Care Instructions",     False, 5),
    ("customization_available","Customization",         False, 4),
    ("quantity_available",     "Quantity Available",     False, 4),
    ("artisan_story",          "Artisan Story",         False, 3),
    ("packaging",              "Packaging Details",     False, 3),
    ("tags",                   "Tags / Keywords",       False, 2),
]


def _field_is_present(passport: ProductPassport, field_key: str) -> bool:
    """Check if a field has a meaningful non-empty value."""
    val = getattr(passport, field_key, None)
    if val is None:
        return False
    if isinstance(val, list) and len(val) == 0:
        return False
    if isinstance(val, str) and val.strip() == "":
        return False
    # Dimensions: need at least one dimension value
    if field_key == "dimensions":
        if val.length is None and val.width is None and val.height is None:
            return False
    # Weight: need a value
    if field_key == "weight":
        if val.value is None:
            return False
    # Packaging: need at least type
    if field_key == "packaging":
        if val.type is None:
            return False
    return True


def _field_confidence(passport: ProductPassport, field_key: str) -> float:
    """Return the confidence for a field (from field metadata dict)."""
    meta = passport.fields.get(field_key)
    if meta is None:
        return 0.0 if not _field_is_present(passport, field_key) else 0.5
    return meta.confidence


def _field_status(passport: ProductPassport, field_key: str) -> FieldStatus:
    """Determine the effective status of a field."""
    meta = passport.fields.get(field_key)
    if meta and meta.status != FieldStatus.MISSING:
        return meta.status
    if not _field_is_present(passport, field_key):
        return FieldStatus.MISSING
    conf = _field_confidence(passport, field_key)
    if conf < 0.7:
        return FieldStatus.LOW_CONFIDENCE
    return FieldStatus.CONFIRMED


def calculate_completeness(passport: ProductPassport) -> CompletenessReport:
    """
    Deterministic completeness calculation.

    Score = weighted average across all defined fields.
    Required fields weigh 2x. Each field contributes:
        0   if MISSING
        0.5 if LOW_CONFIDENCE
        1.0 if CONFIRMED
    """
    required_missing: list[str] = []
    low_confidence: list[str] = []
    complete_fields: list[str] = []
    blocking_fields: list[str] = []

    total_weight = 0.0
    earned = 0.0

    for field_key, label, required, _priority in FIELD_RULES:
        weight = 2.0 if required else 1.0
        total_weight += weight

        status = _field_status(passport, field_key)

        if status == FieldStatus.MISSING:
            if required:
                required_missing.append(field_key)
                blocking_fields.append(field_key)
            # earned += 0
        elif status == FieldStatus.LOW_CONFIDENCE:
            low_confidence.append(field_key)
            earned += weight * 0.5
            if required:
                blocking_fields.append(field_key)
        elif status == FieldStatus.CONFIRMED:
            complete_fields.append(field_key)
            earned += weight * 1.0
        elif status == FieldStatus.NEEDS_CLARIFICATION:
            if required:
                blocking_fields.append(field_key)
            earned += weight * 0.25

    score = round((earned / total_weight) * 100, 1) if total_weight > 0 else 0.0

    return CompletenessReport(
        score=score,
        required_missing=required_missing,
        low_confidence=low_confidence,
        complete_fields=complete_fields,
        blocking_fields=blocking_fields,
    )


def get_field_label(field_key: str) -> str:
    """Return human-readable label for a field."""
    for fk, label, *_ in FIELD_RULES:
        if fk == field_key:
            return label
    return field_key.replace("_", " ").title()


def is_field_required(field_key: str) -> bool:
    for fk, _label, required, _p in FIELD_RULES:
        if fk == field_key:
            return required
    return False
