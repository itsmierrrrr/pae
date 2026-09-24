from __future__ import annotations

from schemas import DescriptionSection, ImageSpec, MarketProfile, TitleConstraints


MARKET_PROFILES: dict[str, MarketProfile] = {
    "gem": MarketProfile(
        market_id="gem",
        name="GeM-style",
        description="Formal procurement listing with technical product facts.",
        required_passport_fields=["title", "category", "materials", "dimensions", "hsn_code", "gst_breakup", "certifications"],
        description_sections=[DescriptionSection(section_id="specifications", source_fields=["materials", "dimensions", "certifications"], format="spec_table", generation="template")],
        title_constraints=TitleConstraints(style="formal", max_length=80, include_fields=["category", "materials"], forbid_marketing_language=True),
        tone="formal_procurement",
        language=["English"],
        image_spec=ImageSpec(style="plain_background", minimum_count=2),
        metadata_schema={"hsn_code": "required", "gst_breakup": "required"},
    ),
    "india_handmade": MarketProfile(
        market_id="india_handmade",
        name="IndiaHandmade-style",
        description="Story-led artisan listing with craft and provenance context.",
        required_passport_fields=["title", "materials", "technique", "artisan_story", "origin_region"],
        description_sections=[
            DescriptionSection(section_id="artisan_story", source_fields=["artisan_story"], format="prose", generation="llm_section"),
            DescriptionSection(section_id="craft_and_care", source_fields=["technique", "care_instructions"], format="prose", generation="template"),
        ],
        title_constraints=TitleConstraints(style="evocative", max_length=80, include_fields=["technique", "origin_region"]),
        tone="narrative_craft",
        language=["English", "Hindi"],
        image_spec=ImageSpec(style="lifestyle_closeup", minimum_count=3),
        metadata_schema={"origin_region": "required"},
    ),
    "ondc_catalog": MarketProfile(
        market_id="ondc_catalog",
        name="ONDC/WhatsApp catalog",
        description="Compact local catalog entry with discrete attributes.",
        required_passport_fields=["title", "materials", "category"],
        description_sections=[DescriptionSection(section_id="attributes", source_fields=["category", "materials", "dimensions", "color", "use_case"], format="bullet_table", generation="template")],
        title_constraints=TitleConstraints(style="catalog", max_length=40, include_fields=["category"]),
        tone="structured_catalog",
        language=["Hindi", "English"],
        image_spec=ImageSpec(style="square_spec", minimum_count=1, aspect_ratio="1:1"),
        metadata_schema={"attributes_discrete": "required"},
    ),
}


def get_market_profile(market_id: str) -> MarketProfile:
    try:
        return MARKET_PROFILES[market_id]
    except KeyError as exc:
        raise ValueError(f"Unknown market profile: {market_id}") from exc
