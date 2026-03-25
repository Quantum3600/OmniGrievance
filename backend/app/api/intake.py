from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Header, UploadFile, File, Form
from pydantic import BaseModel, Field
import datetime
from typing import Optional, Dict, Any
import base64
import json

from app.services import audio_processing, vision_processing, nlp_processing

router = APIRouter(prefix="/grievance", tags=["ingestion"])

# --- RBAC Dependency Enforcement --- 
def verify_citizen_role(authorization: str = Header(None)) -> Dict[str, Any]:
    """Ensures that only logged in CITIZENs can create grievances."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication token")
    
    token = authorization.split(" ")[1]
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError()
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload = json.loads(base64.b64decode(payload_b64).decode())
        
        # Rule: Citizen can only create tickets
        if payload.get("role") != "CITIZEN":
            raise HTTPException(status_code=403, detail="RBAC Violation: Only CITIZENs can ingest new grievances.")
        return payload
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=401, detail="Invalid token payload")

# --- Incoming Channel Payloads ---
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

# --- Core Ingestion Endpoint ---

@router.post("/intake", response_model=NormalizedGrievanceTicket)
async def omnichannel_intake(
    channel_type: str,
    payload: Dict[str, Any],
    background_tasks: BackgroundTasks,
    user: Dict[str, Any] = Depends(verify_citizen_role)
):
    """
    Unified Ingestion API standardizing inbound arrays from Web, WhatsApp, and SMS.
    """
    normalized_data = NormalizedGrievanceTicket(
        timestamp=datetime.datetime.utcnow(),
        geo_coordinates={"lat": 0.0, "lng": 0.0},
        media_hash=None,
        source_channel=channel_type,
        text_content=""
    )

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

    # Apply intent mapping and check emergency override
    intent = await nlp_processing.classify_intent(normalized_data.text_content)
    normalized_data.ai_intent = intent
    normalized_data.is_emergency = intent.get("is_emergency", False)

    return normalized_data

@router.post("/intake/web", response_model=NormalizedGrievanceTicket)
async def web_intake_multipart(
    description: str = Form(""),
    lat: float = Form(0.0),
    lng: float = Form(0.0),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    user: Dict[str, Any] = Depends(verify_citizen_role)
):
    """
    Dedicated endpoint for the Web PWA capturing raw device bytes 
    transmittable immediately into the Zero-Friction AI parsing matrix.
    """
    text_content = description

    if audio_file:
        audio_bytes = await audio_file.read()
        transcription = await audio_processing.transcribe_audio(audio_bytes)
        text_content += f" [Audio Transcript]: {transcription}"

    media_hash = None
    if image_file:
        image_bytes = await image_file.read()
        anomaly_data = await vision_processing.analyze_image(image_bytes, image_file.filename)
        media_hash = "local_upload_" + image_file.filename
        
        if anomaly_data.get("extracted_gps") and anomaly_data["extracted_gps"].get("lat"):
            lat = anomaly_data["extracted_gps"]["lat"]
            lng = anomaly_data["extracted_gps"]["lon"]
            
        if anomaly_data.get("labels"):
            text_content += f" [Visual Context]: {anomaly_data['context']} Labels: {', '.join(anomaly_data['labels'])}"

    payload = {
        "description": text_content.strip(),
        "lat": lat,
        "lng": lng,
        "attached_media_hash": media_hash
    }
    
    return await omnichannel_intake("web", payload, background_tasks, user=user)

@router.get("/tracking")
async def citizen_tracking_dashboard(user: Dict[str, Any] = Depends(verify_citizen_role)):
    """
    Rapid-latency fetch relying on Redis cache mapping for the e-commerce style tracker.
    Returns array of active and historic issues linked to the citizen's JWT.
    """
    # Mocking Redis response structures - isolated to user's ID
    return {
        "user_phone": user.get("sub"),
        "role_verified": user.get("role"),
        "complaints": [
            {
                "id": "GRV-2026-0891",
                "type": "Infrastructure",
                "description": "Deep pothole on Main Street causing traffic hazards.",
                "location": "Main Street, District 4",
                "status": "Officer Assigned",
                "progress": 50,
                "date": "2026-03-18",
            }
        ]
    }
