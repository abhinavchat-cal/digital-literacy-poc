from datetime import datetime
from typing import Optional
from pydantic import BaseModel, UUID4

class SubjectBase(BaseModel):
    name: str
    course_id: UUID4

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None

class SubjectInDB(SubjectBase):
    id: UUID4
    trainer_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True 