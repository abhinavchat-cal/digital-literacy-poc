from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from backend.core.dependencies import get_current_user, get_db
from backend.models.user import User
from backend.schemas.exam import (
    ExamInDB, ExamAttemptInDB, ExamSubmission, ExamResult,
    ExamQuestionResponse, PaginatedExamQuestions
)
from backend.schemas.course import CourseCertificateInDB
from backend.services import candidate as candidate_service

router = APIRouter()

@router.get("/courses", response_model=List[dict])
async def list_available_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available courses"""
    return candidate_service.get_available_courses(db)

@router.get("/exams", response_model=List[ExamInDB])
async def list_available_exams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all available exams for the candidate"""
    return candidate_service.get_available_exams(db, current_user.id)

@router.post("/exams/submit", response_model=ExamResult)
async def submit_exam(
    submission: ExamSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit an exam attempt"""
    return candidate_service.submit_exam(db, submission, current_user.id)

@router.get("/attempts", response_model=List[ExamAttemptInDB])
async def list_exam_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all exam attempts for the candidate"""
    return candidate_service.get_exam_attempts(db, current_user.id)

@router.get("/certificates", response_model=List[CourseCertificateInDB])
async def list_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all certificates earned by the candidate"""
    return candidate_service.get_certificates(db, current_user.id)

@router.get("/progress", response_model=dict)
async def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get candidate's progress across courses"""
    return candidate_service.get_candidate_progress(db, current_user.id)

@router.get("/exams/{exam_id}/questions", response_model=PaginatedExamQuestions)
async def get_exam_questions(
    exam_id: UUID,
    page: int = Query(1, ge=1, description="Page number (1-based)"),
    page_size: int = Query(10, ge=1, le=50, description="Number of questions per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated questions for an exam without correct answers"""
    return candidate_service.get_exam_questions(db, exam_id, page, page_size)
