from __future__ import annotations

from typing import Any

from market_profiles import get_market_profile
from schemas import (
    FieldStatus,
    MarketPack,
    MarketPackStatus,
    MarketProfile,
    ProductPassport,
    ValidationError,
    ValidationResult,
)

CONFIDENCE_THRESHOLD = 0.6


def _value_and_confidence(passport: ProductPassport, field_id: str) -> tuple[Any, float]:
    meta = passport.fields.get(field_id)
    if meta is not None:
        return meta.value, meta.confidence
    value = getattr(passport, field_id, None)
    if isinstance(value, list) and not value:
        value = None
    return value, 0.5 if value is not None else 0.0


def _field_is_ready(passport: ProductPassport, field_id: str) -> bool:
    value, confidence = _value_and_confidence(passport, field_id)
    if value is None or confidence < CONFIDENCE_THRESHOLD:
        return False
    if isinstance(value, str) and not value.strip():
        return False
    if isinstance(value, list) and not value:
        return False
    return True


def _display_value(passport: ProductPassport, field_id: str) -> str:
    value, _ = _value_and_confidence(passport, field_id)
    if isinstance(value, dict):
        return ", ".join(f"{key}: {item}" for key, item in value.items())
    if isinstance(value, list):
        return ", ".join(str(item) for item in value)
    return "" if value is None else str(value)


def _generate_title(passport: ProductPassport, profile: MarketProfile) -> str:
    parts = []
    for field_id in profile.title_constraints.include_fields:
        value = _display_value(passport, field_id)
        if value:
            parts.append(value)
    title = " - ".join(parts) or _display_value(passport, "title") or "Untitled product"
    if profile.title_constraints.forbid_marketing_language:
        title = title.replace("Beautiful", "").replace("Premium", "").strip(" -")
    return title[: profile.title_constraints.max_length]


def _render_template(section_id: str, source_fields: list[str], format_name: str, passport: ProductPassport) -> str:
    values = [(field_id, _display_value(passport, field_id)) for field_id in source_fields]
    values = [(field_id, value) for field_id, value in values if value]
    if format_name == "spec_table":
        rows = ["| Attribute | Value |", "| --- | --- |"]
        rows.extend(f"| {field_id.replace('_', ' ').title()} | {value} |" for field_id, value in values)
        return "\n".join(rows)
    if format_name == "bullet_table":
        return "\n".join(f"{field_id.replace('_', ' ').title()}: {value}" for field_id, value in values)
    return " ".join(f"{field_id.replace('_', ' ').title()}: {value}." for field_id, value in values)


def _render_llm_section(section_id: str, source_fields: list[str], passport: ProductPassport) -> str:
    values = [(field_id, _display_value(passport, field_id)) for field_id in source_fields]
    values = [(field_id, value) for field_id, value in values if value]
    return " ".join(value.rstrip(".") + "." for _, value in values)


def generate_market_pack(passport: ProductPassport, profile: MarketProfile | str) -> MarketPack:
    if isinstance(profile, str):
        profile = get_market_profile(profile)

    missing = [field_id for field_id in profile.required_passport_fields if not _field_is_ready(passport, field_id)]
    base = {
        "product_id": passport.product_id or passport.id,
        "passport_id": passport.id,
        "passport_version": passport.version,
        "market_profile_id": profile.market_id,
        "market_profile_name": profile.name or profile.market_id,
        "market_id": profile.market_id,
        "source_passport_id": passport.id,
        "source_fields": sorted({field_id for section in profile.description_sections for field_id in section.source_fields}),
    }
    if missing:
        return MarketPack(
            **base,
            status=MarketPackStatus.INCOMPLETE,
            missing_fields=missing,
            validation_result=ValidationResult(
                valid=False,
                errors=[ValidationError(field=field_id, message="Required field is missing or below confidence threshold.") for field_id in missing],
            ),
        )

    sections: dict[str, str] = {}
    for section in profile.description_sections:
        if section.generation == "template":
            sections[section.section_id] = _render_template(section.section_id, section.source_fields, section.format, passport)
        else:
            sections[section.section_id] = _render_llm_section(section.section_id, section.source_fields, passport)

    metadata = {field_id: _display_value(passport, field_id) for field_id in profile.metadata_schema if _field_is_ready(passport, field_id)}
    title = _generate_title(passport, profile)
    return MarketPack(
        **base,
        status=MarketPackStatus.READY,
        title=title,
        sections=sections,
        metadata=metadata,
        generated_content={"title": title, "sections": sections, "metadata": metadata},
        validation_result=ValidationResult(valid=True),
    )


def generate_all_market_packs(passport: ProductPassport) -> list[MarketPack]:
    from market_profiles import MARKET_PROFILES
    return [generate_market_pack(passport, profile) for profile in MARKET_PROFILES.values()]
