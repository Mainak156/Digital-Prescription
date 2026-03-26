from groq import Groq
import os
from dotenv import load_dotenv
import json

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_prescription_text(data: dict):

    clinical_notes = data.get("clinical_notes", "None")
    custom_fields = data.get("custom_fields", {})

    custom_text = "\n".join(
        [f"{k}: {v}" for k, v in custom_fields.items()]
    ) if custom_fields else "None"

    system_prompt = """
You are a clinical AI assistant.

STRICT RULES:
- Output ONLY valid JSON
- No explanations
- No markdown
- No extra text

Ensure:
- Safe prescriptions
- WHO-compliant structure
- Clear instructions
"""

    user_prompt = f"""
Generate a medical prescription in STRICT JSON format.

FORMAT:

{{
  "medications": [
    {{
      "name": "",
      "strength": "",
      "form": "",
      "quantity": ""
    }}
  ],
  "directions": {{
    "dose": "",
    "frequency": "",
    "route": "",
    "duration": "",
    "purpose": ""
  }},
  "refill_info": "",
  "notes": []
}}

PATIENT DATA:
Age: {data.get("age")}
Sex: {data.get("sex")}
Weight: {data.get("weight")}
Diagnosis: {data.get("diagnosis")}

Doctor Notes:
{clinical_notes}

Additional Info:
{custom_text}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-safeguard-20b",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
            max_tokens=800
        )

        raw_text = response.choices[0].message.content.strip()

        # 🔥 STRICT JSON VALIDATION
        try:
            parsed = json.loads(raw_text)
            return parsed
        except Exception:
            raise Exception("AI did not return valid JSON")

    except Exception as e:
        return {
            "error": f"AI generation failed: {str(e)}"
        }