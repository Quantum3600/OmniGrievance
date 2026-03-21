from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Grievance, User, StatusEnum
from app.services import communications

router = APIRouter(prefix="/employee", tags=["employee"])

class ResolvePayload(BaseModel):
    resolving_officer_id: int
    proof_image_hash: str | None = None
    notes: str | None = None

@router.patch("/tickets/{ticket_id}/resolve")
async def resolve_grievance(
    ticket_id: int, 
    payload: ResolvePayload, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Endpoint strictly for Nodal Officers and Sub-Agencies to conclude tickets.
    Enforces `mandatory-proof.md` heavily rejecting incomplete resolutions.
    Automatically scores their execution based on internal SLA timestamps.
    """
    
    # 1. Fetch Ticket
    stmt = select(Grievance).where(Grievance.id == ticket_id)
    result = await db.execute(stmt)
    ticket = result.scalars().first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Grievance ticket not found")
        
    if ticket.status == StatusEnum.RESOLVED or ticket.status == StatusEnum.CLOSED:
        raise HTTPException(status_code=400, detail="Ticket is already closed")

    # 2. Enforce `mandatory-proof.md` Zero-Exception Policy
    if not payload.proof_image_hash or payload.proof_image_hash.strip() == "":
        raise HTTPException(
            status_code=400, 
            detail="Resolution rejected. A photographic proof hash matching the completed work must be provided."
        )
        
    # 3. Fetch Node Officer
    user_stmt = select(User).where(User.id == payload.resolving_officer_id)
    user_result = await db.execute(user_stmt)
    officer = user_result.scalars().first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Resolving officer ID not found")

    # 4. Gamification Points / SLA Evaluation
    now = datetime.datetime.utcnow()
    resolution_delta = now - ticket.timestamp
    points_awarded = 0
    
    if resolution_delta <= datetime.timedelta(hours=48):
        points_awarded = 50 # Priority SLA Met
    elif resolution_delta <= datetime.timedelta(days=7):
        points_awarded = 10 # Standard SLA Met
    else:
        points_awarded = 0  # SLA Missed, no penalty but no points
        
    officer.reward_points += points_awarded
    
    # 5. Database Commit
    ticket.status = StatusEnum.RESOLVED
    ticket.assigned_officer_id = officer.id
    # Append final structural context via media
    ticket.media_hash = payload.proof_image_hash 
    
    await db.commit()
    
    # 6. Execute Zero-Friction Outbound Comms (Async push)
    # Ideally mapping `ticket.citizen.phone_number` if joined
    background_tasks.add_task(
        communications.notify_citizen, 
        "+10000000000", # Mocked
        "Ticket Resolution", 
        "RESOLVED"
    )
    
    return {
        "status": "success",
        "ticket_id": ticket.id,
        "new_status": ticket.status,
        "gamification": {
            "points_awarded": points_awarded,
            "new_total": officer.reward_points
        }
    }
