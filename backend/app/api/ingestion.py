from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query, BackgroundTasks, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import os
import datetime
import logging
import re

# ─── All app imports MUST come first before any helper functions ───────────────
from app.database import get_db
from app.models import User, RoleEnum, Grievance, GrievanceStatusEnum, GrievanceCategoryEnum
from app.api.auth import get_current_user, redis_client
from app.services import ai_gateway
from app.services.communications import process_whatsapp_message

logger = logging.getLogger("OmniGrievance.Ingestion")

# ─── Simple Heuristic Language Detector (no external deps) ───────────────────
def _detect_language(text: str) -> str:
    """Heuristic detection of Hindi/regional vs English based on character ranges."""
    devanagari = len(re.findall(r'[\u0900-\u097F]', text))
    latin = len(re.findall(r'[a-zA-Z]', text))
    if devanagari > latin:
        return "hi"   # Hindi
    return "en"       # English / default

router = APIRouter(
    prefix="/api/v1/ingest",
    tags=["Ingestion"]
)

@router.post("/multimodal")
async def ingest_multimodal(
    text_description: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Only citizens can submit grievances.")
        
    if not text_description and not audio_file:
        raise HTTPException(status_code=400, detail="Must provide either text description or audio file.")

    final_text = text_description or ""
    
    gps_lat, gps_lng = lat, lng
    image_context = ""
    image_url = None
    audio_url = None
    
    # Ensure upload directories exist
    os.makedirs("uploads/audio", exist_ok=True)
    os.makedirs("uploads/images", exist_ok=True)

    if audio_file:
        audio_bytes = await audio_file.read()
        # Save audio file
        audio_filename = f"{datetime.datetime.now().timestamp()}_{audio_file.filename}"
        audio_path = os.path.join("uploads/audio", audio_filename)
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)
        audio_url = f"/uploads/audio/{audio_filename}"
        
        transcription = await ai_gateway.process_audio(audio_bytes)
        final_text = f"{final_text} {transcription}".strip()

    if image_file:
        await image_file.seek(0)
        image_bytes = await image_file.read()
        # Save image file
        image_filename = f"{datetime.datetime.now().timestamp()}_{image_file.filename}"
        image_path = os.path.join("uploads/images", image_filename)
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        image_url = f"/uploads/images/{image_filename}"
        
        vision_result = await ai_gateway.analyze_image(image_bytes)
        image_context = ", ".join(vision_result.get("labels", []))
        if vision_result.get("extracted_gps", {}).get("lat"):
            gps_lat = vision_result["extracted_gps"]["lat"]
            gps_lng = vision_result["extracted_gps"]["lon"]
            
        final_text = f"{final_text}. Image context: {image_context}".strip()

    # Analyze intent and categorize using BERT / keyword fallback
    nlp_result = await ai_gateway.classify_intent(final_text)
    # category is always a plain string from ai_gateway now
    category_str: str = nlp_result["category"]
    priority: str = nlp_result.get("priority", "Low")
    EMERGENCY_KEYWORDS_LOCAL = ["live wire", "gas leak", "structural collapse", "fire", "building collapse"]
    is_emergency = priority == "High" or any(kw in final_text.lower() for kw in EMERGENCY_KEYWORDS_LOCAL)

    # Convert string to GrievanceCategoryEnum for DB storage
    try:
        category_enum = GrievanceCategoryEnum(category_str)
    except ValueError:
        category_enum = GrievanceCategoryEnum.OTHER

    # Create the grievance matching the DB Model
    new_grievance = Grievance(
        citizen_id=current_user.id,
        description=final_text,
        category=category_enum,
        is_emergency=is_emergency,
        location_lat=gps_lat,
        location_lng=gps_lng,
        audio_url=audio_url,
        image_url=image_url,
        status=GrievanceStatusEnum.POSTED
    )
    db.add(new_grievance)
    await db.commit()
    await db.refresh(new_grievance)

    # Auto-assign based on AI category
    employee_query = await db.execute(
        select(User).where(User.role == RoleEnum.EMPLOYEE, User.department_category == category_enum)
    )
    employees = employee_query.scalars().all()
    assigned_employee_id = None
    if employees:
        assigned_employee = employees[0]
        new_grievance.assigned_employees.append(assigned_employee)
        new_grievance.status = GrievanceStatusEnum.ASSIGNED
        assigned_employee_id = assigned_employee.id
        await db.commit()

    # Language detection & mock translation
    detected_lang = _detect_language(final_text)
    translated_text = None
    if detected_lang != "en":
        translated_text = f"[Auto-translated from Hindi] {final_text}"

    # NEW: Wipe any active Redis WhatsApp session for this user after successful web submission
    if current_user.phone:
        await redis_client.delete(f"wa_session:{current_user.phone}")

    return {
        "status": "success",
        "grievance_id": new_grievance.id,
        "is_emergency": is_emergency,
        "category": category_enum.value,
        "priority": priority,
        "ai_labels": image_context.split(", ") if image_context else [],
        "transcription": final_text if audio_file else None,
        "detected_language": detected_lang,
        "translated_text": translated_text,
        "description_summary": final_text[:120] + "…" if len(final_text) > 120 else final_text,
        "assigned_employee_id": assigned_employee_id,
        "auto_routed": assigned_employee_id is not None
    }

@router.get("/whatsapp/webhook")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
    hub_verify_token: str = Query(None, alias="hub.verify_token")
):
    expected_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    logger.info(f"Webhook Verify Request: mode={hub_mode}, token_match={hub_verify_token == expected_token}")
    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/whatsapp/webhook")
async def receive_whatsapp_webhook(
    payload: dict,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    background_tasks.add_task(process_whatsapp_message, payload, db)
    return {"status": "ok"}
