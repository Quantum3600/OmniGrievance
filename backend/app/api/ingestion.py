from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.models import User, RoleEnum, Grievance, GrievanceStatusEnum
from app.api.auth import get_current_user
from app.services.audio_processing import transcribe_audio
from app.services.vision_processing import analyze_image
from app.services.nlp_processing import categorize_grievance

router = APIRouter(
    prefix="/api/v1/ingest",
    tags=["Ingestion"]
)

@router.post("/multimodal")
async def ingest_multimodal(
    text_description: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Only citizens can submit grievances.")
        
    if not text_description and not audio_file:
        raise HTTPException(status_code=400, detail="Must provide either text description or audio file.")

    final_text = text_description or ""
    
    if audio_file:
        transcription = await transcribe_audio(audio_file)
        final_text = f"{final_text} {transcription}".strip()

    gps_lat, gps_lng = None, None
    image_context = ""
    
    if image_file:
        vision_result = await analyze_image(image_file)
        image_context = vision_result["context"]
        if vision_result["gps"].get("lat"):
            gps_lat = vision_result["gps"]["lat"]
            gps_lng = vision_result["gps"]["lng"]
            
        final_text = f"{final_text}. Image context: {image_context}".strip()

    # Analyze intent and categorize using BERT
    nlp_result = await categorize_grievance(final_text)
    category = nlp_result["category"]
    is_emergency = nlp_result["is_emergency"]

    # Create the grievance matching the DB Model
    new_grievance = Grievance(
        citizen_id=current_user.id,
        description=final_text,
        category=category,
        is_emergency=is_emergency,
        location_lat=gps_lat,
        location_lng=gps_lng,
        status=GrievanceStatusEnum.POSTED
    )
    db.add(new_grievance)
    await db.commit()
    await db.refresh(new_grievance)
    
    # Assign to employee conceptually based on BERT's determined category
    employee_query = await db.execute(
        select(User).where(User.role == RoleEnum.EMPLOYEE, User.department_category == category)
    )
    employees = employee_query.scalars().all()
    assigned_employee_id = None
    if employees:
        assigned_employee = employees[0]
        assigned_employee.assigned_grievances.append(new_grievance)
        new_grievance.status = GrievanceStatusEnum.ASSIGNED
        assigned_employee_id = assigned_employee.id
        await db.commit()

    return {
        "status": "success", 
        "grievance_id": new_grievance.id,
        "is_emergency": is_emergency,
        "category": category,
        "assigned_employee_id": assigned_employee_id
    }
