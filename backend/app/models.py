import enum
import datetime
from sqlalchemy import Column, Integer, String, Enum, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.database import Base

class RoleEnum(str, enum.Enum):
    CITIZEN = "CITIZEN"
    EMPLOYEE = "EMPLOYEE"
    ADMIN = "ADMIN"

class StatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ROUTED = "ROUTED"
    ASSIGNED = "ASSIGNED"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.CITIZEN, nullable=False)
    reward_points = Column(Integer, default=0, nullable=False)
    
    # Relation to grievances if citizen
    grievances = relationship("Grievance", back_populates="citizen", foreign_keys="Grievance.citizen_id")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    # Spatial Jurisdiction mapping: Polygon strictly in SRID 4326 for global lat/long compatibility
    jurisdiction_polygon = Column(Geometry('POLYGON', srid=4326), nullable=False)
    
    grievances = relationship("Grievance", back_populates="department")

class Grievance(Base):
    __tablename__ = "grievances"
    
    id = Column(Integer, primary_key=True, index=True)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_officer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Text extracted from NLP/Omnichannel text input
    description = Column(String, nullable=False)
    
    # Spatial Point representing the exact origin of the problem
    geo_coordinates = Column(Geometry('POINT', srid=4326), nullable=False)
    
    # JSONB column managing state for complex parallel multi-agency handling
    dependencies = Column(JSON, default=list, nullable=False)
    
    # AWS S3 / Local Storage reference to the multimodal proof
    media_hash = Column(String, nullable=True)
    
    status = Column(Enum(StatusEnum), default=StatusEnum.PENDING, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id], back_populates="grievances")
    assigned_officer = relationship("User", foreign_keys=[assigned_officer_id])
    department = relationship("Department", back_populates="grievances")
