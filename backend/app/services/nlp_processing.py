import os
import httpx
import logging
from typing import Dict, Any

logger = logging.getLogger("OmniGrievance.NLPProcessing")

# --- Emergency Triage Rule --- 
EMERGENCY_KEYWORDS = [
    "live wire", 
    "gas leak", 
    "structural collapse", 
    "fire", 
    "emergency"
]

def check_emergency_override(text: str) -> bool:
    """Enforces `emergency-override.md` Rule"""
    text_lower = text.lower()
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in text_lower:
            return True
    return False

async def classify_intent(text: str) -> Dict[str, Any]:
    """
    Calls a BERT-based text classifier via Hugging Face to identify the 
    underlying intent and department routing category for a grievance.
    """
    is_emergency = check_emergency_override(text)
    
    api_key = os.getenv("HUGGING_FACE_API_KEY")
    
    if not api_key:
        logger.warning("HUGGING_FACE_API_KEY not configured. Returning fallback categories.")
        category = "General Sanitation (MOCK)"
        text_lower = text.lower()
        if "water" in text_lower or "river" in text_lower or "pipe" in text_lower:
            category = "Water Supply (MOCK)"
        if "pothole" in text_lower or "road" in text_lower or "street" in text_lower:
            category = "Public Works (MOCK)"
            
        return {
            "category": category, 
            "priority": "Critical" if is_emergency else "Medium",
            "is_emergency": is_emergency
        }

    # Leveraging zero-shot classification model BART-large-mnli
    model_url = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {api_key}"}
            payload = {
                "inputs": text,
                "parameters": {
                    "candidate_labels": [
                        "Water Supply", 
                        "Public Works", 
                        "Sanitation", 
                        "Electricity", 
                        "Public Safety"
                    ]
                }
            }
            response = await client.post(model_url, json=payload, headers=headers, timeout=15.0)
            
            if response.status_code == 503:
                # Model is loading
                logger.error("Hugging Face NLP model is currently loading. Returning fallback.")
                return {"category": "Sanitation", "priority": "Critical" if is_emergency else "Medium", "is_emergency": is_emergency}
                
            response.raise_for_status()
            data = response.json()
            
            category = "General Handling"
            if "labels" in data and len(data["labels"]) > 0:
                category = data["labels"][0]
                
            return {
                "category": category,
                "priority": "Critical" if is_emergency else "Standard",
                "is_emergency": is_emergency
            }
            
    except Exception as e:
        logger.error(f"Error calling BERT service: {e}")
        return {
            "category": "General Sanitation", 
            "priority": "Critical" if is_emergency else "Standard",
            "is_emergency": is_emergency
        }
