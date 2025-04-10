from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID, uuid4

from backend.models.user import User, Candidate, Trainer
from backend.models.institute import Institute
from backend.models.course import Course
from backend.models.exam import ExamAttempt, CourseCertificate
from backend.schemas.institute import InstituteCreate
from backend.schemas.course import CourseCreate, CourseInDB

def get_institutes(db: Session) -> List[Institute]:
    return db.query(Institute).all()

def create_institute(db: Session, institute: InstituteCreate) -> Institute:
    db_institute = Institute(**institute.dict())
    db.add(db_institute)
    db.commit()
    db.refresh(db_institute)
    return db_institute

def get_institute_stats(db: Session, institute_id: UUID) -> dict:
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    
    # Get basic counts
    total_candidates = db.query(Candidate).filter(Candidate.institute_id == institute_id).count()
    total_trainers = db.query(Trainer).filter(Trainer.institute_id == institute_id).count()
    
    # Get course completion stats
    total_courses = db.query(Course).count()
    completed_courses = db.query(CourseCertificate).join(
        Candidate, CourseCertificate.candidate_id == Candidate.user_id
    ).filter(Candidate.institute_id == institute_id).count()
    
    # Calculate pass rate
    total_attempts = db.query(ExamAttempt).join(
        Candidate, ExamAttempt.candidate_id == Candidate.user_id
    ).filter(Candidate.institute_id == institute_id).count()
    
    passed_attempts = db.query(ExamAttempt).join(
        Candidate, ExamAttempt.candidate_id == Candidate.user_id
    ).filter(
        Candidate.institute_id == institute_id,
        ExamAttempt.passed == True
    ).count()
    
    pass_rate = (passed_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    return {
        **institute.__dict__,
        "total_candidates": total_candidates,
        "total_trainers": total_trainers,
        "total_courses": total_courses,
        "completed_courses": completed_courses,
        "pass_rate": pass_rate
    }

def create_course(db: Session, course: CourseCreate, created_by: str) -> CourseInDB:
    """Create a new course"""
    # Convert HttpUrl to string
    pdf_url_str = str(course.pdf_url) if course.pdf_url else None
    
    db_course = Course(
        id=uuid4(),
        title=course.title,
        description=course.description,
        pdf_url=pdf_url_str,
        created_by=created_by
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return CourseInDB.from_orm(db_course)

def get_courses(db: Session) -> List[Course]:
    return db.query(Course).all()

def get_candidates(db: Session) -> List[User]:
    return db.query(User).join(Candidate).all()

def get_trainers(db: Session) -> List[User]:
    return db.query(User).join(Trainer).all()

def get_system_analytics(db: Session) -> dict:
    # Get total counts
    total_candidates = db.query(Candidate).count()
    total_trainers = db.query(Trainer).count()
    total_institutes = db.query(Institute).count()
    total_courses = db.query(Course).count()
    
    # Get exam statistics
    exam_stats = db.query(
        func.count(ExamAttempt.id).label('total_attempts'),
        func.avg(ExamAttempt.score_percentage).label('avg_score'),
        func.count(ExamAttempt.id).filter(ExamAttempt.passed == True).label('passed_attempts')
    ).first()
    
    # Get certificate statistics
    total_certificates = db.query(CourseCertificate).count()
    
    return {
        "total_candidates": total_candidates,
        "total_trainers": total_trainers,
        "total_institutes": total_institutes,
        "total_courses": total_courses,
        "total_exam_attempts": exam_stats.total_attempts,
        "average_exam_score": float(exam_stats.avg_score) if exam_stats.avg_score else 0,
        "pass_rate": (exam_stats.passed_attempts / exam_stats.total_attempts * 100) if exam_stats.total_attempts > 0 else 0,
        "total_certificates_issued": total_certificates
    } 