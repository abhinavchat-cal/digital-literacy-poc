from sqlalchemy import Column, String, DateTime, ForeignKey, UUID, Numeric, Boolean, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from backend.core.db import Base

class Exam(Base):
    __tablename__ = "exams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    title = Column(String, nullable=False)
    csv_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    subject = relationship("Subject", back_populates="exams")
    attempts = relationship("ExamAttempt", back_populates="exam")

class ExamAttempt(Base):
    __tablename__ = "exam_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.user_id"), nullable=False)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False)
    score_percentage = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    answers = Column(JSON, nullable=True)
    attempted_on = Column(DateTime, default=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="exam_attempts")
    exam = relationship("Exam", back_populates="attempts")

class CourseCertificate(Base):
    __tablename__ = "course_certificates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.user_id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    certificate_url = Column(String, nullable=False)
    issued_on = Column(DateTime, default=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")
