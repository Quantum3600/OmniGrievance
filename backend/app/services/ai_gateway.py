import os
import httpx
from typing import Dict, Any
import logging
import asyncio

logger = logging.getLogger("OmniGrievance.AIGateway")

async def process_audio(file_bytes: bytes) -> str:
    """
    Calls Bhashini/Whisper API to transcribe vernacular dialect audio streams 
    into standardized English NLP text.
    """
    if os.getenv("USE_MOCK_APIS", "").lower() == "true":
        await asyncio.sleep(0.5)
        return "This is a transcribed English sentence extracted from the vernacular audio. (MOCKED FROM AUDIO)"

    bhashini_url = os.getenv("BHASHINI_API_URL")
    api_key = os.getenv("BHASHINI_API_KEY")

    if not bhashini_url:
        logger.warning("BHASHINI_API_URL not configured. Returning fallback.")
        return "This is a transcribed English sentence extracted from the vernacular audio."

    try:
        async with httpx.AsyncClient() as client:
            files = {'file': ('audio.wav', file_bytes, 'audio/wav')}
            headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
            response = await client.post(bhashini_url, files=files, headers=headers, timeout=15.0)
            response.raise_for_status()
            data = response.json()
            return data.get("transcription", "")
    except Exception as e:
        logger.error(f"Error calling Bhashini API: {e}")
        return "Transcription failed due to service error."

async def analyze_image(file_bytes: bytes) -> Dict[str, Any]:
    """
    Calls BLIP-2 computer vision service to check for visual anomalies/fake images 
    and extracting critical EXIF GPS arrays to validate citizen location data.
    """
    if os.getenv("USE_MOCK_APIS", "").lower() == "true":
        await asyncio.sleep(0.8)
        return {
            "is_fake": False,
            "extracted_gps": {"lat": 28.6139, "lon": 77.2090},
            "labels": ["pothole", "street", "damage", "MOCK_AI"],
            "confidence_score": 0.94
        }
        
    blip2_url = os.getenv("BLIP2_API_URL")
    if not blip2_url:
        logger.warning("BLIP2_API_URL not configured. Returning fallback.")
        return {
            "is_fake": False,
            "extracted_gps": {"lat": 28.6139, "lon": 77.2090},
            "labels": ["pothole", "street", "damage"],
            "confidence_score": 0.94
        }

    try:
        async with httpx.AsyncClient() as client:
            files = {'image': ('image.jpg', file_bytes, 'image/jpeg')}
            response = await client.post(blip2_url, files=files, timeout=20.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error calling BLIP-2 service: {e}")
        return {"is_fake": False, "extracted_gps": {}, "labels": [], "confidence_score": 0.0}

async def classify_intent(text: str) -> Dict[str, Any]:
    """
    Calls BERT service to transform raw textual descriptions into actionable 
    system categorical tags mapping directly to internal Departments.
    """
    if os.getenv("USE_MOCK_APIS", "").lower() == "true":
        text_lower = text.lower()
        await asyncio.sleep(0.3)
        if "water" in text_lower or "river" in text_lower or "pipe" in text_lower:
            return {"category": "Water Supply (MOCK)", "priority": "High"}
        if "pothole" in text_lower or "road" in text_lower or "street" in text_lower:
            return {"category": "Public Works (MOCK)", "priority": "Medium"}
        return {"category": "General Sanitation (MOCK)", "priority": "Low"}

    bert_url = os.getenv("BERT_API_URL")
    if not bert_url:
        logger.warning("BERT_API_URL not configured. Returning fallback.")
        text_lower = text.lower()
        if "water" in text_lower or "river" in text_lower or "pipe" in text_lower:
            return {"category": "Water Supply", "priority": "High"}
        if "pothole" in text_lower or "road" in text_lower or "street" in text_lower:
            return {"category": "Public Works", "priority": "Medium"}
        return {"category": "General Sanitation", "priority": "Low"}

    try:
        async with httpx.AsyncClient() as client:
            payload = {"text": text}
            response = await client.post(bert_url, json=payload, timeout=10.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Error calling BERT service: {e}")
        return {"category": "General Sanitation", "priority": "Low"}
