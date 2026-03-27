from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query, BackgroundTasks, Response, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import os
import datetime
import logging
import re
import uuid
import json
import asyncio
import aiofiles

from app.database import get_db, AsyncSessionLocal
from app.models import User, RoleEnum, Grievance, GrievanceStatusEnum, GrievanceCategoryEnum
from app.api.auth import get_current_user, redis_client
from app.services import ai_gateway
from app.services.communications import process_whatsapp_message

logger = logging.getLogger("OmniGrievance.Ingestion")

def _detect_language(text: str) -> str:
    devanagari = len(re.findall(r'[\u0900-\u097F]', text))
    latin = len(re.findall(r'[a-zA-Z]', text))
    return "hi" if devanagari > latin else "en"

router = APIRouter(prefix="/api/v1/ingest", tags=["Ingestion"])

# Global State for WebSockets
ingestion_tasks = {}

async def process_multimodal_task(task_id: str, user_id: int, user_phone: str, final_text: str, audio_bytes: bytes, image_bytes: bytes, gps_lat: float, gps_lng: float, audio_url: str, image_url: str):
    try:
        async with AsyncSessionLocal() as db:
            if audio_bytes:
                ingestion_tasks[task_id] = {"stage": "transcribing"}
                transcription = await ai_gateway.process_audio(audio_bytes)
                final_text = f"{final_text} {transcription}".strip()

            image_context = ""
            if image_bytes:
                ingestion_tasks[task_id] = {"stage": "classifying"}
                vision_result = await ai_gateway.analyze_image(image_bytes)
                image_context = ", ".join(vision_result.get("labels", []))
                if vision_result.get("extracted_gps", {}).get("lat"):
                    gps_lat = vision_result["extracted_gps"]["lat"]
                    gps_lng = vision_result["extracted_gps"]["lon"]
                final_text = f"{final_text}. Image context: {image_context}".strip()

            if not audio_bytes and not image_bytes:
                ingestion_tasks[task_id] = {"stage": "classifying"}
                
            nlp_result = await ai_gateway.classify_intent(final_text)
            category_str = nlp_result["category"]
            priority = nlp_result.get("priority", "Low")
            
            EMERGENCY_KEYWORDS_LOCAL = ["live wire", "gas leak", "structural collapse", "fire", "building collapse"]
            is_emergency = priority == "High" or any(kw in final_text.lower() for kw in EMERGENCY_KEYWORDS_LOCAL)

            try:
                category_enum = GrievanceCategoryEnum(category_str)
            except ValueError:
                category_enum = GrievanceCategoryEnum.OTHER

            ingestion_tasks[task_id] = {"stage": "routing"}
            
            new_grievance = Grievance(
                citizen_id=user_id, description=final_text, category=category_enum,
                is_emergency=is_emergency, location_lat=gps_lat, location_lng=gps_lng,
                audio_url=audio_url, image_url=image_url, status=GrievanceStatusEnum.POSTED
            )
            db.add(new_grievance)
            await db.commit()
            await db.refresh(new_grievance)

            employee_query = await db.execute(select(User).where(User.role == RoleEnum.EMPLOYEE, User.department_category == category_enum))
            employees = employee_query.scalars().all()
            assigned_employee_id = None
            if employees:
                assigned_employee = employees[0]
                new_grievance.assigned_employees.append(assigned_employee)
                new_grievance.status = GrievanceStatusEnum.ASSIGNED
                assigned_employee_id = assigned_employee.id
                await db.commit()

            detected_lang = _detect_language(final_text)
            translated_text = f"[Auto-translated from Hindi] {final_text}" if detected_lang != "en" else None

            if user_phone:
                await redis_client.delete(f"wa_session:{user_phone}")

            ingestion_tasks[task_id] = {
                "stage": "done",
                "result": {
                    "status": "success", "grievance_id": new_grievance.id, "is_emergency": is_emergency,
                    "category": category_enum.value, "priority": priority, "ai_labels": image_context.split(", ") if image_context else [],
                    "transcription": final_text if audio_bytes else None, "detected_language": detected_lang,
                    "translated_text": translated_text, "description_summary": final_text[:120] + "…" if len(final_text) > 120 else final_text,
                    "assigned_employee_id": assigned_employee_id, "auto_routed": assigned_employee_id is not None
                }
            }
            
    except Exception as e:
        logger.error(f"Task {task_id} Failed: {e}")
        ingestion_tasks[task_id] = {"stage": "error", "message": "Failed to process grievance."}

@router.post("/multimodal")
async def ingest_multimodal(
    background_tasks: BackgroundTasks, text_description: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None), image_file: Optional[UploadFile] = File(None),
    lat: Optional[float] = Form(None), lng: Optional[float] = Form(None), current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Only citizens can submit grievances.")
    if not text_description and not audio_file:
        raise HTTPException(status_code=400, detail="Must provide either text or audio.")

    task_id = str(uuid.uuid4())
    ingestion_tasks[task_id] = {"stage": "uploading"}

    os.makedirs("uploads/audio", exist_ok=True)
    os.makedirs("uploads/images", exist_ok=True)

    audio_bytes, image_bytes = None, None
    audio_url, image_url = None, None

    if audio_file:
        audio_bytes = await audio_file.read()
        audio_filename = f"{datetime.datetime.now().timestamp()}_{audio_file.filename}"
        audio_path = os.path.join("uploads/audio", audio_filename)
        async with aiofiles.open(audio_path, "wb") as f:
            await f.write(audio_bytes)
        audio_url = f"/uploads/audio/{audio_filename}"

    if image_file:
        await image_file.seek(0)
        image_bytes = await image_file.read()
        image_filename = f"{datetime.datetime.now().timestamp()}_{image_file.filename}"
        image_path = os.path.join("uploads/images", image_filename)
        async with aiofiles.open(image_path, "wb") as f:
            await f.write(image_bytes)
        image_url = f"/uploads/images/{image_filename}"

    background_tasks.add_task(
        process_multimodal_task, task_id=task_id, user_id=current_user.id, user_phone=current_user.phone,
        final_text=text_description or "", audio_bytes=audio_bytes, image_bytes=image_bytes,
        gps_lat=lat, gps_lng=lng, audio_url=audio_url, image_url=image_url
    )

    return {"status": "processing", "task_id": task_id}

@router.websocket("/ws/status/{task_id}")
async def websocket_status(websocket: WebSocket, task_id: str):
    await websocket.accept()
    try:
        while True:
            current_state = ingestion_tasks.get(task_id, {"stage": "uploading"})
            await websocket.send_text(json.dumps(current_state))
            if current_state.get("stage") in ["done", "error"]:
                await asyncio.sleep(1)
                ingestion_tasks.pop(task_id, None)
                break
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from WS for task {task_id}")
    except Exception as e:
        logger.warning(f"WS Error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass

@router.get("/whatsapp/webhook")
async def verify_whatsapp_webhook(hub_mode: str = Query(None, alias="hub.mode"), hub_challenge: str = Query(None, alias="hub.challenge"), hub_verify_token: str = Query(None, alias="hub.verify_token")):
    expected_token = os.getenv("WHATSAPP_VERIFY_TOKEN")
    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/whatsapp/webhook")
async def receive_whatsapp_webhook(payload: dict, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    background_tasks.add_task(process_whatsapp_message, payload, db)
    return {"status": "ok"}