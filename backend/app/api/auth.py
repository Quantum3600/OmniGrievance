import os
import random
import string
import secrets
import logging
import httpx
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import datetime
from typing import Optional
import redis.asyncio as redis_async
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import AsyncSessionLocal, get_db
from app.models import User, RoleEnum, GrievanceCategoryEnum
from email.message import EmailMessage
import smtplib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Configs ---
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis_async.from_url(REDIS_URL, decode_responses=True)
JWT_SECRET = os.getenv("JWT_SECRET", "omnigrievance_super_secret_key")
ALGORITHM = "HS256"

SMTP_SENDER_EMAIL = os.getenv("SMTP_SENDER_EMAIL")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD")

# --- Security Utilities ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/admin/login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == int(user_id_str)))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

# --- Schemas ---
class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class StaffLogin(BaseModel):
    login_id: str
    password: str

class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department_category: GrievanceCategoryEnum

class EmployeeProfileUpdate(BaseModel):
    phone: str
    address: str
    pin: str
    district: str
    state: str

class EmployeePasswordResetRequest(BaseModel):
    email: EmailStr

class EmployeePasswordResetVerify(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class EmployeeEmailChangeRequest(BaseModel):
    new_email: EmailStr

class EmployeeEmailChangeVerify(BaseModel):
    new_email: EmailStr
    old_email_otp: str
    new_email_otp: str

class CitizenProfileUpdate(BaseModel):
    name: str
    phone: str
    address: str
    pin: str
    district: str
    state: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    is_profile_complete: bool

# --- CITIZEN FLOW ---
@router.post("/citizen/request-otp")
async def request_otp(data: OTPRequest):
    if not SMTP_SENDER_EMAIL or SMTP_SENDER_EMAIL == "YOUR_GMAIL_ADDRESS@gmail.com":
        raise HTTPException(status_code=500, detail="System Error: Production SMTP credentials are not configured in environment backend.")
        
    otp_value = str(random.randint(100000, 999999))
    await redis_client.setex(data.email, 300, otp_value)
    
    try:
        msg = EmailMessage()
        msg.set_content(f"Your OmniGrievance verification code is: {otp_value}. It will expire in exactly 5 minutes.\n\nDo not share this code with anyone.")
        msg['Subject'] = 'OmniGrievance Verification Code'
        msg['From'] = SMTP_SENDER_EMAIL
        msg['To'] = data.email
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_SENDER_EMAIL, SMTP_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to physically deliver Email OTP via Gmail SMTP. Reason: {str(e)}")
    
    return {"message": "OTP verification initiated via mapped channel. Check your email inbox!"}

@router.post("/citizen/verify-otp", response_model=TokenResponse)
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    cached_otp = await redis_client.get(data.email)
    if not cached_otp or cached_otp != data.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")
        
    await redis_client.delete(data.email)
    
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        user = User(email=data.email, role=RoleEnum.CITIZEN)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    # Check if profile is complete mapping to front-end constraints
    is_profile_complete = True if user.name and user.phone and user.address else False
    
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "is_profile_complete": is_profile_complete}

@router.post("/citizen/complete-profile")
async def complete_profile(data: CitizenProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Only citizens can update this demographic profile.")
        
    current_user.name = data.name
    current_user.phone = data.phone
    current_user.address = data.address
    current_user.pin = data.pin
    current_user.district = data.district
    current_user.state = data.state
    current_user.country = "INDIA" 
    
    await db.commit()
    return {"message": "Profile updated successfully. Automatic routing systems are now fully active."}

@router.get("/citizen/profile")
async def get_citizen_profile(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.CITIZEN:
        raise HTTPException(status_code=403, detail="Unauthorized. Strictly for Citizens.")
        
    return {
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "address": current_user.address,
        "pin": current_user.pin,
        "district": current_user.district,
        "state": current_user.state,
        "country": current_user.country
    }

# --- ADMIN FLOW ---
@router.post("/admin/login", response_model=TokenResponse)
async def admin_login(data: StaffLogin, db: AsyncSession = Depends(get_db)):
    """Dedicated routing explicitly engineered to validate System Administrators."""
    result = await db.execute(select(User).where(User.login_id == data.login_id))
    user = result.scalars().first()
    
    if not user or not verify_password(data.password, user.hashed_password) or user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=401, detail="CRITICAL: Incorrect Admin ID, password, or insufficient permissions.")
        
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "is_profile_complete": True}


