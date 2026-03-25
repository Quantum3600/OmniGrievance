import os
import httpx
import logging

logger = logging.getLogger("OmniGrievance.AudioProcessing")

async def transcribe_audio(file_bytes: bytes) -> str:
    """
    Calls OpenAI Whisper API to transcribe vernacular audio streams
    into standardized text. Used to replace mocked functions.
    """
    api_key = os.getenv("WHISPER_API_KEY")

    if not api_key:
        logger.warning("WHISPER_API_KEY not configured. Falling back to mocked transcription.")
        return "This is a transcribed English sentence extracted from the vernacular audio. (MOCKED FROM AUDIO)"

    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {api_key}"}
            # Specify the model and the file format standard. Use a general filename to bypass validation.
            files = {
                'file': ('audio.wav', file_bytes, 'audio/wav'),
            }
            data = {"model": "whisper-1"}
            
            response = await client.post(
                "https://api.openai.com/v1/audio/transcriptions", 
                files=files, 
                data=data,
                headers=headers, 
                timeout=20.0
            )
            response.raise_for_status()
            response_json = response.json()
            return response_json.get("text", "")
            
    except Exception as e:
        logger.error(f"Error calling Whisper API: {e}")
        return "Transcription failed due to service error."
