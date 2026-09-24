from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from field_registry import get_field_registry
from schemas import ProductPassport


@dataclass
class MissingField:
    field_id: str
    weight: int
    blocking_markets: list[str]


def _passport_fields(passport: ProductPassport):
    fields = {
        "title": passport.title,
        "category": passport.category,
        "materials": passport.materials,
        "technique": passport.technique or passport.craft_method,
        "dimensions": passport.dimensions,
        "color": passport.color or (passport.colors[0] if passport.colors else None),
        "use_case": passport.use_case,
        "origin_region": passport.origin_region or passport.origin,
        "artisan_story": passport.artisan_story,
        "cost_basis": passport.cost_basis or passport.price,
        "care_instructions": passport.care_instructions,
        "certifications": passport.certifications,
    }
    return fields


def scan_missing_fields(passport: ProductPassport, registry: dict[str, dict] | None = None) -> list[MissingField]:
    registry = registry or get_field_registry()
    missing: list[MissingField] = []
    for field_id, field_def in registry.items():
        value = _passport_fields(passport).get(field_id)
        if value is None:
            missing.append(MissingField(field_id, field_def["weight"], field_def["required_for"]))
            continue
        confidence = getattr(value, "confidence", 0.0)
        threshold = field_def.get("confidence_threshold", 0.6)
        if confidence < threshold:
            missing.append(MissingField(field_id, field_def["weight"], field_def["required_for"]))
    return missing


def select_next_field(passport: ProductPassport, market_ids: list[str] | None = None) -> str | None:
    registry = get_field_registry()
    market_ids = market_ids or ["amazon", "etsy", "shopify"]
    missing = scan_missing_fields(passport, registry)
    if not missing:
        return None

    def sort_key(item: MissingField):
        market_overlap = sum(1 for market in item.blocking_markets if market in market_ids)
        return (-item.weight, -market_overlap, item.field_id)

    return sorted(missing, key=sort_key)[0].field_id


def build_question_for_field(field_id: str, passport: ProductPassport) -> str:
    registry = get_field_registry()
    field_def = registry.get(field_id, {})
    label = field_id.replace("_", " ").title()
    hint = field_def.get("extraction_hint", "Please provide the value.")
    return f"Could you tell me more about the {label.lower()}? {hint}"
