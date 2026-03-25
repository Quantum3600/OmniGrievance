import asyncio
import datetime
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

EMERGENCY_KEYWORDS = ["live wire", "gas leak", "structural collapse", "fire", "accident", "medical emergency"]

router = APIRouter(prefix="/grievance", tags=["Grievances", "6-Step-Tracker"])

@router.get("/categories")
async def get_categories():
    return {"categories": [cat.value for cat in GrievanceCategoryEnum]}

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
        status=GrievanceStatusEnum.POSTED, # Step 1 initialization
        is_emergency=any(kw in description.lower() for kw in EMERGENCY_KEYWORDS)
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
                "department_category": emp.department_category.value if emp.department_category else "OTHER"
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


@router.get("/admin/all-grievances")
async def get_all_grievances_admin(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized access to system-wide grievance matrix.")
        
    result = await db.execute(
        select(Grievance)
        .options(selectinload(Grievance.assigned_employees))
        .order_by(Grievance.created_at.desc())
    )
    grievances = result.scalars().all()
    
    def serialize_g(g):
        return {
            "ticket_id": g.id,
            "description": g.description,
            "category": g.category.value,
            "status": g.status.value,
            "is_emergency": g.is_emergency,
            "created_at": g.created_at,
            "assigned_team": [
                {"name": emp.name, "login_id": emp.login_id} for emp in g.assigned_employees
            ]
        }
    
    return {
        "unassigned": [serialize_g(g) for g in grievances if g.status in [GrievanceStatusEnum.POSTED, GrievanceStatusEnum.ACCEPTED]],
        "active": [serialize_g(g) for g in grievances if g.status in [GrievanceStatusEnum.ASSIGNED, GrievanceStatusEnum.REACHED, GrievanceStatusEnum.IN_PROGRESS]],
        "completed": [serialize_g(g) for g in grievances if g.status in [GrievanceStatusEnum.RESOLVED, GrievanceStatusEnum.FAILED]]
    }


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
            "category": emp.department_category.value if emp.department_category else "OTHER",
            "active_tasks": active.scalar() or 0,
            "solved_tasks": solved.scalar() or 0,
            "failed_tasks": failed.scalar() or 0,
            "is_busy": emp.is_busy
        })
        
    # Fetch active emergencies (Top 5 latest)
    emergencies_res = await db.execute(
        select(Grievance)
        .where((Grievance.is_emergency == True) & (Grievance.status.in_([GrievanceStatusEnum.POSTED, GrievanceStatusEnum.ACCEPTED, GrievanceStatusEnum.ASSIGNED, GrievanceStatusEnum.REACHED, GrievanceStatusEnum.IN_PROGRESS])))
        .order_by(Grievance.created_at.desc())
        .limit(5)
    )
    emergencies = emergencies_res.scalars().all()
    
    active_emergencies = [
        {
            "ticket_id": g.id,
            "description": g.description,
            "status": g.status.value,
            "created_at": g.created_at
        } for g in emergencies
    ]

    # Integrated Heatmap Data Matrix
    all_active_res = await db.execute(
        select(Grievance)
        .where(Grievance.status != GrievanceStatusEnum.RESOLVED)
        .where(Grievance.status != GrievanceStatusEnum.FAILED)
    )
    all_active = all_active_res.scalars().all()
    
    heatmap_data = [
        {
            "lat": g.location_lat,
            "lng": g.location_lng,
            "is_emergency": g.is_emergency,
            "status": g.status.value,
            "weight": 5 if g.is_emergency else 2
        } for g in all_active if g.location_lat and g.location_lng
    ]

    return {
        "unassigned_queue": unassigned_result.scalars().all(),
        "employee_performance_matrix": employee_stats,
        "category_workforce_distribution": category_counts,
        "active_emergencies": active_emergencies,
        "heatmap_data": heatmap_data
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
        
    # Mandatory check for busy status
    busy_employees = [e.login_id for e in employees if e.is_busy]
    if busy_employees:
        raise HTTPException(status_code=400, detail=f"The following employees are currently BUSY on another task: {', '.join(busy_employees)}. They must finish their current work before being assigned a new one.")

    # Bump Tracker immediately to Step 3
    grievance.status = GrievanceStatusEnum.ASSIGNED
    grievance.assigned_employees = employees
    grievance.admin_id = current_user.id
    
    # Mark team members as busy instantly
    now = datetime.datetime.now()
    for emp in employees:
        # If they were available, record the idle time
        if not emp.is_busy:
            delta = (now - emp.last_duty_toggle_at).total_seconds()
            emp.available_seconds_month += int(delta)
        
        emp.is_busy = True
        emp.current_task_started_at = now
        emp.last_duty_toggle_at = now
    
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
            "department_category": current_user.department_category.value if current_user.department_category else "OTHER",
            "active_assigned_tasks": active.scalars().all(),
            "total_solved": solved.scalar() or 0,
            "total_failed": failed.scalar() or 0,
            "is_busy": current_user.is_busy,
            "work_seconds_month": current_user.work_seconds_month,
            "available_seconds_month": current_user.available_seconds_month,
            "current_task_started_at": current_user.current_task_started_at.isoformat() if current_user.current_task_started_at else None
        },
        "department_group": {
            "category": current_user.department_category.value if current_user.department_category else "OTHER",
            "co_workers": co_workers,
            "group_active_jobs": group_jobs_result.scalars().all()
        }
    }


