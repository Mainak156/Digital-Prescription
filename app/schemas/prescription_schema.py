from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class Medication(BaseModel):
    name: str
    strength: Optional[str] = None
    form: Optional[str] = None
    quantity: Optional[str] = None


class Directions(BaseModel):
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    duration: Optional[str] = None
    purpose: Optional[str] = None


# 🔥 INPUT SCHEMA (STRICT)
class PrescriptionCreate(BaseModel):
    hospital_id: str  # ✅ REQUIRED

    patient_name: str
    address: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    weight: Optional[float] = None

    doctor_name: str
    doctor_registration: Optional[str] = None
    doctor_contact: Optional[str] = None

    diagnosis: Optional[str] = None

    medications: List[Medication]
    directions: Directions

    refill_info: Optional[str] = None
    controlled_substance: Optional[bool] = False

    custom_fields: Optional[Dict[str, Any]] = None


# 🔥 OUTPUT SCHEMA
class PrescriptionData(BaseModel):
    id: str
    hospital_id: str  # ✅ MUST NOT BE OPTIONAL

    patient_name: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    weight: Optional[float] = None

    doctor_name: Optional[str] = None
    doctor_registration: Optional[str] = None
    doctor_contact: Optional[str] = None

    diagnosis: Optional[str] = None

    medications: Optional[List[Medication]] = None
    directions: Optional[Directions] = None

    refill_info: Optional[str] = None
    controlled_substance: Optional[bool] = False

    custom_fields: Optional[Dict[str, Any]] = None

    ai_generated_text: Optional[str] = None
    final_prescription: Optional[str] = None
    status: Optional[str] = "draft"

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PrescriptionResponse(BaseModel):
    message: str
    data: Optional[List[PrescriptionData]] = None
    error: Optional[str] = None


class AIResponse(BaseModel):
    message: str
    ai_text: Optional[str] = None
    error: Optional[str] = None