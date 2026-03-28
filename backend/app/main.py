from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.api import auth, grievances, ingestion
from app.database import engine, AsyncSessionLocal
from app.models import Base, User, RoleEnum
from app.api.auth import get_password_hash
from fastapi.staticfiles import StaticFiles
import os
import logging # Added missing import

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ADMIN_ID = os.getenv("ADMIN_ID")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

app = FastAPI(
    title="OmniGrievance API",
    description="The core routing and orchestration engine for civic issue resolution.",
    version="1.0.0"
)

# 1. CORS Middleware (Placed before routes for global coverage)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://omnigrievance-site.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# 2. Consolidated Startup Logic (Removed duplicates)
@app.on_event("startup")
async def startup_event():
    # Database Initialization
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"DATABASE CONNECTION FAILED: {e}")
        return # Exit startup if DB fails

    # Admin Seeder Logic
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
                logger.info("Admin user created successfully.")

# 3. Router Mounts
app.include_router(auth.router)
app.include_router(grievances.router)
app.include_router(ingestion.router)

# 4. Static Files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def health_check():
    return {"status": "OmniGrievance Engine Active", "version": "1.0.0"}
