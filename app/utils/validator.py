def validate_prescription(data):
    required_fields = [
        "patient_name",
        "age",
        "sex",
        "doctor_name",
        "diagnosis",
        "medications",
        "directions"
    ]

    for field in required_fields:
        if field not in data or data.get(field) in [None, "", []]:
            return False, f"{field} is required"

    if not isinstance(data.get("age"), int) or data.get("age") <= 0:
        return False, "age must be a positive integer"

    if data.get("weight") is not None:
        try:
            weight = float(data.get("weight"))
            if weight <= 0:
                return False, "weight must be positive"
        except:
            return False, "weight must be a number"

    medications = data.get("medications", [])
    if not isinstance(medications, list) or len(medications) == 0:
        return False, "At least one medication required"

    for i, med in enumerate(medications):
        for key in ["name", "strength", "form", "quantity"]:
            if key not in med or med.get(key) in [None, ""]:
                return False, f"Medication {i+1}: {key} is required"

    directions = data.get("directions", {})
    for key in ["dose", "frequency", "route", "duration"]:
        if key not in directions or directions.get(key) in [None, ""]:
            return False, f"Directions: {key} is required"

    return True, "Valid"