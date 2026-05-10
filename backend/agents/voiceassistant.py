# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from google.adk.agents import LlmAgent
# pyrefly: ignore [missing-import]
from google.adk.agents.readonly_context import ReadonlyContext
from config import MODEL

def voice_instruction(ctx: ReadonlyContext) -> str:
    med = ctx.state.get("medicine_info", {})
    safety = ctx.state.get("safety_info", {})
    if isinstance(med, BaseModel): med = med.model_dump()
    if isinstance(safety, BaseModel): safety = safety.model_dump()
    
    if not med.get("is_medicine", True):
        obj = med.get("detected_object", "an unknown object")
        return (
            f"The user scanned {obj}, which is NOT a medicine. "
            "Assemble a final spoken message that starts with 'This is not a medicine.' and then explains what the object is, followed by any safety warnings provided. "
            "Calm, clear, ordered — designed to be heard not read. Do not use markdown.\n"
            f"Safety Info: {safety}"
        )

    return (
        "You are the VoiceAgent. Assemble the final spoken message. "
        "Calm, clear, ordered — designed to be heard not read. Do not use markdown. "
        f"Medicine Info: {med}\n"
        f"Safety Info: {safety}\n"
        "Synthesize a natural, helpful spoken response."
    )

def create_voiceassist_agent():
    return LlmAgent(
        name="VoiceAssistAgent",
        model=MODEL,
        output_key="spoken_message",
        include_contents='none',
        instruction=voice_instruction
    )
