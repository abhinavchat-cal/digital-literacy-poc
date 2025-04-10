from pydantic import BaseModel, HttpUrl, UUID4
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class ExamBase(BaseModel):
    title: str
    subject_id: UUID4
    csv_url: Optional[str] = None

class ExamCreate(ExamBase):
    pass

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    csv_url: Optional[str] = None

class ExamInDB(ExamBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class ExamAttemptBase(BaseModel):
    candidate_id: UUID4
    exam_id: UUID4
    score_percentage: float
    passed: bool
    answers: Optional[Dict[str, str]] = None

class ExamAttemptCreate(ExamAttemptBase):
    pass

class ExamAttemptInDB(ExamAttemptBase):
    id: UUID4
    attempted_on: datetime

    class Config:
        from_attributes = True

class ExamQuestion(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str  # a, b, c, or d

class ExamQuestionResponse(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

class PaginatedExamQuestions(BaseModel):
    questions: List[ExamQuestionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class ExamSubmission(BaseModel):
    exam_id: UUID4
    answers: Dict[str, str]  # question_id -> answer (a, b, c, d)

class ExamResult(BaseModel):
    exam_id: UUID4
    score_percentage: float
    passed: bool
    total_questions: int
    correct_answers: int
    attempted_on: datetime

class CourseCertificateBase(BaseModel):
    course_id: UUID
    certificate_url: HttpUrl

class CourseCertificateCreate(CourseCertificateBase):
    pass

class CourseCertificateInDB(CourseCertificateBase):
    id: UUID
    candidate_id: UUID
    course_id: UUID
    certificate_url: str
    issued_on: datetime

    class Config:
        from_attributes = True
