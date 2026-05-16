# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from google.adk.agents import LlmAgent
# pyrefly: ignore [missing-import]
from google.adk.agents.readonly_context import ReadonlyContext
from config import MODEL
from datetime import date

class SafetyInfo(BaseModel):
    purpose: str
    standard_dose: str
    source_of_dosage: str
    critical_warning: str
    empty_stomach: str
    source_of_food_advice: str
    max_daily_dose: str
    safe_at_night: str
    night_note: str
    overdose_risk: str
    interactions_note: str
    nhs_advice: str

def safety_instruction(ctx: ReadonlyContext) -> str:
    today_str = date.today().strftime("%d %B %Y")
    med = ctx.state.get("medicine_info", {})
    if isinstance(med, BaseModel):
        med = med.model_dump()
        
    if not med.get("is_medicine", True):
        return (
            "A visually impaired/Low Vision Users/Elderlyperson scanned an object that is NOT a medicine. "
            f"Object detected: {med.get('detected_object', 'Unknown object')}\n"
            "Provide ONLY the most critical safety information they need RIGHT NOW about this object. "
            "If it is dangerous (like bleach, alcohol, or chemicals), warn them immediately in the critical_warning field. "
            "If it is harmless (like a cup or a book), output 'None' for the critical_warning field so we do not cause unnecessary panic. "
            "Use simple, everyday language. No jargon. Short sentences."
        )

    return (
        "A visually impaired/Low Vision Users/Elderlyperson is unwell at 3am and needs to know if they can safely take their medicine. "
        f"Today's date is: {today_str}. "
        f"Medicine: {med.get('medicine_name', 'Unknown')}\n"
        f"Strength: {med.get('dosage', 'Unknown')}\n"
        f"Form: {med.get('form', 'tablet')}\n"
        f"Expiry on label: {med.get('expiry_date', 'not visible')}\n"
        f"Instructions on label: {med.get('instructions_on_label', 'None')}\n"
        f"Food instructions on label: {med.get('food_instructions_on_label', 'None')}\n"
        "Provide ONLY the most critical information they need RIGHT NOW. "
        "IMPORTANT: Compare the 'Expiry on label' to today's date. If the medicine is expired, you MUST put a strong warning in the 'critical_warning' field stating that it is expired and unsafe to take. "
        "IMPORTANT: If 'Instructions on label' is provided and not 'None', you MUST use it for the 'standard_dose' field. "
        "Only if the label instructions are missing or unclear should you use your general medical knowledge for the dose. "
        "Set 'source_of_dosage' to 'Label' if you used the label instructions, or 'General Knowledge' if you used your internal knowledge. "
        "IMPORTANT: If 'Food instructions on label' is provided and not 'None', you MUST use it for the 'empty_stomach' field. "
        "Otherwise, use your general medical knowledge. Set 'source_of_food_advice' to 'Label' or 'General Knowledge' accordingly. "
        "Use simple, everyday language. No jargon. Short sentences."
    )

def create_safetyguard_agent():
    return LlmAgent(
        name="SafetyGuardAgent",
        model=MODEL,
        output_schema=SafetyInfo,
        output_key="safety_info",
        include_contents='none',
        instruction=safety_instruction
    )

