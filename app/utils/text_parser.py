import re

def clean_ai_prescription(text: str) -> str:
    if not text:
        return ""

    # 1. Remove markdown symbols
    text = re.sub(r"[#*`\"_]", "", text)

    # 2. Remove extra symbols but keep medical units
    text = re.sub(r"[^\w\s.,:/()-]", "", text)

    # 3. Normalize spaces
    text = re.sub(r"\s+", " ", text)

    # 4. Fix line breaks after sections
    text = re.sub(r"(Patient Details|Doctor Details|Diagnosis|Medications|Directions|Additional Notes)", r"\n\n\1", text)

    # 5. Clean bullet formatting
    text = re.sub(r"\s*-\s*", "\n• ", text)

    # 6. Capitalize sentences
    sentences = text.split(". ")
    sentences = [s.strip().capitalize() for s in sentences if s.strip()]
    text = ". ".join(sentences)

    return text.strip()