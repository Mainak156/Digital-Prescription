from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class Medication(BaseModel):
    name: str = Field(..., description="Generic drug name preferred")
    strength: Optional[str] = Field(None, description="e.g., 500 mg")
    form: Optional[str] = Field(None, description="tablet, syrup, etc.")
    quantity: Optional[str] = Field(None, description="Total quantity prescribed")


class Directions(BaseModel):
    dose: Optional[str] = None
    frequency: Optional[str] = None
    route: Optional[str] = None
    duration: Optional[str] = None
    purpose: Optional[str] = None


class PrescriptionData(BaseModel):
    id: str

    # 🔷 Patient Details
    patient_name: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    weight: Optional[float] = None

    # 🔷 Doctor Details
    doctor_name: Optional[str] = None
    doctor_registration: Optional[str] = None
    doctor_contact: Optional[str] = None

    # 🔷 Hospital Layer (NEW - IMPORTANT)
    hospital_id: str
    hospital_name: Optional[str] = None
    hospital_address: Optional[str] = None
    hospital_contact: Optional[str] = None
    hospital_logo: Optional[str] = None

    # 🔷 Clinical Information
    diagnosis: Optional[str] = None
    clinical_notes: Optional[str] = None

    # 🔷 Core Prescription
    medications: Optional[List[Medication]] = None
    directions: Optional[Directions] = None

    # 🔷 Safety Layer (NEW)
    refill_info: Optional[str] = None
    controlled_substance: Optional[bool] = False
    warnings: Optional[List[str]] = None

    # 🔷 AI Layer
    ai_generated_text: Optional[str] = None
    ai_cleaned_text: Optional[str] = None
    ai_confidence_score: Optional[float] = None

    # 🔷 Final Output Layer
    final_prescription: Optional[str] = None
    is_reviewed: Optional[bool] = False
    reviewed_by: Optional[str] = None

    # 🔷 Flexible Custom Fields (Multi-Institution Support)
    custom_fields: Optional[Dict[str, Any]] = None

    # 🔷 Metadata (IMPORTANT FOR YOUR PROJECT)
    status: Optional[str] = "draft"
    version: Optional[int] = 1
    source_institution: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PrescriptionCreate(BaseModel):
    # 🔥 REQUIRED FIELD (CRITICAL FIX)
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

    # Core
    medications: List[Medication]
    directions: Directions

    # Safety
    refill_info: Optional[str] = None
    controlled_substance: Optional[bool] = False

    # Flexible
    custom_fields: Optional[Dict[str, Any]] = None


class PrescriptionResponse(BaseModel):
    message: str
    data: Optional[List[PrescriptionData]] = None
    error: Optional[str] = None


class AIResponse(BaseModel):
    message: str
    ai_text: Optional[str] = None
    cleaned_text: Optional[str] = None
    error: Optional[str] = None