from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import datetime
from typing import Optional, Dict, Any
from app.services import ai_gateway

router = APIRouter(prefix="/grievance", tags=["ingestion"])

# --- Incoming Channel Payloads ---
# Various channels can send widely different payload structures

class WebPayload(BaseModel):
    description: str
    lat: float
    lng: float
    attached_media_hash: Optional[str] = None

class WhatsAppPayload(BaseModel):
    wa_id: str
    body_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media_id: Optional[str] = None

class SMSPayload(BaseModel):
    sender_number: str
    msg_body: str
    tower_lat: float
    tower_lng: float

# --- Normalized Internal Schema ---
class NormalizedGrievanceTicket(BaseModel):
    timestamp: datetime.datetime
    geo_coordinates: Dict[str, float]
    media_hash: Optional[str]
    source_channel: str
    text_content: str
    is_emergency: bool = False
    ai_intent: Optional[Dict[str, Any]] = None

# --- Constants ---
EMERGENCY_KEYWORDS = ["live wire", "gas leak", "structural collapse", "fire", "emergency"]

def check_emergency_override(text: str) -> bool:
    """
    Enforces `emergency-override.md` Rule:
    Strict keyword spotting mapping against the normalized NLP context.
    """
    text_lower = text.lower()
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in text_lower:
            return True
    return False

# --- Core Ingestion Endpoint ---

@router.post("/intake", response_model=NormalizedGrievanceTicket)
async def omnichannel_intake(
    channel_type: str,
    payload: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    """
    Unified Ingestion API standardizing inbound arrays from Web, WhatsApp, and SMS 
    to drive the Zero-Friction data architecture.
    """
    normalized_data = NormalizedGrievanceTicket(
        timestamp=datetime.datetime.utcnow(),
        geo_coordinates={"lat": 0.0, "lng": 0.0},
        media_hash=None,
        source_channel=channel_type,
        text_content=""
    )

    # 1. Pipeline Normalization
    if channel_type == "web":
        web_data = WebPayload(**payload)
        normalized_data.text_content = web_data.description
        normalized_data.geo_coordinates = {"lat": web_data.lat, "lng": web_data.lng}
        normalized_data.media_hash = web_data.attached_media_hash

    elif channel_type == "whatsapp":
        wa_data = WhatsAppPayload(**payload)
        normalized_data.text_content = wa_data.body_text
        if wa_data.latitude and wa_data.longitude:
            normalized_data.geo_coordinates = {"lat": wa_data.latitude, "lng": wa_data.longitude}
        normalized_data.media_hash = wa_data.media_id

    elif channel_type == "sms":
        sms_data = SMSPayload(**payload)
        normalized_data.text_content = sms_data.msg_body
        normalized_data.geo_coordinates = {"lat": sms_data.tower_lat, "lng": sms_data.tower_lng}
    else:
        raise HTTPException(status_code=400, detail="Unknown source channel configuration.")

    # 2. Emergency Override Evaluation
    if check_emergency_override(normalized_data.text_content):
        normalized_data.is_emergency = True
        # NOTE: A real implementation would push a High-Priority pub/sub event immediately here
    
    # 3. AI Intent Mapping (Mock Executed inline for simplicity)
    intent = await ai_gateway.classify_intent(normalized_data.text_content)
    normalized_data.ai_intent = intent

    # Return the perfectly normalized JSON construct to signal successful ingestion
    return normalized_data

from fastapi import UploadFile, File, Form

@router.post("/intake/web", response_model=NormalizedGrievanceTicket)
async def web_intake_multipart(
    description: str = Form(""),
    lat: float = Form(0.0),
    lng: float = Form(0.0),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Dedicated endpoint for the Web PWA capturing raw device bytes 
    transmittable immediately into the Zero-Friction AI parsing matrix.
    """
    text_content = description

    # Handle asynchronous parsing of voice notes
    if audio_file:
        audio_bytes = await audio_file.read()
        text_content += " " + await ai_gateway.process_audio(audio_bytes)

    # Process CV images
    anomaly_data = None
    media_hash = None
    if image_file:
        image_bytes = await image_file.read()
        anomaly_data = await ai_gateway.analyze_image(image_bytes)
        # Assuming we store it and get a hash backward
        media_hash = "local_upload_" + image_file.filename
        
        # Override GPS if EXIF extracted coordinates confidently
        if anomaly_data.get("extracted_gps") and anomaly_data["extracted_gps"].get("lat"):
            lat = anomaly_data["extracted_gps"]["lat"]
            lng = anomaly_data["extracted_gps"]["lon"]

    # Now manually route this through the omni-intake normalizer explicitly formatted 
    payload = {
        "description": text_content.strip(),
        "lat": lat,
        "lng": lng,
        "attached_media_hash": media_hash
    }
    
    return await omnichannel_intake("web", payload, background_tasks)

@router.get("/tracking")
async def citizen_tracking_dashboard():
    """
    Rapid-latency fetch relying on Redis cache mapping for the e-commerce style tracker.
    Returns array of active and historic issues linked to the citizen's JWT.
    """
    # Mocking Redis response structures
    return {
        "complaints": [
            {
                "id": "GRV-2026-0891",
                "type": "Infrastructure",
                "description": "Deep pothole on Main Street causing traffic hazards.",
                "location": "Main Street, District 4",
                "status": "Officer Assigned",
                "progress": 50,
                "date": "2026-03-18",
            },
            {
                "id": "GRV-2026-0942",
                "type": "Sanitation",
                "description": "Garbage not collected for 3 days.",
                "location": "Oakwood Avenue, District 2",
                "status": "AI Routed",
                "progress": 25,
                "date": "2026-03-20",
            }
        ]
    }
