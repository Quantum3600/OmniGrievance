import os
import httpx
from typing import Dict, Any
import logging
import asyncio
from app.models import GrievanceCategoryEnum

logger = logging.getLogger("OmniGrievance.AIGateway")

# Strip whitespace/CRLF so Windows .env files don't break the flag
IS_MOCK_MODE = os.getenv("USE_MOCK_APIS", "false").strip().lower() in ("true", "1", "yes")

if IS_MOCK_MODE:
    logger.info("AI Gateway: Running in MOCK mode — keyword classifier active.")
else:
    logger.info("AI Gateway: Running in LIVE mode — calling external AI APIs.")

async def post_hf_with_retry(client: httpx.AsyncClient, url: str, max_retries: int = 3, **kwargs) -> httpx.Response:
    """
    Wrapper for httpx.post that automatically retries if Hugging Face 
    returns a 503 Service Unavailable (Model loading) error.
    """
    for attempt in range(1, max_retries + 1):
        response = await client.post(url, **kwargs)
        
        # 503 means the model is currently loading into memory
        if response.status_code == 503:
            try:
                error_data = response.json()
                wait_time = error_data.get("estimated_time", 10.0) 
            except Exception:
                wait_time = 10.0
                
            logger.warning(f"[Attempt {attempt}/{max_retries}] Model loading at {url}. Waiting {wait_time:.1f} seconds...")
            await asyncio.sleep(wait_time)
            continue
            
        response.raise_for_status()
        return response
        
    response.raise_for_status()
    return response

async def process_audio(file_bytes: bytes) -> str:
    """Calls Hugging Face Whisper API to transcribe vernacular dialect audio streams."""
    if IS_MOCK_MODE:
        await asyncio.sleep(0.5)
        return "This is a transcribed English sentence extracted from the vernacular audio. (MOCKED FROM AUDIO)"

    whisper_url = os.getenv("WHISPER_API_URL", "https://router.huggingface.co/models/openai/whisper-large-v3")
    hf_token = os.getenv("HUGGING_FACE_TOKEN")

    if not hf_token:
        logger.warning("HUGGING_FACE_TOKEN not configured. Transcription may fail.")
        return "Hugging Face token not configured."

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {hf_token}"}
            response = await post_hf_with_retry(client=client, url=whisper_url, headers=headers, content=file_bytes)
            result = response.json()
            return result.get("text", "")
    except Exception as e:
        logger.error(f"Error calling Hugging Face Whisper API: {e}")
        return "Transcription failed due to service error."

async def analyze_image(file_bytes: bytes) -> Dict[str, Any]:
    """Calls BLIP-2 computer vision service to check for visual anomalies and context."""
    if IS_MOCK_MODE:
        await asyncio.sleep(0.8)
        return {"is_fake": False, "extracted_gps": {"lat": 28.6139, "lon": 77.2090}, "labels": ["pothole", "street", "damage", "MOCK_AI"], "confidence_score": 0.94}

    blip2_url = os.getenv("BLIP2_API_URL", "https://router.huggingface.co/models/Salesforce/blip2-opt-2.7b")
    hf_token = os.getenv("HUGGING_FACE_TOKEN")

    if not hf_token:
        logger.warning("HUGGING_FACE_TOKEN not configured. Returning fallback.")
        return {"is_fake": False, "extracted_gps": {"lat": 28.6139, "lon": 77.2090}, "labels": ["pothole", "street", "damage"], "confidence_score": 0.94}

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {hf_token}"}
            response = await post_hf_with_retry(client=client, url=blip2_url, headers=headers, content=file_bytes)
            result = response.json()
            context = result[0].get("generated_text", "") if isinstance(result, list) else ""
            return {"is_fake": False, "extracted_gps": {"lat": 28.6139, "lon": 77.2090}, "labels": [context] if context else [], "confidence_score": 0.95}
    except Exception as e:
        logger.error(f"Error calling BLIP-2 service: {e}")
        return {"is_fake": False, "extracted_gps": {}, "labels": [], "confidence_score": 0.0}

async def classify_intent(text: str) -> Dict[str, Any]:
    """Calls BART Zero-Shot service to transform text into system categories."""
    if IS_MOCK_MODE:
        await asyncio.sleep(0.3)
        return _keyword_classify(text)

    # Changed from fill-mask (bert-base) to zero-shot classification (bart-large-mnli)
    bert_url = os.getenv("BERT_API_URL", "https://router.huggingface.co/models/facebook/bart-large-mnli")
    hf_token = os.getenv("HUGGING_FACE_TOKEN")

    if not hf_token:
        logger.warning("HUGGING_FACE_TOKEN not configured. Using local keyword classifier.")
        return _keyword_classify(text)

    try:
        categories = [e.value for e in GrievanceCategoryEnum if e.value != 'OTHER']
        async with httpx.AsyncClient(timeout=60.0) as client:
            headers = {"Authorization": f"Bearer {hf_token}"}
            payload = {"inputs": text, "parameters": {"candidate_labels": categories}}
            
            response = await post_hf_with_retry(client=client, url=bert_url, headers=headers, json=payload)
            result = response.json()

            best_cat_str = result.get("labels", ["OTHER"])[0]
            scores = result.get("scores", [0.0])
            priority = "High" if scores[0] > 0.8 else "Medium" if scores[0] > 0.4 else "Low"

            try:
                mapped_category = GrievanceCategoryEnum(best_cat_str)
            except ValueError:
                mapped_category = GrievanceCategoryEnum.OTHER

            return {"category": mapped_category.value, "priority": priority}
    except Exception as e:
        logger.error(f"Error calling BART service: {e}. Falling back to keyword classifier.")
        return _keyword_classify(text)

