# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from google.adk.agents import LlmAgent
from config import MODEL

class MedicineInfo(BaseModel):
    is_medicine: bool
    detected_object: str
    medicine_name: str
    generic_name: str
    dosage: str
    form: str
    quantity: str
    expiry_date: str
    warnings_on_label: str
    manufacturer: str
    instructions_on_label: str
    food_instructions_on_label: str
    confidence: str

def create_labelsense_agent():
    return LlmAgent(
        name="LabelSenseAgent",
        model=MODEL,
        output_schema=MedicineInfo,
        output_key="medicine_info",
        instruction=(
            "You are an expert pharmacist assistant helping a visually impaired/Low vision Users/Elderlyperson. "
            "Carefully examine this medicine label/bottle and extract the required information. "
            "First, determine if the image actually contains a medicine bottle, blister pack, or pharmacy label. "
            "If it does NOT, set is_medicine to False, describe what the object actually is in the 'detected_object' field (e.g. 'a coffee mug', 'a television remote'), and set all other fields to 'not visible'. "
            "If it IS a medicine, set is_medicine to True and set 'detected_object' to 'medicine'. "
            "IMPORTANT: This is for a visually impaired/Low vision Users/Elderlyperson safety. Be precise. "
            "Only extract the expiry date if you clearly see the words 'EXP', 'Expiry', or 'Use By' next to it. "
            "If you only see a 'Manufacture Date', 'DOM', or 'Lot Number', do NOT use them as the expiry date. "
            "If something is not visible, write 'not visible'. "
            "Look carefully for explicit dosage or usage instructions printed on the label. If found, extract them exactly into 'instructions_on_label'. If not found, write 'None'. "
            "Also look for specific stickers or warnings about food (e.g. 'Take with food', 'Take on empty stomach'). Extract these into 'food_instructions_on_label'. If not found, write 'None'."
        )
    )
