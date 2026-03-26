import os
import httpx
from fastapi import HTTPException
from app.models import GrievanceCategoryEnum

HUGGING_FACE_API_KEY = os.getenv("HUGGING_FACE_API_KEY")
BERT_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"

EMERGENCY_KEYWORDS = ["live wire", "gas leak", "structural collapse", "fire"]

def check_emergency_override(text: str) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in EMERGENCY_KEYWORDS)

async def categorize_grievance(text: str) -> dict:
    is_emergency = check_emergency_override(text)
    categories = [e.value for e in GrievanceCategoryEnum if e.value != 'OTHER']
    
    if not HUGGING_FACE_API_KEY:
        # Graceful fallback mock
        return {
            "category": GrievanceCategoryEnum.CIVIC_AMENITIES,
            "is_emergency": is_emergency,
            "confidence": 0.95
        }
        
    headers = {"Authorization": f"Bearer {HUGGING_FACE_API_KEY}"}
    payload = {
        "inputs": text,
        "parameters": {"candidate_labels": categories}
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(BERT_API_URL, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            result = response.json()
            
            best_cat = result.get("labels", ["OTHER"])[0]
            confidence = result.get("scores", [0.0])[0]
            
            try:
                mapped_category = GrievanceCategoryEnum(best_cat)
            except ValueError:
                mapped_category = GrievanceCategoryEnum.OTHER
                
            return {
                "category": mapped_category,
                "is_emergency": is_emergency,
                "confidence": confidence
            }
        except httpx.HTTPError as e:
             raise HTTPException(status_code=500, detail=f"NLP API error: {str(e)}")