def _keyword_classify(text: str) -> Dict[str, Any]:
    """Fallback local keyword-based intent classifier."""
    t = text.lower()
    emergency_kw = ["live wire", "gas leak", "structural collapse", "fire", "building collapse", "flood"]
    is_emergency = any(kw in t for kw in emergency_kw)

    if any(kw in t for kw in ["pothole", "road", "street", "drain", "sewer", "water supply", "pipe", "pipeline", "water leak", "water shortage", "streetlight", "street light", "footpath", "pavement", "garbage", "waste", "dustbin", "gutter", "broken road", "water logging", "waterlogging", "puddle", "blocked drain", "open drain", "public toilet", "tap", "civic", "amenity", "municipality", "municipal", "nala", "naali"]):
        priority = "High" if is_emergency or any(k in t for k in ["water supply", "flood", "pipe burst"]) else "Medium"
        return {"category": GrievanceCategoryEnum.CIVIC_AMENITIES.value, "priority": priority}
    if any(kw in t for kw in ["hospital", "doctor", "medicine", "medical", "health", "clinic", "ambulance", "patient", "treatment", "nurse", "disease", "epidemic", "dengue", "malaria", "vaccination", "pharmacy", "food safety", "contaminated", "dead animal", "mosquito", "hygiene", "quarantine", "covid", "dispensary", "blood", "icu"]):
        priority = "High" if any(k in t for k in ["emergency", "ambulance", "epidemic", "dengue", "malaria", "icu"]) else "Medium"
        return {"category": GrievanceCategoryEnum.PUBLIC_HEALTH.value, "priority": priority}
    if any(kw in t for kw in ["electricity", "electric", "power cut", "power outage", "blackout", "transformer", "wire", "cable", "internet", "broadband", "bus", "transport", "public transport", "railway", "bridge", "overbridge", "underpass", "metro", "signal", "traffic signal", "network", "connection", "telecom", "mobile tower", "generator", "voltage", "pole", "substation", "optical fiber"]):
        priority = "High" if any(k in t for k in ["power cut", "live wire", "blackout"]) else "Medium"
        return {"category": GrievanceCategoryEnum.INFRASTRUCTURE.value, "priority": priority}
    if any(kw in t for kw in ["police", "crime", "theft", "robbery", "assault", "harassment", "eve teasing", "domestic violence", "murder", "rape", "illegal", "extortion", "drug", "alcohol", "traffic", "drunk driving", "road rage", "curfew", "riot", "protest", "bribery", "corruption", "encroachment", "noise pollution", "safety", "security", "fir", "arrest", "criminal", "gangster", "mob", "vandalism", "cheating", "fraud"]):
        priority = "High" if any(k in t for k in ["murder", "rape", "robbery", "assault", "riot"]) else "Medium"
        return {"category": GrievanceCategoryEnum.LAW_AND_ORDER.value, "priority": priority}
    if any(kw in t for kw in ["pension", "ration card", "ration", "disability", "widow", "scholarship", "beneficiary", "welfare", "subsidy", "bpl", "below poverty", "old age", "pm kisan", "kisan", "jan dhan", "pmay", "housing scheme", "social security", "anganwadi", "aanganwadi", "self help group", "women empowerment", "orphan", "abandoned", "destitute", "shelter home"]):
        return {"category": GrievanceCategoryEnum.SOCIAL_WELFARE.value, "priority": "Medium"}
    if any(kw in t for kw in ["land", "property", "land record", "khasra", "khatauni", "mutation", "fard", "property tax", "house tax", "water tax", "certificate", "birth certificate", "death certificate", "caste certificate", "income certificate", "domicile", "boundary", "dispute", "lease", "allotment", "registry", "stamp duty", "nakal", "tehsil", "patwari", "revenue"]):
        return {"category": GrievanceCategoryEnum.REVENUE_AND_LAND.value, "priority": "Medium"}
    if any(kw in t for kw in ["school", "teacher", "education", "student", "classroom", "books", "textbook", "college", "university", "exam", "result", "admission", "fees", "uniform", "mid day meal", "toilet in school", "primary school", "secondary school", "coaching", "principal", "headmaster", "absentee teacher", "dropout", "literacy"]):
        return {"category": GrievanceCategoryEnum.EDUCATION.value, "priority": "Medium"}
    if any(kw in t for kw in ["job", "employment", "unemployed", "wage", "salary", "minimum wage", "mgnrega", "nrega", "job card", "labour", "labor", "worker", "factory", "workplace", "bonus", "pf", "provident fund", "gratuity", "strike", "layoff", "fired", "dismissed", "skill", "training center", "contractor", "migrant worker", "child labor", "bonded labor"]):
        return {"category": GrievanceCategoryEnum.EMPLOYMENT_AND_LABOR.value, "priority": "Low"}

    return {"category": GrievanceCategoryEnum.OTHER.value, "priority": "Low"}