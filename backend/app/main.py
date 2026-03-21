from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, intake, employee
from app.api import webhook_intake

app = FastAPI(
    title="OmniGrievance API",
    description="The core routing and orchestration engine for civic issue resolution.",
    version="1.0.0"
)

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
app.include_router(intake.router)
app.include_router(employee.router)
app.include_router(webhook_intake.router)

@app.get("/")
async def health_check():
    """
    Provides a simple heartbeat check to verify the API Gateway is online.
    """
    return {"status": "OmniGrievance Engine Active", "version": "1.0.0"}

# Note: App is run via `uvicorn app.main:app --reload`
