import json
from app.database import supabase
from app.utils.validator import validate_prescription


# ================= HELPER =================
def safe_json_dumps(value):
    try:
        if isinstance(value, (dict, list)):
            return json.dumps(value)
        if isinstance(value, str):
            return value
        return json.dumps({})
    except:
        return json.dumps({})


def safe_json_loads(value):
    try:
        if isinstance(value, (dict, list)):
            return value
        if isinstance(value, str):
            return json.loads(value)
        return {}
    except:
        return {}


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

        # 🔥 STRICT PAYLOAD (ONLY EXISTING DB COLUMNS)
        payload = {
            "hospital_id": hospital_id,
            "patient_name": data.get("patient_name"),
            "address": data.get("address"),
            "age": data.get("age"),
            "sex": data.get("sex"),
            "weight": data.get("weight"),

            "doctor_name": data.get("doctor_name"),
            "doctor_registration": data.get("doctor_registration"),
            "doctor_contact": data.get("doctor_contact"),

            "diagnosis": data.get("diagnosis"),
            "refill_info": data.get("refill_info"),
            "controlled_substance": data.get("controlled_substance", False),

            # ✅ ONLY JSON FIELD YOU HAVE
            "custom_fields": safe_json_dumps(data.get("custom_fields")),

            "status": "draft"
        }

        print("🔥 FINAL PAYLOAD TO DB:", payload)

        response = supabase.table("prescriptions").insert(payload).execute()

        if not response or not response.data:
            return {
                "message": "Insert failed",
                "error": "No data returned from DB"
            }

        return {
            "message": "Prescription created successfully",
            "data": response.data
        }

    except Exception as e:
        print("❌ CREATE ERROR:", str(e))
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

        if not response or not response.data:
            return {
                "message": "Prescription not found",
                "error": "Invalid ID"
            }

        cleaned_data = []

        for row in response.data:
            row["custom_fields"] = safe_json_loads(row.get("custom_fields"))
            cleaned_data.append(row)

        return {
            "message": "Prescription fetched successfully",
            "data": cleaned_data
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
        if not isinstance(ai_text, str):
            ai_text = json.dumps(ai_text)

        response = supabase.table("prescriptions") \
            .update({
                "ai_generated_text": ai_text,
                "status": "ai_generated"
            }) \
            .eq("id", prescription_id) \
            .execute()

        if not response or not response.data:
            return {
                "message": "AI save failed",
                "error": "No data returned"
            }

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

        if not existing or not existing.data:
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

        if not response or not response.data:
            return {
                "message": "Publish failed",
                "error": "No data returned"
            }

        cleaned_data = []

        for row in response.data:
            row["custom_fields"] = safe_json_loads(row.get("custom_fields"))
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