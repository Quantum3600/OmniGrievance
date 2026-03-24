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
    email: str

class OTPVerify(BaseModel):
    email: str
    otp: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class LoginPasswordRequest(BaseModel):
    role: str
    identifier: str
    password: str

class RegisterCitizenRequest(BaseModel):
    fullName: str
    email: str
    mobile: str
    aadhaar: str
    address: str
    pincode: str
    password: str

# --- JWT Mock Utility ---
# Real implementation would use python-jose or pyjwt
def create_mock_jwt(email: str, role: str) -> str:
    import base64
    import json
    # Explicitly baking RBAC role into the payload
    payload = {"sub": email, "role": role, "exp": str(datetime.datetime.utcnow() + datetime.timedelta(hours=24))}
    payload_str = json.dumps(payload)
    encoded_payload = base64.b64encode(payload_str.encode()).decode()
    return f"mock_header.{encoded_payload}.mock_signature"

# --- Endpoints ---

@router.post("/request-otp")
async def request_otp(data: OTPRequest):
    """
    Step 1: Accept email, cache OTP in Redis (mocked) to implement Zero-Friction onboarding.
    """
    if "@" not in data.email:
        raise HTTPException(status_code=400, detail="Invalid email format.")
    
    # Store in mock redis cache (Expires conceptually after 5 mins)
    MOCK_REDIS_DB[data.email] = OTP_VALUE
    
    return {"message": "OTP sent successfully to email.", "mock_otp": OTP_VALUE}

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: OTPVerify):
    """
    Step 2: Validate the OTP from Mock Redis, then generate a JWT that explicitly assigns their RBAC role.
    """
    cached_otp = MOCK_REDIS_DB.get(data.email)
    
    if not cached_otp or cached_otp != data.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")
    
    # Mocking Database Lookup for Role Assignment (simulating RBAC lookup)
    assigned_role = "CITIZEN"
    if data.email == "employee@omnigrievance.gov.in":
        assigned_role = "EMPLOYEE"
    elif data.email == "admin@omnigrievance.gov.in":
        assigned_role = "ADMIN"
        
    # Generate the Token
    token = create_mock_jwt(data.email, assigned_role)
    
    # Clear Cache
    if data.email in MOCK_REDIS_DB:
        del MOCK_REDIS_DB[data.email]
    
    return {"access_token": token, "token_type": "bearer"}

class DeveloperLogin(BaseModel):
    role: str

@router.post("/developer-guest-login", response_model=TokenResponse)
async def developer_guest_login(data: DeveloperLogin):
    """
    Rapid Guest access bypassing OTP explicitly for Developers mapping 
    distinct paths to Citizen, Employee, and Admin portals.
    """
    email_map = {
        "CITIZEN": "citizen@example.com",
        "EMPLOYEE": "employee@omnigrievance.gov.in",
        "ADMIN": "admin@omnigrievance.gov.in"
    }
    
    assigned_role = data.role.upper()
    if assigned_role not in email_map:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
        
    token = create_mock_jwt(email_map[assigned_role], assigned_role)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login-password", response_model=TokenResponse)
async def login_password(data: LoginPasswordRequest):
    """
    Role-based password login. Mocks the password verification.
    """
    valid_roles = ["CITIZEN", "EMPLOYEE", "ADMIN"]
    assigned_role = data.role.upper()
    
    if assigned_role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
    
    # Mocking password verification
    token = create_mock_jwt(data.identifier, assigned_role)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/register-citizen", response_model=TokenResponse)
async def register_citizen(data: RegisterCitizenRequest):
    """
    Intelligent citizen registration. Returns a valid JWT.
    """
    # Mock user creation
    token = create_mock_jwt(data.email, "CITIZEN")
    return {"access_token": token, "token_type": "bearer"}
