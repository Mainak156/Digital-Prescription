import os
from fastapi import UploadFile
from app.database import supabase

UPLOAD_DIR = "uploads"


async def create_hospital(data):
    try:
        logo: UploadFile = data["logo"]

        # ✅ Save file locally
        file_path = os.path.join(UPLOAD_DIR, logo.filename)

        with open(file_path, "wb") as f:
            f.write(await logo.read())

        # ✅ Generate accessible URL
        logo_url = f"http://localhost:8000/uploads/{logo.filename}"

        # ✅ Prepare DB payload (IMPORTANT)
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
        response = supabase.table("hospitals") \
            .select("*") \
            .eq("id", hospital_id) \
            .execute()

        return {
            "message": "Hospital fetched",
            "data": response.data
        }

    except Exception as e:
        return {
            "message": "Fetch failed",
            "error": str(e)
        }