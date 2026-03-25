import os
import uuid
from fastapi import UploadFile
from app.database import supabase

UPLOAD_DIR = "uploads"
BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


async def create_hospital(data):
    try:
        logo: UploadFile = data["logo"]

        # ✅ Generate safe unique filename
        file_ext = logo.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"

        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # ✅ Save file locally
        with open(file_path, "wb") as f:
            f.write(await logo.read())

        # ✅ Correct logo URL (NO localhost in production)
        logo_url = f"{BASE_URL}/uploads/{unique_filename}"

        # ✅ Prepare DB payload
        hospital_payload = {
            "name": data["name"],
            "address": data["address"],
            "contact": data["contact"],
            "logo_url": logo_url
        }

        # ✅ Insert into Supabase
        response = supabase.table("hospitals").insert(hospital_payload).execute()

        return {
            "message": "Hospital created successfully",
            "data": response.data
        }

    except Exception as e:
        return {
            "message": "Hospital creation failed",
            "error": str(e)
        }


def get_hospital(hospital_id):
    try:
        response = (
            supabase.table("hospitals")
            .select("*")
            .eq("id", hospital_id)
            .execute()
        )

        return {
            "message": "Hospital fetched",
            "data": response.data
        }

    except Exception as e:
        return {
            "message": "Fetch failed",
            "error": str(e)
        }