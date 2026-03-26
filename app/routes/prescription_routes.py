from fastapi import APIRouter, HTTPException
import json

from app.schemas.prescription_schema import PrescriptionCreate
from app.services.prescription_service import (
    create_prescription,
    get_prescription,
    publish_prescription,
    save_ai_text
)
from app.services.llm_service import generate_prescription_text

router = APIRouter()


# ================= CREATE =================
@router.post("/create")
def create_route(data: PrescriptionCreate):
    try:
        result = create_prescription(data.model_dump())

        if not result or result.get("error"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to create prescription")
            )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= GET =================
@router.get("/{prescription_id}")
def get_route(prescription_id: str):
    try:
        result = get_prescription(prescription_id)

        if not result or result.get("error"):
            raise HTTPException(
                status_code=404,
                detail="Prescription not found"
            )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= GENERATE AI =================
@router.post("/generate-ai/{prescription_id}")
def generate_ai_route(prescription_id: str):
    try:
        prescription_response = get_prescription(prescription_id)

        if not prescription_response or prescription_response.get("error"):
            raise HTTPException(status_code=404, detail="Prescription not found")

        prescription_data = prescription_response["data"][0]

        # 🔥 Safe custom field parsing
        try:
            custom_fields = prescription_data.get("custom_fields", {})
            if isinstance(custom_fields, str):
                custom_fields = json.loads(custom_fields)
        except Exception:
            custom_fields = {}

        # 🔥 AI INPUT
        ai_input = {
            "age": prescription_data.get("age"),
            "sex": prescription_data.get("sex"),
            "weight": prescription_data.get("weight"),
            "diagnosis": prescription_data.get("diagnosis"),
            "custom_fields": custom_fields
        }

        # 🔥 AI CALL
        ai_output = generate_prescription_text(ai_input)

        if not ai_output or ai_output.get("error"):
            raise HTTPException(status_code=500, detail=ai_output.get("error", "AI failed"))

        # 🔥 SAVE STRUCTURED JSON
        save_ai_text(prescription_id, json.dumps(ai_output))

        return {
            "message": "AI prescription generated successfully",
            "ai_text": ai_output   # ✅ JSON (not string)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================= PUBLISH =================
@router.post("/publish/{prescription_id}")
def publish_route(prescription_id: str):
    try:
        result = publish_prescription(prescription_id)

        if not result or result.get("error"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Publish failed")
            )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))