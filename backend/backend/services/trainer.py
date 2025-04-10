from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
import csv
import io

from backend.models.user import User, Trainer, Candidate
from backend.models.course import Subject
from backend.models.exam import Exam, ExamAttempt
from backend.schemas.course import SubjectCreate
from backend.schemas.exam import ExamCreate
from backend.utils.file_utils import save_exam_file

def get_trainer_subjects(db: Session, trainer_id: UUID) -> List[Subject]:
    return db.query(Subject).filter(Subject.trainer_id == trainer_id).all()

def create_subject(db: Session, subject: SubjectCreate, trainer_id: UUID) -> Subject:
    # Verify trainer exists
    trainer = db.query(Trainer).filter(Trainer.user_id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    db_subject = Subject(**subject.dict(), trainer_id=trainer_id)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def create_exam(db: Session, exam: ExamCreate, trainer_id: UUID) -> Exam:
    # Verify subject belongs to trainer
    subject = db.query(Subject).filter(
        Subject.id == exam.subject_id,
        Subject.trainer_id == trainer_id
    ).first()
    
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Subject not assigned to trainer"
        )
    
    db_exam = Exam(**exam.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

async def upload_exam_csv(db: Session, exam_id: UUID, file: UploadFile, trainer_id: UUID) -> dict:
    # Verify exam belongs to trainer
    exam = db.query(Exam).join(Subject).filter(
        Exam.id == exam_id,
        Subject.trainer_id == trainer_id
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Exam not found or not assigned to trainer"
        )
    
    # Read and validate CSV
    content = await file.read()
    try:
        csv_data = io.StringIO(content.decode())
        reader = csv.DictReader(csv_data)
        
        # Validate CSV structure
        required_fields = ['question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer']
        if not all(field in reader.fieldnames for field in required_fields):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid CSV format. Required fields: question, option_a, option_b, option_c, option_d, correct_answer"
            )
        
        # Save the file
        file_path = save_exam_file(file, exam_id, trainer_id)
        
        # Update exam with file path
        exam.csv_url = file_path
        db.commit()
        
        return {"message": "CSV uploaded successfully", "exam_id": str(exam_id), "file_path": file_path}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error processing CSV: {str(e)}"
        )

def get_institute_candidates(db: Session, trainer_id: UUID) -> List[User]:
    # Get trainer's institute
    trainer = db.query(Trainer).filter(Trainer.user_id == trainer_id).first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    
    # Get all candidates in the institute
    return db.query(User).join(Candidate).filter(
        Candidate.institute_id == trainer.institute_id
    ).all()

def get_exam_results(db: Session, exam_id: UUID, trainer_id: UUID) -> dict:
    # Verify exam belongs to trainer
    exam = db.query(Exam).join(Subject).filter(
        Exam.id == exam_id,
        Subject.trainer_id == trainer_id
    ).first()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Exam not found or not assigned to trainer"
        )
    
    # Get exam attempts
    attempts = db.query(ExamAttempt).filter(ExamAttempt.exam_id == exam_id).all()
    
    # Calculate statistics
    total_attempts = len(attempts)
    passed_attempts = sum(1 for attempt in attempts if attempt.passed)
    average_score = sum(attempt.score_percentage for attempt in attempts) / total_attempts if total_attempts > 0 else 0
    
    return {
        "exam_id": str(exam_id),
        "total_attempts": total_attempts,
        "passed_attempts": passed_attempts,
        "pass_rate": (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0,
        "average_score": float(average_score),
        "attempts": [
            {
                "candidate_id": str(attempt.candidate_id),
                "score": float(attempt.score_percentage),
                "passed": attempt.passed,
                "attempted_on": attempt.attempted_on
            }
            for attempt in attempts
        ]
    } 