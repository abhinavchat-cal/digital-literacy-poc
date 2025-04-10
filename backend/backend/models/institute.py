from sqlalchemy import Column, String, DateTime, UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from backend.core.db import Base

class Institute(Base):
    __tablename__ = "institutes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    district = Column(String)
    block = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    candidates = relationship("Candidate", back_populates="institute")
    trainers = relationship("Trainer", back_populates="institute")
