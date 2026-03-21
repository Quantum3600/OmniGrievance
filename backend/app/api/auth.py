from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, constr
import datetime
from typing import Optional

# Router for Authentication
router = APIRouter(prefix="/auth", tags=["auth"])

# --- Mock Environment Configs ---
MOCK_REDIS_DB = {} # Mock caching dict to simulate Redis
JWT_SECRET = "omnigrievance_super_secret_key" # Should be ENV
OTP_VALUE = "123456" # Hardcoded for prototyping 

# --- Pydantic Schemas ---
class OTPRequest(BaseModel):
    phone_number: str

class OTPVerify(BaseModel):
    phone_number: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# --- JWT Mock Utility ---
# Real implementation would use python-jose or pyjwt
def create_mock_jwt(phone_number: str, role: str) -> str:
    import base64
    import json
    # Explicitly baking RBAC role into the payload
    payload = {"sub": phone_number, "role": role, "exp": str(datetime.datetime.utcnow() + datetime.timedelta(hours=24))}
    payload_str = json.dumps(payload)
    encoded_payload = base64.b64encode(payload_str.encode()).decode()
    return f"mock_header.{encoded_payload}.mock_signature"

# --- Endpoints ---

@router.post("/request-otp")
async def request_otp(data: OTPRequest):
    """
    Step 1: Accept mobile number, cache OTP in Redis (mocked) to implement Zero-Friction onboarding via SMS/WhatsApp.
    """
    if len(data.phone_number) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number format.")
    
    # Store in mock redis cache (Expires conceptually after 5 mins)
    MOCK_REDIS_DB[data.phone_number] = OTP_VALUE
    
    return {"message": "OTP sent successfully to mapped communication channel.", "mock_otp": OTP_VALUE}

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: OTPVerify):
    """
    Step 2: Validate the OTP from Mock Redis, then generate a JWT that explicitly assigns their RBAC role.
    """
    cached_otp = MOCK_REDIS_DB.get(data.phone_number)
    
    if not cached_otp or cached_otp != data.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")
    
    # Mocking Database Lookup for Role Assignment (simulating RBAC lookup)
    assigned_role = "CITIZEN"
    if data.phone_number == "+19999999999":
        assigned_role = "EMPLOYEE"
    elif data.phone_number == "+10000000000":
        assigned_role = "ADMIN"
        
    # Generate the Token
    token = create_mock_jwt(data.phone_number, assigned_role)
    
    # Clear Cache
    del MOCK_REDIS_DB[data.phone_number]
    
    return {"access_token": token, "token_type": "bearer"}

class DeveloperLogin(BaseModel):
    role: str

@router.post("/developer-guest-login", response_model=TokenResponse)
async def developer_guest_login(data: DeveloperLogin):
    """
    Rapid Guest access bypassing OTP explicitly for Developers mapping 
    distinct paths to Citizen, Employee, and Admin portals.
    """
    phone_map = {
        "CITIZEN": "+18888888888",
        "EMPLOYEE": "+19999999999",
        "ADMIN": "+10000000000"
    }
    
    assigned_role = data.role.upper()
    if assigned_role not in phone_map:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
        
    token = create_mock_jwt(phone_map[assigned_role], assigned_role)
    return {"access_token": token, "token_type": "bearer"}
