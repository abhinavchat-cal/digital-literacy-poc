from sqlalchemy import Column, String, Enum, DateTime, Boolean, ForeignKey, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from backend.core.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum('candidate', 'trainer', 'admin', name='user_role'), nullable=False)
    aadhaar_id = Column(String(12), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    candidate = relationship("Candidate", back_populates="user", uselist=False)
    trainer = relationship("Trainer", back_populates="user", uselist=False)

class Candidate(Base):
    __tablename__ = "candidates"

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    institute_id = Column(UUID(as_uuid=True), ForeignKey('institutes.id'))
    is_ekyc_verified = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="candidate")
    institute = relationship("Institute", back_populates="candidates")
    exam_attempts = relationship("ExamAttempt", back_populates="candidate")
    certificates = relationship("CourseCertificate", back_populates="candidate")

class Trainer(Base):
    __tablename__ = "trainers"

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True)
    institute_id = Column(UUID(as_uuid=True), ForeignKey('institutes.id'))

    # Relationships
    user = relationship("User", back_populates="trainer")
    institute = relationship("Institute", back_populates="trainers")
    subjects = relationship("Subject", back_populates="trainer")
