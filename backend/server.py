import os
import uuid
import base64
# pyrefly: ignore [missing-import]
import uvicorn
from pathlib import Path
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, File, UploadFile, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from google.genai import types

# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# pyrefly: ignore [missing-import]
from google.adk.runners import Runner
# pyrefly: ignore [missing-import]
from google.adk.sessions import InMemorySessionService

from config import MODEL
from agents.root import app_adk

session_service = InMemorySessionService()

# ─────────────────────────────────────────────
# FASTAPI APP
# ─────────────────────────────────────────────
app = FastAPI(title="EchoRx API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyse")
async def analyse(image: UploadFile = File(...)):
    print(f"\n{'='*50}")
    print(f"📸 New scan: {image.filename}")
    print(f"{'='*50}")

    image_bytes = await image.read()
    image_b64 = base64.b64encode(image_bytes).decode()
    
    filename = image.filename or "medicine.jpg"
    ext = Path(filename).suffix.lower()
    mime_map = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png" }
    mime_type = mime_map.get(ext, "image/jpeg")

    try:
        runner = Runner(app=app_adk, session_service=session_service, auto_create_session=True)
        session_id = str(uuid.uuid4())
        
        new_message = types.Content(
            role="user",
            parts=[
                types.Part(inline_data=types.Blob(mime_type=mime_type, data=image_b64)),
                types.Part(text="Identify this medicine.")
            ]
        )
        
        # Run ADK pipeline
        async for event in runner.run_async(user_id="user1", session_id=session_id, new_message=new_message):
            pass
            
        session = await session_service.get_session(app_name="echorx_app", user_id="user1", session_id=session_id)
        state = session.state
        
        medicine_info = state.get("medicine_info", {})
        safety_info = state.get("safety_info", {})
        spoken_msg = state.get("spoken_message", "Could not generate voice message.")

        if isinstance(medicine_info, BaseModel): medicine_info = medicine_info.model_dump()
        if isinstance(safety_info, BaseModel): safety_info = safety_info.model_dump()
        if isinstance(spoken_msg, BaseModel): spoken_msg = str(spoken_msg.model_dump())
        elif isinstance(spoken_msg, dict): spoken_msg = str(spoken_msg)
        
        result = {
            "success":         True,
            "medicine_info":   medicine_info,
            "safety_info":     safety_info,
            "spoken_message":  spoken_msg,
        }

        print(f"\n✅ Complete: {medicine_info.get('medicine_name', 'Unknown')}")
        print(f"📢 Voice: {str(spoken_msg)[:80]}...")
        return result

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health():
    return {
        "status": "EchoRx API is running ✅",
        "agents": ["LabelSenseAgent", "SafetyGuardAgent", "VoiceAssistAgent"],
        "model": MODEL
    }

if __name__ == "__main__":
    print("\n🚀 EchoRx Backend Starting...")
    print("📡 API: http://localhost:8000")
    print("📋 Docs: http://localhost:8000/docs")
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
