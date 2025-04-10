from pydantic import BaseModel, HttpUrl, UUID4
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    pdf_url: Optional[HttpUrl] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    title: Optional[str] = None

class CourseInDB(CourseBase):
    id: UUID4
    created_by: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    course_id: UUID

class SubjectCreate(SubjectBase):
    pass

class SubjectUpdate(BaseModel):
    name: Optional[str] = None

class SubjectInDB(SubjectBase):
    id: UUID
    trainer_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class CourseWithSubjects(CourseInDB):
    subjects: List[SubjectInDB] = []

    class Config:
        from_attributes = True

class CourseCertificateBase(BaseModel):
    candidate_id: UUID4
    course_id: UUID4
    certificate_url: str

class CourseCertificateCreate(CourseCertificateBase):
    pass

class CourseCertificateInDB(CourseCertificateBase):
    id: UUID4
    issued_on: datetime

    class Config:
        from_attributes = True
