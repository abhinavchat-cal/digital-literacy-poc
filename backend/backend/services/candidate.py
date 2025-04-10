from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from uuid import UUID, uuid4
import csv
import io
import requests
from datetime import datetime
from pathlib import Path

from backend.models.user import User, Candidate, Trainer
from backend.models.course import Course, Subject
from backend.models.exam import Exam, ExamAttempt, CourseCertificate
from backend.schemas.exam import (
    ExamAttemptCreate, ExamAttemptInDB, ExamInDB,
    ExamSubmission, ExamResult, ExamQuestion
)
from backend.schemas.course import CourseCertificateInDB, CourseInDB
from backend.utils.file_utils import get_file_path

def get_available_courses(db: Session) -> List[Dict]:
    courses = db.query(Course).all()
    return [CourseInDB.from_orm(course).dict() for course in courses]

def get_available_exams(db: Session, user_id: UUID) -> List[ExamInDB]:
    """Get all available exams for a candidate"""
    # Get candidate's institute
    candidate = db.query(Candidate).filter(Candidate.user_id == user_id).first()
    if not candidate:
        return []
    
    # Get all trainers in the same institute
    trainer_ids = [
        t[0] for t in 
        db.query(Trainer.user_id).filter(Trainer.institute_id == candidate.institute_id).all()
    ]
    
    # Get all exams for subjects taught by these trainers
    exams = db.query(Exam).join(Subject).filter(
        Subject.trainer_id.in_(trainer_ids)
    ).all()
    
    return [ExamInDB.from_orm(exam) for exam in exams]

def get_exam_questions(
    db: Session, 
    exam_id: UUID, 
    page: int = 1, 
    page_size: int = 10
) -> Dict:
    """Get paginated questions for an exam without correct answers"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam or not exam.csv_url:
        raise HTTPException(status_code=404, detail="Exam or questions not found")
    
    try:
        # Get the full file path
        file_path = get_file_path(exam.csv_url)
        print(f"DEBUG: Attempting to open file at: {file_path}")
        print(f"DEBUG: File exists? {file_path.exists()}")
        
        # Backup approach if file doesn't exist at the exact path
        if not file_path.exists():
            # Try direct path in uploads/exams
            alternate_path = Path(f"uploads/exams/{exam_id}/{exam.csv_url.split('/')[-1]}")
            print(f"DEBUG: Attempting alternate path: {alternate_path}")
            print(f"DEBUG: Alternate exists? {alternate_path.exists()}")
            
            if alternate_path.exists():
                file_path = alternate_path
        
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam CSV file not found at {file_path}"
            )
        
        # Read and parse CSV
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            all_questions = []
            for row in reader:
                # Skip empty rows
                if not row.get('question') or not row.get('correct_answer'):
                    continue
                    
                all_questions.append({
                    'question': row['question'],
                    'option_a': row['option_a'],
                    'option_b': row['option_b'],
                    'option_c': row['option_c'],
                    'option_d': row['option_d']
                })
            
            # Calculate pagination
            total = len(all_questions)
            total_pages = (total + page_size - 1) // page_size if total > 0 else 0
            page = min(page, total_pages) if total_pages > 0 else 0
            
            # Get paginated questions
            start_idx = (page - 1) * page_size if page > 0 else 0
            end_idx = start_idx + page_size
            paginated_questions = all_questions[start_idx:end_idx]
            
            print(f"DEBUG: Found {total} questions in CSV")
            
            return {
                'questions': paginated_questions,
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': total_pages
            }
    except Exception as e:
        import traceback
        print(f"DEBUG: Error reading exam questions: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading exam questions: {str(e)}"
        )

def get_exam_questions_with_answers(db: Session, exam_id: UUID) -> List[ExamQuestion]:
    """Get all questions for an exam with correct answers (for submission)"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam or not exam.csv_url:
        raise HTTPException(status_code=404, detail="Exam or questions not found")
    
    try:
        # Get the full file path
        file_path = get_file_path(exam.csv_url)
        print(f"DEBUG: Attempting to open file at: {file_path}")
        print(f"DEBUG: File exists? {file_path.exists()}")
        
        # Backup approach if file doesn't exist at the exact path
        if not file_path.exists():
            # Try direct path in uploads/exams
            alternate_path = Path(f"uploads/exams/{exam_id}/{exam.csv_url.split('/')[-1]}")
            print(f"DEBUG: Attempting alternate path: {alternate_path}")
            print(f"DEBUG: Alternate exists? {alternate_path.exists()}")
            
            if alternate_path.exists():
                file_path = alternate_path
        
        if not file_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam CSV file not found at {file_path}"
            )
        
        # Read and parse CSV
        with open(file_path, 'r') as f:
            reader = csv.DictReader(f)
            questions = []
            for row in reader:
                # Skip empty rows
                if not row.get('question') or not row.get('correct_answer'):
                    continue
                    
                questions.append(ExamQuestion(
                    question=row['question'],
                    option_a=row['option_a'],
                    option_b=row['option_b'],
                    option_c=row['option_c'],
                    option_d=row['option_d'],
                    correct_answer=row['correct_answer'].lower()  # Ensure lowercase
                ))
            
            print(f"DEBUG: Found {len(questions)} questions in CSV for submission")
            return questions
    except Exception as e:
        import traceback
        print(f"DEBUG: Error reading exam questions with answers: {str(e)}")
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading exam questions: {str(e)}"
        )

