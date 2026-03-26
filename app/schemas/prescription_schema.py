from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class Medication(BaseModel):
    name: str = Field(..., description="Generic drug name preferred")
    strength: Optional[str] = None
    form: Optional[str] = None
    quantity: Optional[str] = None


class Directions(BaseModel):
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    duration: Optional[str] = None
    purpose: Optional[str] = None


class PrescriptionData(BaseModel):
    id: str

    # 🔷 Patient
    patient_name: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    weight: Optional[float] = None

    # 🔷 Doctor
    doctor_name: Optional[str] = None
    doctor_registration: Optional[str] = None
    doctor_contact: Optional[str] = None

    # 🔷 Hospital (JOINED DATA OPTIONAL)
    hospital_id: str
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    hospital_contact: Optional[str] = None
    hospital_logo: Optional[str] = None

    # 🔷 Clinical
    diagnosis: Optional[str] = None

    # ❌ REMOVED direct clinical_notes (NOT IN DB)

    # 🔷 AI GENERATED
    medications: Optional[List[Medication]] = None
    directions: Optional[Directions] = None

    # 🔷 Safety
    refill_info: Optional[str] = None
    controlled_substance: Optional[bool] = False

    # 🔷 AI Layer
    ai_generated_text: Optional[str] = None

    # 🔷 Final
    final_prescription: Optional[str] = None

    # 🔷 Flexible (IMPORTANT)
    custom_fields: Optional[Dict[str, Any]] = None

    # 🔷 Metadata
    status: Optional[str] = "draft"

    created_at: Optional[datetime] = None


class PrescriptionCreate(BaseModel):

    hospital_id: str

    # Patient
    patient_name: str
    address: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    weight: Optional[float] = None

    # Doctor
    doctor_name: str
    doctor_registration: Optional[str] = None
    doctor_contact: Optional[str] = None

    # Clinical
    diagnosis: Optional[str] = None

    # ❌ REMOVE THESE FROM INPUT (AI will generate)
    medications: Optional[List[Medication]] = None
    directions: Optional[Directions] = None

    # Safety
    refill_info: Optional[str] = None
    controlled_substance: Optional[bool] = False

    # 🔥 USE THIS FOR NOTES
    custom_fields: Optional[Dict[str, Any]] = None


class PrescriptionResponse(BaseModel):
    message: str
    data: Optional[List[PrescriptionData]] = None
    error: Optional[str] = None


class AIResponse(BaseModel):
    message: str
    ai_text: Optional[str] = None
    error: Optional[str] = None