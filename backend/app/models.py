import enum
import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, JSON, ForeignKey, Float, Text, Table, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.database import Base

class RoleEnum(str, enum.Enum):
    CITIZEN = "CITIZEN"
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"

class GrievanceStatusEnum(str, enum.Enum):
    POSTED = "POSTED"               # Step 1
    ACCEPTED = "ACCEPTED"           # Step 2
    ASSIGNED = "ASSIGNED"           # Step 3
    REACHED = "REACHED"             # Step 4
    IN_PROGRESS = "IN_PROGRESS"     # Step 5
    WORK_DONE = "WORK_DONE"         # Step 6
    RESOLVED = "RESOLVED"           # Step 7
    FAILED = "FAILED"

class GrievanceCategoryEnum(str, enum.Enum):
    CIVIC_AMENITIES = "CIVIC_AMENITIES"   # Broken roads, street lights, water supply
    PUBLIC_HEALTH = "PUBLIC_HEALTH"       # Hospital delays, lack of medicines, sanitation
    SOCIAL_WELFARE = "SOCIAL_WELFARE"     # Pensions, ration cards, disability benefits
    REVENUE_AND_LAND = "REVENUE_AND_LAND" # Land record disputes, property tax, certificates
    LAW_AND_ORDER = "LAW_AND_ORDER"       # Police inaction, traffic management, safety
    EDUCATION = "EDUCATION"               # Mid-day meals, school infrastructure, teachers
    INFRASTRUCTURE = "INFRASTRUCTURE"     # Public transport, electricity, internet
    EMPLOYMENT_AND_LABOR = "EMPLOYMENT_AND_LABOR" # Minimum wage, MGNREGA, workplace safety
    OTHER = "OTHER" # Other grievances

grievance_assignments = Table(
    'grievance_assignments',
    Base.metadata,
    Column('grievance_id', Integer, ForeignKey('grievances.id'), primary_key=True),
    Column('employee_id', Integer, ForeignKey('users.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.CITIZEN, nullable=False)
    
    # --- Staff Authentication Fields ---
    login_id = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    
    # --- Citizen Integration Fields ---
    email = Column(String(150), unique=True, index=True, nullable=True)
    
    # --- Profile Demographic Context ---
    name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(String(255), nullable=True)
    pin = Column(String(20), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(50), default="INDIA", nullable=False)
    
    department_category = Column(Enum(GrievanceCategoryEnum), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reward_points = Column(Integer, default=0, nullable=False)
    is_busy = Column(Boolean, default=False, nullable=False)
    
    # --- Time Tracking Metrics (Monthly) ---
    work_seconds_month = Column(Integer, default=0, nullable=False)
    available_seconds_month = Column(Integer, default=0, nullable=False)
    last_duty_toggle_at = Column(DateTime, server_default=func.now(), nullable=False)
    current_task_started_at = Column(DateTime, nullable=True)
    
    # Relation to grievances if citizen
    grievances = relationship("Grievance", back_populates="citizen", foreign_keys="Grievance.citizen_id")

class Grievance(Base):
    __tablename__ = "grievances"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Custody Chain Links
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Core Data Payload
    description = Column(Text, nullable=False)
    audio_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    
    # Automated Classification Matrix (Awaiting AI Override)
    category = Column(Enum(GrievanceCategoryEnum), default=GrievanceCategoryEnum.OTHER, nullable=False)
    status = Column(Enum(GrievanceStatusEnum), default=GrievanceStatusEnum.POSTED, nullable=False)
    is_emergency = Column(Boolean, default=False, nullable=False)
    
    # Geolocation Data Points (Using floats for generic AI handling instead of strict PostGIS Geometry to ease prototyping)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    
    # Employee Post-Resolution Audit (Mandatory Proof)
    resolution_proof_url = Column(String(500), nullable=True)
    resolution_comments = Column(Text, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # SQLAlchemy Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="grievances")
    admin = relationship("User", foreign_keys=[admin_id])
    assigned_employees = relationship("User", secondary=grievance_assignments, backref="assigned_grievances", lazy="selectin")
