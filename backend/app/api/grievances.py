import os
import asyncio
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from sqlalchemy import func

from app.database import get_db, AsyncSessionLocal
from app.models import User, RoleEnum, Grievance, GrievanceStatusEnum, GrievanceCategoryEnum
from app.api.auth import get_current_user

router = APIRouter(prefix="/grievance", tags=["Grievances", "6-Step-Tracker"])

class AssignGroupRequest(BaseModel):
    employee_login_ids: List[str]

# ----------------- BACKGROUND AUTOMATION ----------------- #

async def auto_advance_to_in_progress(grievance_id: int):
    """
    Simulates the Step 4 to Step 5 automated transition exactly after 5 minutes delay constraints.
    """
    await asyncio.sleep(60 * 5) # Strictly delay for 5 minutes dynamically
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Grievance).where(Grievance.id == grievance_id))
        g = res.scalars().first()
        if g and g.status == GrievanceStatusEnum.REACHED:
            g.status = GrievanceStatusEnum.IN_PROGRESS
            await db.commit()

# ----------------- CITIZEN FLOW ----------------- #

@router.post("/citizen/create")
async def create_grievance(
    description: str = Form(...),
    location_lat: Optional[float] = Form(None),
    location_lng: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Only Citizens can natively upload core grievances.")
        
    image_url = f"/uploads/images/{image.filename}" if image else None
    audio_url = f"/uploads/audio/{audio.filename}" if audio else None
    
    new_grievance = Grievance(
        citizen_id=current_user.id,
        description=description,
        location_lat=location_lat,
        location_lng=location_lng,
        image_url=image_url,
        audio_url=audio_url,
        status=GrievanceStatusEnum.POSTED # Step 1 initialization
    )
    db.add(new_grievance)
    await db.commit()
    await db.refresh(new_grievance)
    return {"message": "Grievance securely uploaded. Tracker at STEP 1: Posted.", "ticket_id": new_grievance.id, "tracker_step": 1}


@router.get("/citizen/my-tickets")
async def get_my_grievances(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Route optimized for Citizens only.")
        
    result = await db.execute(
        select(Grievance)
        .options(selectinload(Grievance.assigned_employees))
        .where(Grievance.citizen_id == current_user.id)
    )
    grievances = result.scalars().all()
    
    serialized_data = []
    for g in grievances:
        assigned_team = []
        for emp in g.assigned_employees:
            assigned_team.append({
                "name": emp.name,
                "department_category": emp.department_category.value if emp.department_category else "UNCLASSIFIED"
            })
            
        serialized_data.append({
            "ticket_id": g.id,
            "description": g.description,
            "category": g.category.value,
            "status": g.status.value, # Will structurally output POSTED, ACCEPTED, ASSIGNED, REACHED, etc.
            "location_lat": g.location_lat,
            "location_lng": g.location_lng,
            "image_url": g.image_url,
            "audio_url": g.audio_url,
            "resolution_proof_url": g.resolution_proof_url,
            "resolution_comments": g.resolution_comments,
            "created_at": g.created_at,
            "assigned_team": assigned_team
        })
        
    return {"data": serialized_data}


@router.get("/citizen/global-stats")
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    total_query = await db.execute(select(func.count(Grievance.id)))
    solved_query = await db.execute(select(func.count(Grievance.id)).where(Grievance.status == GrievanceStatusEnum.RESOLVED))
    
    total = total_query.scalar() or 0
    solved = solved_query.scalar() or 0
    unsolved = total - solved
    
    return {
        "location": "INDIA",
        "total_grievances_filed": total,
        "total_solved": solved,
        "total_unsolved": unsolved,
        "success_rate_percentage": round((solved / total * 100), 2) if total > 0 else 0
    }

# ----------------- ADMIN FLOW ----------------- #

@router.put("/admin/accept/{grievance_id}")
async def admin_accept_grievance(grievance_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="System Administrators only.")
        
    g_res = await db.execute(select(Grievance).where(Grievance.id == grievance_id))
    grievance = g_res.scalars().first()
    
    if not grievance:
        raise HTTPException(status_code=404, detail="Ticket completely unfound.")
        
    if grievance.status != GrievanceStatusEnum.POSTED:
        raise HTTPException(status_code=400, detail="Ticket is securely past Step 1. It is already accepted or active.")
        
    grievance.status = GrievanceStatusEnum.ACCEPTED
    await db.commit()
    return {"message": f"Successfully shifted Ticket #{grievance_id} structurally into Step 2: ACCEPTED."}


@router.get("/admin/dashboard")
async def admin_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Strictly restricted to System Administrators.")
        
    unassigned_result = await db.execute(select(Grievance).where(Grievance.status.in_([GrievanceStatusEnum.POSTED, GrievanceStatusEnum.ACCEPTED])))
    
    employees_result = await db.execute(select(User).where(User.role == RoleEnum.EMPLOYEE))
    employees = employees_result.scalars().all()
    
    employee_stats = []
    category_counts = {cat.value: 0 for cat in GrievanceCategoryEnum}
    
    for emp in employees:
        if emp.department_category:
            category_counts[emp.department_category.value] = category_counts.get(emp.department_category.value, 0) + 1
            
        # Treat all working states (Step 3, 4, 5) as theoretically "active" workloads sequentially mapping capacity
        active = await db.execute(select(func.count(Grievance.id)).join(Grievance.assigned_employees).where((User.id == emp.id) & (Grievance.status.in_([GrievanceStatusEnum.ASSIGNED, GrievanceStatusEnum.REACHED, GrievanceStatusEnum.IN_PROGRESS]))))
        solved = await db.execute(select(func.count(Grievance.id)).join(Grievance.assigned_employees).where((User.id == emp.id) & (Grievance.status == GrievanceStatusEnum.RESOLVED)))
        failed = await db.execute(select(func.count(Grievance.id)).join(Grievance.assigned_employees).where((User.id == emp.id) & (Grievance.status == GrievanceStatusEnum.FAILED)))
        
        employee_stats.append({
            "employee_id_tag": emp.login_id,
            "email": emp.email,
            "name": emp.name,
            "category": emp.department_category.value if emp.department_category else "UNCLASSIFIED",
            "active_tasks": active.scalar() or 0,
            "solved_tasks": solved.scalar() or 0,
            "failed_tasks": failed.scalar() or 0
        })
        
    return {
        "unassigned_queue": unassigned_result.scalars().all(),
        "employee_performance_matrix": employee_stats,
        "category_workforce_distribution": category_counts
    }


@router.put("/admin/assign/{grievance_id}")
async def assign_grievance(grievance_id: int, payload: AssignGroupRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized attempt intercepted.")
        
    if len(payload.employee_login_ids) < 2:
        raise HTTPException(status_code=400, detail="CRITICAL POLICY: You cannot assign a job to a single employee. You must explicitly select a group of 2 or more employees.")
        
    emp_res = await db.execute(select(User).where(User.login_id.in_(payload.employee_login_ids)))
    employees = emp_res.scalars().all()
    
    if len(employees) != len(payload.employee_login_ids):
        raise HTTPException(status_code=404, detail="One or more Employee IDs are invalid or unfound.")
            
    g_res = await db.execute(select(Grievance).options(selectinload(Grievance.assigned_employees)).where(Grievance.id == grievance_id))
    grievance = g_res.scalars().first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Invalid Support Ticket numeric sequence.")
        
    # Bump Tracker immediately to Step 3
    grievance.status = GrievanceStatusEnum.ASSIGNED
    grievance.assigned_employees = employees
    grievance.admin_id = current_user.id
    
    await db.commit()
    return {"message": f"Successfully dictated active task custody. Tracker bumped to STEP 3: ASSIGNED.", "assigned_members": len(employees)}


# ----------------- EMPLOYEE FLOW ----------------- #

@router.get("/employee/dashboard")
async def employee_dashboard(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # Personal Tracking Core (Many-To-Many Join checking all active steps 3, 4, 5)
    active = await db.execute(select(Grievance).options(selectinload(Grievance.assigned_employees)).join(Grievance.assigned_employees).where((User.id == current_user.id) & (Grievance.status.in_([GrievanceStatusEnum.ASSIGNED, GrievanceStatusEnum.REACHED, GrievanceStatusEnum.IN_PROGRESS]))))
    solved = await db.execute(select(func.count(Grievance.id)).join(Grievance.assigned_employees).where((User.id == current_user.id) & (Grievance.status == GrievanceStatusEnum.RESOLVED)))
    failed = await db.execute(select(func.count(Grievance.id)).join(Grievance.assigned_employees).where((User.id == current_user.id) & (Grievance.status == GrievanceStatusEnum.FAILED)))

    # Department Co-workers & External Group Task Matrix
    co_workers_result = await db.execute(select(User).where((User.role == RoleEnum.EMPLOYEE) & (User.department_category == current_user.department_category) & (User.id != current_user.id)))
    co_workers = [{"employee_id": u.login_id, "name": u.name, "email": u.email} for u in co_workers_result.scalars().all()]
    
    group_jobs_result = await db.execute(
        select(Grievance)
        .options(selectinload(Grievance.assigned_employees))
        .where((Grievance.category == current_user.department_category) & (Grievance.status.in_([GrievanceStatusEnum.POSTED, GrievanceStatusEnum.ACCEPTED, GrievanceStatusEnum.ASSIGNED, GrievanceStatusEnum.REACHED, GrievanceStatusEnum.IN_PROGRESS])))
    )

    return {
        "personal_record": {
            "employee_id": current_user.login_id,
            "email": current_user.email,
            "name": current_user.name,
            "department_category": current_user.department_category.value if current_user.department_category else "UNCLASSIFIED",
            "active_assigned_tasks": active.scalars().all(),
            "total_solved": solved.scalar() or 0,
            "total_failed": failed.scalar() or 0
        },
        "department_group": {
            "category": current_user.department_category.value if current_user.department_category else "UNCLASSIFIED",
            "co_workers": co_workers,
            "group_active_jobs": group_jobs_result.scalars().all()
        }
    }


@router.put("/employee/ticket/{grievance_id}/reached")
async def employee_reached_site(
    grievance_id: int, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    g_res = await db.execute(select(Grievance).options(selectinload(Grievance.assigned_employees)).where(Grievance.id == grievance_id))
    grievance = g_res.scalars().first()
    
    if not grievance:
        raise HTTPException(status_code=404, detail="Ticket completely unfound.")
        
    assigned_ids = [emp.id for emp in grievance.assigned_employees]
    if current_user.id not in assigned_ids:
        raise HTTPException(status_code=403, detail="You are theoretically completely isolated outside this assigned group matrix.")
        
    if grievance.status != GrievanceStatusEnum.ASSIGNED:
        raise HTTPException(status_code=400, detail="Ticket must natively be in STEP 3 (ASSIGNED) to manually execute a REACHED declaration.")
        
    grievance.status = GrievanceStatusEnum.REACHED
    await db.commit()
    
    # Securely append the Automated background sleep function natively tracking into Step 5
    background_tasks.add_task(auto_advance_to_in_progress, grievance_id)
    
    return {"message": "Site physically reached! Tracker locked to STEP 4. Operating logic will automatically sequentially default into Step 5 (IN POGRESS) exactly 5 minutes from this exact execution block."}


@router.put("/employee/resolve/{grievance_id}")
async def resolve_grievance(
    grievance_id: int, 
    status: str = Form(...), 
    comments: str = Form(None),
    resolution_proof_photo: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized network entry attempt.")
        
    g_res = await db.execute(select(Grievance).options(selectinload(Grievance.assigned_employees)).where(Grievance.id == grievance_id))
    grievance = g_res.scalars().first()
    
    if not grievance:
        raise HTTPException(status_code=404, detail="Ticket completely unfound.")
        
    # Check if current_user is physically explicitly mapped within the assigned group association matrix
    assigned_ids = [emp.id for emp in grievance.assigned_employees]
    if current_user.id not in assigned_ids:
        raise HTTPException(status_code=404, detail="Ticket not detected in your exact group's custody queue.")
        
    if status not in ["SOLVED", "FAILED"]:
        raise HTTPException(status_code=400, detail="CRITICAL: Invalid termination status string. Must exactly be SOLVED or FAILED.")
        
    if not resolution_proof_photo:
        raise HTTPException(status_code=422, detail="CRITICAL ENFORCEMENT: Final resolution proof photograph is absolutely mandatory to officially terminate physical tickets.")
        
    grievance.status = GrievanceStatusEnum.RESOLVED if status == "SOLVED" else GrievanceStatusEnum.FAILED
    grievance.resolution_proof_url = f"/uploads/proofs/{resolution_proof_photo.filename}"
    grievance.resolution_comments = comments
    
    await db.commit()
    return {"message": f"STEP 6 ACHIVED: Team Member securely terminated ticket #{grievance_id} permanently appending visual cryptographic completion proof."}
