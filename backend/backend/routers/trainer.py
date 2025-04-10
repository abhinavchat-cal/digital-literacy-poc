from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from backend.core.db import get_db
from backend.core.dependencies import require_trainer
from backend.models.user import User, Trainer
from backend.models.course import Subject
from backend.models.exam import Exam
from backend.schemas.course import SubjectCreate, SubjectInDB
from backend.schemas.exam import ExamCreate, ExamInDB
from backend.schemas.user import UserResponse
from backend.services import trainer as trainer_service

router = APIRouter()

@router.get("/trainer/subjects", response_model=List[SubjectInDB])
async def list_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    """List all subjects assigned to the trainer"""
    return trainer_service.get_trainer_subjects(db, current_user.id)

@router.post("/trainer/subjects", response_model=SubjectInDB, status_code=status.HTTP_201_CREATED)
async def create_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    """Create a new subject"""
    return trainer_service.create_subject(db, subject, current_user.id)

@router.post("/trainer/exams", response_model=ExamInDB, status_code=status.HTTP_201_CREATED)
async def create_exam(
    exam: ExamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    """Create a new exam for a subject"""
    return trainer_service.create_exam(db, exam, current_user.id)

@router.post("/trainer/exams/{exam_id}/upload-csv")
async def upload_exam_csv(
    exam_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    """Upload CSV file for exam questions"""
    return await trainer_service.upload_exam_csv(db, exam_id, file, current_user.id)

@router.get("/trainer/candidates", response_model=List[UserResponse])
async def list_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    """List all candidates in the trainer's institute"""
    return trainer_service.get_institute_candidates(db, current_user.id)

@router.get("/trainer/exams/{exam_id}/results")
async def get_exam_results(
    exam_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_trainer)
):
    """Get exam results and statistics"""
    return trainer_service.get_exam_results(db, exam_id, current_user.id)
