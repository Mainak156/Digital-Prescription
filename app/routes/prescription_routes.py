from fastapi import APIRouter
import json

from app.schemas.prescription_schema import PrescriptionCreate
from app.services.prescription_service import (
    create_prescription,
    get_prescription,
    publish_prescription,
    save_ai_text
)
from app.services.llm_service import generate_prescription_text
from app.models.prescription_model import PrescriptionResponse, AIResponse

router = APIRouter()


# ================= CREATE =================
@router.post("/create", response_model=PrescriptionResponse)
def create(data: PrescriptionCreate):
    return create_prescription(data.model_dump())  # 🔥 FIX


# ================= GET =================
@router.get("/{id}", response_model=PrescriptionResponse)
def get(id: str):
    return get_prescription(id)


# ================= GENERATE AI =================
@router.post("/generate-ai/{id}", response_model=AIResponse)
def generate_ai(id: str):
    prescription_response = get_prescription(id)

    if prescription_response.get("error"):
        return {
            "message": "Failed to fetch prescription",
            "error": prescription_response["error"]
        }

    if not prescription_response.get("data"):
        return {
            "message": "Prescription not found",
            "error": "Invalid ID"
        }

    prescription_data = prescription_response["data"][0]

    # 🔥 Convert JSON strings back
    try:
        prescription_data["medications"] = json.loads(
            prescription_data.get("medications", "[]")
        )
        prescription_data["directions"] = json.loads(
            prescription_data.get("directions", "{}")
        )
        prescription_data["custom_fields"] = json.loads(
            prescription_data.get("custom_fields", "{}")
        )
    except Exception as e:
        return {
            "message": "JSON parsing failed",
            "error": str(e)
        }

    ai_text = generate_prescription_text(prescription_data)

    save_ai_text(id, ai_text)

    return {
        "message": "AI prescription generated successfully",
        "ai_text": ai_text
    }


# ================= PUBLISH =================
@router.post("/publish/{id}", response_model=PrescriptionResponse)
def publish(id: str):
    return publish_prescription(id)