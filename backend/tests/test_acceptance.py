from __future__ import annotations

import unittest

import engine_interview
from engine_interview import (
    generate_question,
    parse_extraction_json,
    process_answer,
    start_interview,
)
from market_pack_engine import generate_market_pack
from market_profiles import MARKET_PROFILES
from schemas import (
    Dimensions,
    FieldMeta,
    FieldSource,
    FieldStatus,
    Packaging,
    ProductPassport,
    Weight,
    MarketPackStatus,
)


class AcceptanceTests(unittest.TestCase):
    def complete_passport(self, *, missing: set[str] | None = None) -> ProductPassport:
        missing = missing or set()
        passport = ProductPassport(
            title="Bamboo Storage Basket",
            category="Home Storage",
            materials=["Bamboo"],
            dimensions=None if "dimensions" in missing else Dimensions(length=30, width=30, height=20, unit="cm"),
            weight=None if "weight" in missing else Weight(value=500, unit="g"),
            craft_method="Hand-woven",
            technique="Hand-woven",
            origin="Assam",
            origin_region="Assam",
            artisan_story="Made by a family of basket weavers in Assam.",
            use_case="Storage",
            color="Natural",
            colors=["Natural"],
            care_instructions="Keep dry and wipe clean.",
            certifications=["Handmade"],
            hsn_code="4602",
            gst_breakup={"cgst": 2.5, "sgst": 2.5},
            description="A hand-woven bamboo basket for home storage.",
            price=850,
            customization_available=False,
            quantity_available=20,
            packaging=Packaging(type="Recycled cardboard box"),
            tags=["basket", "storage", "handmade"],
        )
        for field_id, value in {
            "title": passport.title,
            "category": passport.category,
            "materials": passport.materials,
            "craft_method": passport.craft_method,
            "origin": passport.origin,
            "technique": passport.technique,
            "origin_region": passport.origin_region,
            "artisan_story": passport.artisan_story,
            "use_case": passport.use_case,
            "color": passport.color,
            "colors": passport.colors,
            "care_instructions": passport.care_instructions,
            "certifications": passport.certifications,
            "hsn_code": passport.hsn_code,
            "gst_breakup": passport.gst_breakup,
            "description": passport.description,
            "price": passport.price,
            "customization_available": passport.customization_available,
            "quantity_available": passport.quantity_available,
            "packaging": passport.packaging,
            "tags": passport.tags,
        }.items():
            passport.fields[field_id] = FieldMeta(value=value, confidence=0.95, source=FieldSource.USER_ENTERED, status=FieldStatus.CONFIRMED)
        return passport

    def test_interview_stops_at_threshold_after_two_missing_fields(self):
        passport = self.complete_passport(missing={"dimensions", "weight"})
        original_threshold = engine_interview.INTERVIEW_COMPLETION_THRESHOLD
        engine_interview.INTERVIEW_COMPLETION_THRESHOLD = 100
        try:
            session = start_interview(passport)
            self.assertEqual(session.current_question.field, "dimensions")

            session, passport, _ = process_answer(session, passport, "30 by 30 by 20 cm")
            session, passport, _ = process_answer(session, passport, "500 grams")

            self.assertEqual(session.answers_received, 2)
            self.assertEqual(session.status.value, "COMPLETED")
            self.assertIsNone(session.current_question)
        finally:
            engine_interview.INTERVIEW_COMPLETION_THRESHOLD = original_threshold

    def test_interview_never_reasks_answered_field(self):
        passport = self.complete_passport(missing={"dimensions", "weight"})
        session = start_interview(passport)
        session, passport, _ = process_answer(session, passport, "30 by 30 by 20 cm")
        self.assertEqual([entry["field"] for entry in session.history].count("dimensions"), 1)

    def test_question_matches_selected_field(self):
        passport = self.complete_passport(missing={"dimensions"})
        question = generate_question("dimensions", passport)
        self.assertEqual(question.field, "dimensions")
        self.assertIn("dimension", question.question.lower())

    def test_market_pack_blocks_on_missing_hsn(self):
        passport = self.complete_passport()
        passport.hsn_code = None
        passport.fields.pop("hsn_code", None)
        pack = generate_market_pack(passport, MARKET_PROFILES["gem"])
        self.assertEqual(pack.status, MarketPackStatus.INCOMPLETE)
        self.assertIn("hsn_code", pack.missing_fields)
        self.assertEqual(generate_market_pack(passport, MARKET_PROFILES["india_handmade"]).status, MarketPackStatus.READY)

    def test_market_packs_structurally_differ(self):
        passport = self.complete_passport()
        packs = [generate_market_pack(passport, profile) for profile in MARKET_PROFILES.values()]
        self.assertEqual({pack.market_id for pack in packs}, {"gem", "india_handmade", "ondc_catalog"})
        self.assertEqual({len(profile.required_passport_fields) for profile in MARKET_PROFILES.values()}, {3, 5, 7})
        self.assertEqual({section.format for profile in MARKET_PROFILES.values() for section in profile.description_sections}, {"spec_table", "prose", "bullet_table"})

    def test_malformed_llm_output_rejected(self):
        self.assertIsNone(parse_extraction_json("not valid json"))
        self.assertIsNone(parse_extraction_json('{"value": "bamboo"}'))
        parsed = parse_extraction_json('{"value": "bamboo", "confidence": 0.9}')
        self.assertEqual(parsed.value, "bamboo")


if __name__ == "__main__":
    unittest.main()
