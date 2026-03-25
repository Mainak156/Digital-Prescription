from groq import Groq
import os
from dotenv import load_dotenv
from app.utils.text_parser import clean_ai_prescription

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_prescription_text(data: dict):
    system_prompt = """
You are a highly trained clinical documentation assistant.

Your job is to generate SAFE, PROFESSIONAL, and REAL-WORLD USABLE medical prescriptions.

You MUST:
- Follow WHO and institutional prescription standards
- Avoid ALL abbreviations (write full words)
- Ensure clarity for both patient and pharmacist
- Use standard SI units
- Maintain strict clinical structure
"""

    user_prompt = f"""
Generate a COMPLETE prescription using the following structure:

1. Patient Details
- Name
- Age
- Sex
- Weight (if available)
- Address (if available)

2. Prescriber Details
- Doctor Name
- Registration Number
- Contact

3. Clinical Information
- Date
- Diagnosis

4. Medication Details
For EACH medication include:
- Name (prefer generic)
- Strength (e.g., milligrams)
- Form (tablet, syrup, etc.)
- Quantity

5. Directions
- Dose
- Frequency (clear, e.g., every 8 hours)
- Route
- Duration
- Purpose

6. Refill Information

7. Special Notes
- Controlled substance warning (if applicable)

8. Additional Instructions
Include ALL custom fields provided:
- Diet
- Follow-up
- Ayurveda
- Lifestyle
- Any other fields

Formatting Rules:
- Clean headings
- Bullet points where needed
- No markdown symbols (#, *, etc.)
- Professional clinical tone

IMPORTANT: Use English Grammar Rules for every part of speech. Maintain proper structure in the output response.

INPUT DATA:
{data}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-safeguard-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=1500
        )

        raw_text = response.choices[0].message.content

        cleaned_text = clean_ai_prescription(raw_text)

        return cleaned_text

    except Exception as e:
        return f"Error generating prescription: {str(e)}"