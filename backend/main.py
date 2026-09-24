from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_URL
from engine_completeness import calculate_completeness
from engine_interview import process_answer, start_interview
from field_registry import FIELD_REGISTRY
from interview_engine import build_question_for_field, scan_missing_fields, select_next_field
from market_pack_engine import generate_market_pack
from market_profiles import MARKET_PROFILES, get_market_profile
from schemas import AnswerRequest, GenerateMarketPacksRequest, ProductPassport

app = FastAPI(title="PА Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACTIVE_PASSPORT = ProductPassport(
    title="Ceramic Mug",
    category="Drinkware",
    description="Handcrafted ceramic mug made with traditional techniques.",
    materials=["Ceramic"],
    colors=["Blue"],
    price=24.0,
    quantity_available=50,
    craft_method="Hand-painted",
    origin="Kutch, Gujarat",
)
ACTIVE_SESSION = None


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "service": "backend"}


@app.get("/api")
def api_root() -> dict[str, Any]:
    return {"message": "PА backend ready"}


@app.get("/api/demo/passport")
def demo_passport() -> dict[str, Any]:
    passport = ProductPassport(
        title="Ceramic Mug",
        category="Drinkware",
        description="Handcrafted ceramic mug made with traditional techniques.",
        materials=["Ceramic"],
        colors=["Blue"],
        price=24.0,
        quantity_available=50,
        craft_method="Hand-painted",
        origin="Kutch, Gujarat",
    )
    report = calculate_completeness(passport)
    return {"passport": passport.model_dump(), "completeness": report.model_dump()}


@app.get("/api/market-profiles")
def market_profiles() -> dict[str, Any]:
    return {
        "profiles": {k: v.model_dump() for k, v in MARKET_PROFILES.items()},
        "registry": FIELD_REGISTRY,
    }


@app.post("/api/market-packs")
def market_packs(payload: GenerateMarketPacksRequest) -> dict[str, Any]:
    passport = ACTIVE_PASSPORT
    packs = [generate_market_pack(passport, get_market_profile(profile_id)) for profile_id in payload.market_profile_ids]
    return {
        "packs": [pack.model_dump() for pack in packs],
        "passport_id": passport.id,
        "passport_version": passport.version,
    }


@app.get("/api/interview/next")
def next_field() -> dict[str, Any]:
    passport = ACTIVE_PASSPORT or ProductPassport(
        title="Ceramic Mug",
        category="Drinkware",
        description="Handcrafted ceramic mug made with traditional techniques.",
        materials=["Ceramic"],
        colors=["Blue"],
        price=24.0,
        quantity_available=50,
        craft_method="Hand-painted",
        origin="Kutch, Gujarat",
    )
    field_id = select_next_field(passport, ["amazon", "etsy", "shopify"])
    question = build_question_for_field(field_id, passport) if field_id else None
    return {
        "field_id": field_id,
        "question": question,
        "missing_fields": [m.field_id for m in scan_missing_fields(passport, FIELD_REGISTRY)],
    }


@app.post("/api/interview/start")
def interview_start() -> dict[str, Any]:
    global ACTIVE_PASSPORT, ACTIVE_SESSION
    ACTIVE_PASSPORT = ProductPassport(
        title="Ceramic Mug",
        category="Drinkware",
        description="Handcrafted ceramic mug made with traditional techniques.",
        materials=["Ceramic"],
        colors=["Blue"],
        price=24.0,
        quantity_available=50,
        craft_method="Hand-painted",
        origin="Kutch, Gujarat",
    )
    ACTIVE_SESSION = start_interview(ACTIVE_PASSPORT)
    report = calculate_completeness(ACTIVE_PASSPORT)
    return {
        "session": ACTIVE_SESSION.model_dump(),
        "passport": ACTIVE_PASSPORT.model_dump(),
        "completeness": report.model_dump(),
    }


@app.post("/api/interview/answer")
def interview_answer(payload: AnswerRequest) -> dict[str, Any]:
    global ACTIVE_PASSPORT, ACTIVE_SESSION
    if ACTIVE_SESSION is None:
        ACTIVE_PASSPORT = ProductPassport(
            title="Ceramic Mug",
            category="Drinkware",
            description="Handcrafted ceramic mug made with traditional techniques.",
            materials=["Ceramic"],
            colors=["Blue"],
            price=24.0,
            quantity_available=50,
            craft_method="Hand-painted",
            origin="Kutch, Gujarat",
        )
        ACTIVE_SESSION = start_interview(ACTIVE_PASSPORT)

    raw_transcript = payload.raw_transcript.strip()
    if not raw_transcript:
        raise HTTPException(status_code=400, detail={"error": "raw_transcript is required"})

    ACTIVE_SESSION, ACTIVE_PASSPORT, answer = process_answer(
        ACTIVE_SESSION,
        ACTIVE_PASSPORT,
        raw_transcript,
    )
    report = calculate_completeness(ACTIVE_PASSPORT)
    return {
        "session": ACTIVE_SESSION.model_dump(),
        "passport": ACTIVE_PASSPORT.model_dump(),
        "answer": answer.model_dump(),
        "completeness": report.model_dump(),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
