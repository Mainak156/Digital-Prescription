import json
from app.database import supabase
from app.utils.validator import validate_prescription


# ================= CREATE =================
def create_prescription(data):
    valid, msg = validate_prescription(data)
    if not valid:
        return {
            "message": "Validation failed",
            "error": msg
        }

    try:
        hospital_id = data.get("hospital_id")

        if not hospital_id:
            return {
                "message": "Hospital missing",
                "error": "hospital_id is required"
            }

        payload = {
            **data,
            "hospital_id": hospital_id,
            "medications": json.dumps(data.get("medications", [])),
            "directions": json.dumps(data.get("directions", {})),
            "custom_fields": json.dumps(data.get("custom_fields", {}))
        }

        response = supabase.table("prescriptions").insert(payload).execute()

        if not response.data:
            return {
                "message": "Insert failed",
                "error": "No data returned"
            }

        cleaned_data = []

        for row in response.data:
            row["medications"] = json.loads(row.get("medications", "[]"))
            row["directions"] = json.loads(row.get("directions", "{}"))
            row["custom_fields"] = json.loads(row.get("custom_fields", "{}"))
            cleaned_data.append(row)

        return {
            "message": "Prescription created successfully",
            "data": cleaned_data
        }

    except Exception as e:
        print("❌ ERROR:", str(e))
        return {
            "message": "Database insert failed",
            "error": str(e)
        }

# ================= GET =================
def get_prescription(prescription_id):
    try:
        response = supabase.table("prescriptions") \
            .select("*") \
            .eq("id", prescription_id) \
            .execute()

        if not response.data:
            return {
                "message": "Prescription not found",
                "error": "Invalid ID"
            }

        return {
            "message": "Prescription fetched successfully",
            "data": response.data
        }

    except Exception as e:
        print("❌ FETCH ERROR:", str(e))
        return {
            "message": "Fetch failed",
            "error": str(e)
        }


# ================= SAVE AI =================
def save_ai_text(prescription_id, ai_text):
    try:
        response = supabase.table("prescriptions") \
            .update({
                "ai_generated_text": ai_text,
                "status": "ai_generated"
            }) \
            .eq("id", prescription_id) \
            .execute()

        return {
            "message": "AI text saved successfully",
            "data": response.data
        }

    except Exception as e:
        print("❌ AI SAVE ERROR:", str(e))
        return {
            "message": "AI save failed",
            "error": str(e)
        }


# ================= PUBLISH =================
def publish_prescription(prescription_id):
    try:
        existing = supabase.table("prescriptions") \
            .select("*") \
            .eq("id", prescription_id) \
            .execute()

        if not existing.data:
            return {
                "message": "Prescription not found",
                "error": "Invalid ID"
            }

        record = existing.data[0]

        ai_text = record.get("ai_generated_text")

        if not ai_text:
            return {
                "message": "AI text missing",
                "error": "Generate AI first"
            }

        response = supabase.table("prescriptions") \
            .update({
                "status": "published",
                "final_prescription": ai_text
            }) \
            .eq("id", prescription_id) \
            .execute()

        if not response.data:
            return {
                "message": "Publish failed",
                "error": "No data returned"
            }

        # 🔥 CRITICAL FIX AGAIN (same as create)
        cleaned_data = []

        for row in response.data:
            row["medications"] = json.loads(row.get("medications", "[]"))
            row["directions"] = json.loads(row.get("directions", "{}"))
            row["custom_fields"] = json.loads(row.get("custom_fields", "{}"))
            cleaned_data.append(row)

        return {
            "message": "Prescription published successfully",
            "data": cleaned_data
        }

    except Exception as e:
        print("❌ PUBLISH ERROR:", str(e))
        return {
            "message": "Publish failed",
            "error": str(e)
        }