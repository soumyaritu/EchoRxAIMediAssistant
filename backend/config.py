import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is missing. Please set it in backend/.env")

MODEL = "gemini-2.5-flash"

os.environ["GEMINI_API_KEY"] = str(GEMINI_API_KEY)
