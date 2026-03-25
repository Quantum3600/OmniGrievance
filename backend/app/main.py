from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, grievances
from app.database import engine
from app.models import Base

app = FastAPI(
    title="OmniGrievance API",
    description="The core routing and orchestration engine for civic issue resolution.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_db_init():
    async with engine.begin() as conn:
        # Initialize tables automatically on container boot for local MVP testing
        await conn.run_sync(Base.metadata.create_all)
        
    # Automatically Seed Pre-programmed Admin
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy.future import select
    from app.database import AsyncSessionLocal
    from app.models import User, RoleEnum
    import os
    
    ADMIN_ID = os.getenv("ADMIN_ID")
    ADMIN_PWD = os.getenv("ADMIN_PASSWORD")
    
    if not ADMIN_ID or not ADMIN_PWD:
        return # Skip seeder if credentials intentionally withheld
        
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.login_id == ADMIN_ID))
        admin = result.scalars().first()
        if not admin:
            from app.api.auth import get_password_hash
            new_admin = User(
                login_id=ADMIN_ID,
                hashed_password=get_password_hash(ADMIN_PWD),
                role=RoleEnum.ADMIN,
                name="Systems Administrator"
            )
            db.add(new_admin)
            await db.commit()

# Global CORS config for the Web/PWA App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Link to Next.js Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the Router endpoints
app.include_router(auth.router)
app.include_router(grievances.router)


@app.get("/")
async def health_check():
    """
    Provides a simple heartbeat check to verify the API Gateway is online.
    """
    return {"status": "OmniGrievance Engine Active", "version": "1.0.0"}

# Note: App is run via `uvicorn app.main:app --reload`
