import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Department, Grievance, StatusEnum

async def match_jurisdiction(session: AsyncSession, lat: float, lng: float) -> Optional[Department]:
    """
    Executes a PostGIS `ST_Contains` query verifying which specific Department's Poly-Zone 
    completely encompasses the extracted citizen coordinates. Returns the exact spatial match.
    """
    # Create the Point using SRID 4326 (WGS 84 GPS standard)
    target_point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)
    
    # Query Database for Intersecting Polygon Zones
    stmt = select(Department).where(func.ST_Contains(Department.jurisdiction_polygon, target_point))
    result = await session.execute(stmt)
    
    # Return the first physical department mapped to that exact spatial meter.
    return result.scalars().first()

async def process_bpm_workflow(session: AsyncSession, description: str, lat: float, lng: float, citizen_id: int) -> Grievance:
    """
    Simulates the core BPM algorithm evaluating "Multi-Agency" intent overlapping (simulate-parallel-dispatch.md).
    Creates the Master ticket and natively spawns parallel sub-tickets inside the database array if overlaps trigger.
    """
    
    desc_lower = description.lower()
    departments_needed: List[str] = []
    
    # 1. Semantic Overlap Check
    # If the system detects intersecting functional keywords, it assumes a multi-agency operation.
    if "water" in desc_lower or "pipe" in desc_lower or "leak" in desc_lower:
        departments_needed.append("Water Supply")
    if "road" in desc_lower or "street" in desc_lower or "pothole" in desc_lower:
        departments_needed.append("Public Works")
    
    # Fallback to general zone matching if no specific department parsed 
    if not departments_needed:
        departments_needed.append("General Maintenance")

    # 2. Spatial Base Resolution
    # We always need the fundamental neighborhood zone owner regardless of semantic intent
    local_department = await match_jurisdiction(session, lat, lng)
    local_department_id = local_department.id if local_department else None
    
    # 3. Ticket Generation
    # Create the Master (Parent) Grievance
    master_grievance = Grievance(
        citizen_id=citizen_id,
        department_id=local_department_id if len(departments_needed) == 1 else None, # If multiple, parent belongs to no single dept
        description=description,
        geo_coordinates=f'SRID=4326;POINT({lng} {lat})', # WKT insertion format
        status=StatusEnum.PENDING,
        dependencies=[]
    )
    
    session.add(master_grievance)
    await session.commit()
    await session.refresh(master_grievance)

    # 4. Multi-Agency Parallel Sub-Task Spawning
    if len(departments_needed) > 1:
        child_tickets = []
        for target_dept_name in departments_needed:
            # Query the target abstract department (e.g. "Public Works HQ")
            stmt = select(Department).where(Department.name == target_dept_name)
            res = await session.execute(stmt)
            dept = res.scalars().first()
            
            sub_ticket = Grievance(
                citizen_id=citizen_id,
                department_id=dept.id if dept else None,
                description=f"[SUB-TASK: {target_dept_name} Protocol] Derived from Master Ticket #{master_grievance.id}: {description}",
                geo_coordinates=f'SRID=4326;POINT({lng} {lat})',
                status=StatusEnum.ROUTED,
                dependencies={"parent_id": master_grievance.id}
            )
            session.add(sub_ticket)
            child_tickets.append(sub_ticket)
            
        await session.commit()
        
        # Populate the parent dependency array tracking the immediate child IDs
        master_grievance.dependencies = [{"child_id": ct.id, "status": ct.status} for ct in child_tickets]
        # Elevate master to ROUTED
        master_grievance.status = StatusEnum.ROUTED
        await session.commit()
    
    return master_grievance
