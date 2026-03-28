from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.api import auth, grievances, ingestion
from app.database import engine, AsyncSessionLocal
from app.models import Base, User, RoleEnum
from app.api.auth import get_password_hash
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

ADMIN_ID = os.getenv("ADMIN_ID")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000","https://omnigrievance-site.onrender.com")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    if ADMIN_ID and ADMIN_PASSWORD:
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(User).where(User.login_id == ADMIN_ID))
            admin = result.scalars().first()
            if not admin:
                new_admin = User(
                    login_id=ADMIN_ID,
                    hashed_password=get_password_hash(ADMIN_PASSWORD),
                    role=RoleEnum.ADMIN,
                    name="Systems Administrator"
                )
                db.add(new_admin)
                await db.commit()
                
    yield # App runs here
    
    # Shutdown tasks
    await engine.dispose()

app = FastAPI(
    title="OmniGrievance API",
    description="The core routing and orchestration engine for civic issue resolution.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(grievances.router)
app.include_router(ingestion.router)

if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def health_check():
    return {"status": "OmniGrievance Engine Active", "version": "1.0.0"}