@router.put("/employee/toggle-status")
async def toggle_employee_status(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    now = datetime.datetime.now()
    # If they are currently available, we are toggling to BUSY. Record idle availability.
    if not current_user.is_busy:
        delta = (now - current_user.last_duty_toggle_at).total_seconds()
        current_user.available_seconds_month += int(delta)
    
    current_user.is_busy = not current_user.is_busy
    current_user.last_duty_toggle_at = now
    
    await db.commit()
    return {"is_busy": current_user.is_busy}


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
    
    return {"message": "Site physically reached! Status updated to 'Employ Reached'. It will automatically transition to 'Work under process' in 5 minutes."}


@router.put("/employee/ticket/{grievance_id}/done")
async def employee_work_done(
    grievance_id: int, 
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
        raise HTTPException(status_code=403, detail="Unauthorized access to this ticket.")
        
    if grievance.status != GrievanceStatusEnum.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Ticket must be 'IN_PROGRESS' to mark as 'WORK_DONE'.")
        
    grievance.status = GrievanceStatusEnum.WORK_DONE
    await db.commit()
    return {"message": "Work done! Status updated to 'Work done'. Now proceed to finalize resolution with proof."}


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
        
    assigned_ids = [emp.id for emp in grievance.assigned_employees]
    if current_user.id not in assigned_ids:
        raise HTTPException(status_code=404, detail="Ticket not detected in your exact group's custody queue.")
        
    if grievance.status != GrievanceStatusEnum.WORK_DONE:
        raise HTTPException(status_code=400, detail="CRITICAL: You must mark the work as 'DONE' before you can finalize the 'Problem Resolved' status.")

    if status not in ["SOLVED", "FAILED"]:
        raise HTTPException(status_code=400, detail="CRITICAL: Invalid termination status string. Must exactly be SOLVED or FAILED.")
        
    if not resolution_proof_photo:
        raise HTTPException(status_code=422, detail="CRITICAL ENFORCEMENT: Final resolution proof photograph is absolutely mandatory to officially terminate physical tickets.")
        
    grievance.status = GrievanceStatusEnum.RESOLVED if status == "SOLVED" else GrievanceStatusEnum.FAILED
    grievance.resolution_proof_url = f"/uploads/proofs/{resolution_proof_photo.filename}"
    grievance.resolution_comments = comments
    
    # Instantly revert team members back to available state
    now = datetime.datetime.now()
    for emp in grievance.assigned_employees:
        if emp.current_task_started_at:
            work_delta = (now - emp.current_task_started_at).total_seconds()
            emp.work_seconds_month += int(work_delta)
            # Work time also counts as available time as per requirement
            emp.available_seconds_month += int(work_delta)
        
        emp.is_busy = False
        emp.current_task_started_at = None
        emp.last_duty_toggle_at = now
        
    await db.commit()
    return {"message": f"STEP 6 ACHIVED: Team Member securely terminated ticket #{grievance_id} permanently appending visual cryptographic completion proof."}


@router.get("/employee/leaderboard")
async def employee_leaderboard(
    category: Optional[str] = None, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    target_category = category if category else (current_user.department_category.value if current_user.department_category else None)
    
    if not target_category:
        return {"category": "OTHER", "leaderboard": []}
        
    emp_res = await db.execute(select(User).where((User.role == RoleEnum.EMPLOYEE) & (User.department_category == target_category)))
    employees = emp_res.scalars().all()
    
    leaderboard = []
    for emp in employees:
        solved = await db.execute(select(func.count(Grievance.id)).join(Grievance.assigned_employees).where((User.id == emp.id) & (Grievance.status == GrievanceStatusEnum.RESOLVED)))
        count = solved.scalar() or 0
        leaderboard.append({
            "employee_id": emp.login_id,
            "name": emp.name,
            "avatar": "",
            "solved_count": count,
            "is_me": emp.id == current_user.id
        })
        
    leaderboard.sort(key=lambda x: x["solved_count"], reverse=True)
    
    for i, itm in enumerate(leaderboard):
        itm["rank"] = i + 1
        
    return {"category": target_category, "leaderboard": leaderboard}