def submit_exam(db: Session, submission: ExamSubmission, user_id: UUID) -> ExamResult:
    """Submit an exam attempt and calculate score"""
    # Get exam questions with answers
    questions = get_exam_questions_with_answers(db, submission.exam_id)
    
    # Validate answers
    total_questions = len(questions)
    correct_answers = 0
    
    for i, question in enumerate(questions):
        question_id = str(i)  # Using index as question ID
        if question_id in submission.answers:
            user_answer = submission.answers[question_id].lower()
            if user_answer == question.correct_answer:
                correct_answers += 1
    
    # Calculate score
    score_percentage = (correct_answers / total_questions) * 100
    passed = score_percentage >= 40  # Passing threshold
    
    # Create exam attempt
    attempt = ExamAttempt(
        id=uuid4(),
        candidate_id=user_id,
        exam_id=submission.exam_id,
        score_percentage=score_percentage,
        passed=passed,
        answers=submission.answers,  # Store the answers
        attempted_on=datetime.utcnow()
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    
    # Check for course certificate
    check_course_certificate(db, submission.exam_id, user_id)
    
    return ExamResult(
        exam_id=submission.exam_id,
        score_percentage=score_percentage,
        passed=passed,
        total_questions=total_questions,
        correct_answers=correct_answers,
        attempted_on=attempt.attempted_on
    )

def get_exam_attempts(db: Session, user_id: UUID) -> List[ExamAttemptInDB]:
    """Get all exam attempts for a candidate"""
    attempts = db.query(ExamAttempt).filter(ExamAttempt.candidate_id == user_id).all()
    return [ExamAttemptInDB.from_orm(attempt) for attempt in attempts]

def get_certificates(db: Session, candidate_id: UUID) -> List[CourseCertificateInDB]:
    """Get all certificates for a candidate"""
    certificates = db.query(CourseCertificate).filter(
        CourseCertificate.candidate_id == candidate_id
    ).all()
    return [CourseCertificateInDB.from_orm(cert) for cert in certificates]

def get_candidate_progress(db: Session, candidate_id: UUID) -> dict:
    # Get candidate's institute
    candidate = db.query(Candidate).filter(Candidate.user_id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get total courses and subjects
    total_courses = db.query(Course).count()
    total_subjects = db.query(Subject).count()
    
    # Get completed subjects
    completed_subjects = db.query(ExamAttempt).filter(
        ExamAttempt.candidate_id == candidate_id,
        ExamAttempt.passed == True
    ).count()
    
    # Get earned certificates
    earned_certificates = db.query(CourseCertificate).filter(
        CourseCertificate.candidate_id == candidate_id
    ).count()
    
    return {
        "total_courses": total_courses,
        "total_subjects": total_subjects,
        "completed_subjects": completed_subjects,
        "earned_certificates": earned_certificates,
        "completion_percentage": (completed_subjects / total_subjects * 100) if total_subjects > 0 else 0
    }

def check_course_certificate(db: Session, exam_id: UUID, candidate_id: UUID) -> None:
    # Get the course for this exam
    exam = db.query(Exam).join(Subject).filter(Exam.id == exam_id).first()
    if not exam:
        return
    
    course_id = exam.subject.course_id
    
    # Check if candidate has passed all subjects in the course
    total_subjects = db.query(Subject).filter(Subject.course_id == course_id).count()
    passed_subjects = db.query(ExamAttempt).join(Exam).join(Subject).filter(
        ExamAttempt.candidate_id == candidate_id,
        ExamAttempt.passed == True,
        Subject.course_id == course_id
    ).count()
    
    # If all subjects passed and certificate not already issued
    if passed_subjects == total_subjects:
        existing_certificate = db.query(CourseCertificate).filter(
            CourseCertificate.candidate_id == candidate_id,
            CourseCertificate.course_id == course_id
        ).first()
        
        if not existing_certificate:
            # TODO: Generate certificate (PDF) and store it
            certificate_url = f"certificates/{candidate_id}/{course_id}.pdf"
            
            certificate = CourseCertificate(
                candidate_id=candidate_id,
                course_id=course_id,
                certificate_url=certificate_url
            )
            db.add(certificate)
            db.commit() 