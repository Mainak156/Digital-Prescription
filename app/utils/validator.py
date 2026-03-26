import re


def validate_prescription(data):

    # ================= BASIC REQUIRED =================
    required_fields = [
        "hospital_id",
        "patient_name",
        "age",
        "sex",
        "doctor_name",
        "diagnosis"
    ]

    for field in required_fields:
        if field not in data or data.get(field) in [None, "", []]:
            return False, f"{field} is required"

    # ================= PATIENT VALIDATION =================

    # Name
    if not isinstance(data.get("patient_name"), str) or len(data.get("patient_name")) < 2:
        return False, "patient_name must be a valid string"

    # Age
    if not isinstance(data.get("age"), int) or data.get("age") <= 0 or data.get("age") > 120:
        return False, "age must be between 1 and 120"

    # Sex
    valid_sex = ["male", "female", "other"]
    if str(data.get("sex")).lower() not in valid_sex:
        return False, f"sex must be one of {valid_sex}"

    # Weight
    if data.get("weight") is not None:
        try:
            weight = float(data.get("weight"))
            if weight <= 0 or weight > 300:
                return False, "weight must be between 1 and 300 kg"
        except:
            return False, "weight must be a valid number"

    # ================= DOCTOR VALIDATION =================

    # Doctor name
    if len(data.get("doctor_name")) < 3:
        return False, "doctor_name must be valid"

    # Registration number (basic check)
    if data.get("doctor_registration"):
        if len(data.get("doctor_registration")) < 5:
            return False, "doctor_registration seems invalid"

    # Phone validation (Indian standard)
    if data.get("doctor_contact"):
        phone = str(data.get("doctor_contact"))

        # Accept +91XXXXXXXXXX or 10 digit
        if not re.match(r"^(\+91)?[6-9]\d{9}$", phone):
            return False, "doctor_contact must be a valid Indian phone number"

    # ================= CLINICAL VALIDATION =================

    # Diagnosis
    if len(data.get("diagnosis")) < 3:
        return False, "diagnosis must be meaningful"

    # ================= OPTIONAL SAFETY =================

    if data.get("controlled_substance") not in [True, False, None]:
        return False, "controlled_substance must be boolean"

    # ================= CUSTOM FIELDS =================

    if data.get("custom_fields") is not None:
        if not isinstance(data.get("custom_fields"), dict):
            return False, "custom_fields must be a dictionary"

    # ================= FINAL =================
    return True, "Valid"