from sqlalchemy import Column, String, DateTime, ForeignKey, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from backend.core.db import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(String)
    pdf_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)

    # Relationships
    subjects = relationship("Subject", back_populates="course")
    certificates = relationship("CourseCertificate", back_populates="course")

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey('courses.id'))
    name = Column(String, nullable=False)
    trainer_id = Column(UUID(as_uuid=True), ForeignKey('trainers.user_id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    course = relationship("Course", back_populates="subjects")
    trainer = relationship("Trainer", back_populates="subjects")
    exams = relationship("Exam", back_populates="subject")
