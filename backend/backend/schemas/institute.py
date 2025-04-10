from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class InstituteBase(BaseModel):
    name: str
    district: Optional[str] = None
    block: Optional[str] = None

class InstituteCreate(InstituteBase):
    pass

class InstituteInDB(InstituteBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class InstituteWithStats(InstituteInDB):
    total_candidates: int
    total_trainers: int
    total_subjects: int
    total_exams: int
    pass_rate: float

    class Config:
        from_attributes = True
