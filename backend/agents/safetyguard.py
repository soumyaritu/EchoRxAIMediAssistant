# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from google.adk.agents import LlmAgent
# pyrefly: ignore [missing-import]
from google.adk.agents.readonly_context import ReadonlyContext
from config import MODEL

class SafetyInfo(BaseModel):
    purpose: str
    standard_dose: str
    critical_warning: str
    empty_stomach: str
    max_daily_dose: str
    safe_at_night: str
    night_note: str
    overdose_risk: str
    interactions_note: str
    nhs_advice: str

def safety_instruction(ctx: ReadonlyContext) -> str:
    med = ctx.state.get("medicine_info", {})
    if isinstance(med, BaseModel):
        med = med.model_dump()
        
    if not med.get("is_medicine", True):
        return (
            "A visually impaired/Low Vision Users/Elderlyperson scanned an object that is NOT a medicine. "
            f"Object detected: {med.get('detected_object', 'Unknown object')}\n"
            "Provide ONLY the most critical safety information they need RIGHT NOW about this object. "
            "If it is dangerous (like bleach, alcohol, or chemicals), warn them immediately in the critical_warning field. "
            "If it is harmless (like a cup), just say it is a harmless object. "
            "Use simple, everyday language. No jargon. Short sentences."
        )

    return (
        "A visually impaired/Low Vision Users/Elderlyperson is unwell at 3am and needs to know if they can safely take their medicine. "
        f"Medicine: {med.get('medicine_name', 'Unknown')}\n"
        f"Strength: {med.get('dosage', 'Unknown')}\n"
        f"Form: {med.get('form', 'tablet')}\n"
        f"Expiry on label: {med.get('expiry_date', 'not visible')}\n"
        "Provide ONLY the most critical information they need RIGHT NOW. "
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
