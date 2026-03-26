from fastapi import APIRouter, UploadFile, File, Form
from app.services.hospital_service import create_hospital, get_hospital

router = APIRouter()

# ================= CREATE =================
@router.post("/")
async def create(
    name: str = Form(...),
    address: str = Form(...),
    contact: str = Form(...),
    logo: UploadFile = File(...)
):
    data = {
        "name": name,
        "address": address,
        "contact": contact,
        "logo": logo
    }

    return await create_hospital(data)


# ================= GET =================
@router.get("/{hospital_id}")
def get(hospital_id: str):
    return get_hospital(hospital_id)