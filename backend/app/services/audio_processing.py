import os
import httpx
from fastapi import UploadFile, HTTPException

WHISPER_API_KEY = os.getenv("WHISPER_API_KEY")
WHISPER_API_URL = "https://api.openai.com/v1/audio/transcriptions"

async def transcribe_audio(file: UploadFile) -> str:
    if not WHISPER_API_KEY:
        # Fallback to mock for testing if no key is provided
        return "This is a mock transcription of the regional dialect."
    
    headers = {"Authorization": f"Bearer {WHISPER_API_KEY}"}
    
    # Reset file pointer just in case it was read before
    await file.seek(0)
    file_bytes = await file.read()
    
    files = {"file": (file.filename, file_bytes, file.content_type)}
    data = {"model": "whisper-1"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(WHISPER_API_URL, headers=headers, files=files, data=data, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            return result.get("text", "")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Whisper API error: {str(e)}")
