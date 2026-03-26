import re


def clean_ai_prescription(text: str) -> str:
    if not text:
        return ""

    # ================= REMOVE MARKDOWN =================
    text = re.sub(r"[#*`\"_]", "", text)

    # ================= REMOVE WEIRD SYMBOLS =================
    # Keep medical characters like mg, ml, /, ()
    text = re.sub(r"[^\w\s.,:/()-]", "", text)

    # ================= NORMALIZE SPACES =================
    text = re.sub(r"\s+", " ", text)

    # ================= SECTION HEADINGS =================
    sections = [
        "Patient Details",
        "Prescriber Details",
        "Doctor Details",
        "Clinical Information",
        "Diagnosis",
        "Medications",
        "Directions",
        "Refill Information",
        "Special Notes",
        "Additional Instructions"
    ]

    for sec in sections:
        text = re.sub(fr"\b{sec}\b", f"\n\n{sec.upper()}", text, flags=re.IGNORECASE)

    # ================= BULLET FORMATTING =================
    text = re.sub(r"\s*-\s*", "\n• ", text)

    # ================= CLEAN MULTIPLE LINE BREAKS =================
    text = re.sub(r"\n{3,}", "\n\n", text)

    # ================= SENTENCE FORMATTING =================
    sentences = text.split(". ")
    sentences = [s.strip().capitalize() for s in sentences if s.strip()]
    text = ". ".join(sentences)

    # ================= FINAL CLEAN =================
    return text.strip()