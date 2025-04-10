from sqlalchemy import Column, ForeignKey, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from backend.core.db import Base

class CourseCertificate(Base):
    __tablename__ = "course_certificates"
    __table_args__ = {'extend_existing': True}

    id = Column(UUID(as_uuid=True), primary_key=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidates.user_id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    certificate_url = Column(String, nullable=False)
    issued_on = Column(DateTime(timezone=True), server_default=func.now()) 