# --- EMPLOYEE FLOW ---
@router.post("/employee/login", response_model=TokenResponse)
async def employee_login(data: StaffLogin, db: AsyncSession = Depends(get_db)):
    """Dedicated routing explicitly engineered to validate Government Employees natively."""
    result = await db.execute(select(User).where(User.login_id == data.login_id))
    user = result.scalars().first()
    
    if not user or not verify_password(data.password, user.hashed_password) or user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=401, detail="CRITICAL: Incorrect Employee ID, password, or insufficient permissions.")
        
    is_profile_complete = True if user.phone and user.address else False
        
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "is_profile_complete": is_profile_complete}

@router.get("/employee/profile")
async def get_employee_profile(current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized. Strictly for Government Employees.")
        
    return {
        "employee_id": current_user.login_id,
        "name": current_user.name,
        "email": current_user.email,
        "department_category": current_user.department_category.value if current_user.department_category else "OTHER",
        "phone": current_user.phone,
        "address": current_user.address,
        "pin": current_user.pin,
        "district": current_user.district,
        "state": current_user.state,
        "country": current_user.country
    }

@router.post("/employee/complete-profile")
async def complete_employee_profile(data: EmployeeProfileUpdate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Only recognized Government Employees can update this internal demographic profile.")
        
    current_user.phone = data.phone
    current_user.address = data.address
    current_user.pin = data.pin
    current_user.district = data.district
    current_user.state = data.state
    current_user.country = "INDIA"
    
    await db.commit()
    return {"message": "Employee profile demographic data synchronized successfully. Dashboard is unlocked."}

@router.post("/admin/create-employee")
async def create_employee(data: EmployeeCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Only system administrators can provision employee network access.")
        
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="This email is already registered in the OmniGrievance network.")
        
    generated_emp_id = f"EMP-{random.randint(10000, 99999)}"
    alphabet = string.ascii_letters + string.digits
    generated_password = ''.join(secrets.choice(alphabet) for i in range(10))
    
    if not SMTP_SENDER_EMAIL or not SMTP_APP_PASSWORD:
        raise HTTPException(status_code=500, detail="System Error: Cannot dispatch employee credentials because SMTP is offline.")
    
    try:
        msg = EmailMessage()
        msg.set_content(f"Hello {data.name},\n\nYou have been securely provisioned as a Government Employee on the OmniGrievance Portal.\n\nYour Assigned Official Jurisdiction:\nDepartment Category: {data.department_category.value}\n\nYour Login Credentials:\nEmployee ID: {generated_emp_id}\nPassword: {generated_password}\n\nPlease keep these credentials secure and login through the official strictly-gated Employee Portal.")
        msg['Subject'] = 'OmniGrievance - Your Employee Credentials'
        msg['From'] = SMTP_SENDER_EMAIL
        msg['To'] = data.email
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_SENDER_EMAIL, SMTP_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deliver Employee Credentials via email. Reason: {str(e)}")
        
    new_employee = User(
        login_id=generated_emp_id,
        hashed_password=get_password_hash(generated_password),
        name=data.name,
        email=data.email,
        role=RoleEnum.EMPLOYEE,
        department_category=data.department_category,
        created_by_id=current_user.id
    )
    
    db.add(new_employee)
    await db.commit()
    return {"message": f"Successfully minted terminal access for {data.name}. Credentials dynamically generated and dispatched to {data.email}."}


# --- EMPLOYEE SECURITY OPERATIONS ---
@router.post("/employee/request-password-reset-otp")
async def employee_request_password_reset_otp(data: EmployeePasswordResetRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    if not user or user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=404, detail="Employee not found with this email.")
        
    otp_value = str(random.randint(100000, 999999))
    await redis_client.setex(f"emp_pwd_reset:{data.email}", 300, otp_value)
    
    if not SMTP_SENDER_EMAIL or not SMTP_APP_PASSWORD:
        raise HTTPException(status_code=500, detail="SMTP is offline.")
        
    try:
        msg = EmailMessage()
        msg.set_content(f"Your password reset OTP is: {otp_value}\nThis code expires in exactly 5 minutes.")
        msg['Subject'] = 'OmniGrievance - Employee Password Reset OTP'
        msg['From'] = SMTP_SENDER_EMAIL
        msg['To'] = data.email
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_SENDER_EMAIL, SMTP_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dispatch OTP email: {str(e)}")
        
    return {"message": "Password reset OTP sent to your registered email."}

@router.post("/employee/verify-password-reset")
async def employee_verify_password_reset(data: EmployeePasswordResetVerify, db: AsyncSession = Depends(get_db)):
    cached_otp = await redis_client.get(f"emp_pwd_reset:{data.email}")
    if not cached_otp or cached_otp != data.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")
        
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    if not user or user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=404, detail="Employee not found.")
        
    user.hashed_password = get_password_hash(data.new_password)
    await db.commit()
    await redis_client.delete(f"emp_pwd_reset:{data.email}")
    
    return {"message": "Employee password has been successfully updated!"}


@router.post("/employee/request-email-change")
async def employee_request_email_change(data: EmployeeEmailChangeRequest, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized. Only employees can invoke this route.")
        
    result = await db.execute(select(User).where(User.email == data.new_email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="The requested new email is already locked to another user.")
        
    old_otp = str(random.randint(100000, 999999))
    new_otp = str(random.randint(100000, 999999))
    
    await redis_client.setex(f"emp_email_old:{current_user.id}", 300, old_otp)
    await redis_client.setex(f"emp_email_new:{current_user.id}", 300, new_otp)
    
    if not SMTP_SENDER_EMAIL or not SMTP_APP_PASSWORD:
        raise HTTPException(status_code=500, detail="SMTP is offline.")
        
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_SENDER_EMAIL, SMTP_APP_PASSWORD)
        
        msg_old = EmailMessage()
        msg_old.set_content(f"Security Alert: A request was made to change your OmniGrievance email address.\n\nYour authorization OTP is: {old_otp}\n\nIf you did not request this, contact your System Administrator immediately.")
        msg_old['Subject'] = 'OmniGrievance - Authorize Email Change'
        msg_old['From'] = SMTP_SENDER_EMAIL
        msg_old['To'] = current_user.email
        server.send_message(msg_old)
        
        msg_new = EmailMessage()
        msg_new.set_content(f"Welcome to OmniGrievance.\n\nPlease verify this new email address by submitting this OTP: {new_otp}")
        msg_new['Subject'] = 'OmniGrievance - Verify New Employee Email'
        msg_new['From'] = SMTP_SENDER_EMAIL
        msg_new['To'] = data.new_email
        server.send_message(msg_new)
        
        server.quit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to dispatch dual-verification OTPs. Reason: {str(e)}")
        
    return {"message": "Security verification OTPs have been dispatched to BOTH your current and new email addresses."}

@router.post("/employee/verify-email-change")
async def employee_verify_email_change(data: EmployeeEmailChangeVerify, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.role != RoleEnum.EMPLOYEE:
        raise HTTPException(status_code=403, detail="Unauthorized.")
        
    cached_old = await redis_client.get(f"emp_email_old:{current_user.id}")
    cached_new = await redis_client.get(f"emp_email_new:{current_user.id}")
    
    if not cached_old or not cached_new:
        raise HTTPException(status_code=400, detail="One or both security OTPs have expired. Please initiate the request again.")
        
    if cached_old != data.old_email_otp or cached_new != data.new_email_otp:
        raise HTTPException(status_code=401, detail="Access Denied: Invalid OTP signature provided.")
        
    current_user.email = data.new_email
    await db.commit()
    
    await redis_client.delete(f"emp_email_old:{current_user.id}")
    await redis_client.delete(f"emp_email_new:{current_user.id}")
    
    return {"message": f"Security Clearance verified. Your primary email address has been permanently updated to {data.new_email}"}


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Universal Logout Endpoint handling Admin, Employee, and Citizen identities seamlessly.
    Since we use stateless JWT bearer tokens, true session destruction occurs structurally on the frontend UI.
    This route authentically verifies the token is valid before safely instructing the client to erase it.
    """
    role_map = {
        RoleEnum.CITIZEN: "Citizen",
        RoleEnum.EMPLOYEE: "Government Employee",
        RoleEnum.ADMIN: "System Administrator"
    }
    
    friendly_role = role_map.get(current_user.role, "User")
    
    return {
        "message": f"Session securely terminated for {friendly_role} '{current_user.name or current_user.email}'. Please wipe your local JWT token on the frontend.",
        "role": current_user.role.value
    }
