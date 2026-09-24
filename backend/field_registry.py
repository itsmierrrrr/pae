from __future__ import annotations

FIELD_REGISTRY: dict[str, dict] = {
    "title": {
        "weight": 5,
        "required_for": ["amazon", "etsy", "shopify"],
        "extraction_hint": "A short product name, usually under 80 characters.",
        "confidence_threshold": 0.6,
    },
    "category": {
        "weight": 5,
        "required_for": ["amazon", "etsy"],
        "extraction_hint": "The product category such as Home Decor, Kitchen, or Storage.",
        "confidence_threshold": 0.6,
    },
    "materials": {
        "weight": 5,
        "required_for": ["amazon", "etsy", "shopify"],
        "extraction_hint": "The product material, for example bamboo, cotton, ceramic, or wood.",
        "confidence_threshold": 0.6,
    },
    "technique": {
        "weight": 4,
        "required_for": ["etsy", "shopify"],
        "extraction_hint": "How the item is made, such as hand-woven, hand-painted, or hand-carved.",
        "confidence_threshold": 0.6,
    },
    "dimensions": {
        "weight": 4,
        "required_for": ["amazon", "shopify"],
        "extraction_hint": "Length, width, height, with unit such as cm, inches, or mm.",
        "confidence_threshold": 0.6,
    },
    "color": {
        "weight": 3,
        "required_for": ["amazon"],
        "extraction_hint": "The main color or palette available for the product.",
        "confidence_threshold": 0.6,
    },
    "use_case": {
        "weight": 3,
        "required_for": ["etsy", "shopify"],
        "extraction_hint": "The main use case such as storage, gifting, decor, or daily utility.",
        "confidence_threshold": 0.6,
    },
    "origin_region": {
        "weight": 3,
        "required_for": ["etsy"],
        "extraction_hint": "The region or location where the product is made.",
        "confidence_threshold": 0.6,
    },
    "artisan_story": {
        "weight": 2,
        "required_for": ["shopify"],
        "extraction_hint": "A short artisan origin or maker story.",
        "confidence_threshold": 0.6,
    },
    "cost_basis": {
        "weight": 5,
        "required_for": ["amazon", "shopify"],
        "extraction_hint": "The cost or production basis, usually a number with currency.",
        "confidence_threshold": 0.6,
    },
    "care_instructions": {
        "weight": 2,
        "required_for": ["amazon", "etsy"],
        "extraction_hint": "Care guidance such as hand wash, dry clean, or avoid direct sunlight.",
        "confidence_threshold": 0.6,
    },
    "certifications": {
        "weight": 2,
        "required_for": ["amazon"],
        "extraction_hint": "Any product compliance or certification information.",
        "confidence_threshold": 0.6,
    },
}


def get_field_registry():
    return FIELD_REGISTRY
