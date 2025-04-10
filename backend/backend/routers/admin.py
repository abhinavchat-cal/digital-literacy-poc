from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core.db import get_db
from backend.core.dependencies import require_admin
from backend.models.user import User
from backend.models.institute import Institute
from backend.models.course import Course
from backend.schemas.user import User as UserSchema
from backend.schemas.institute import InstituteCreate, InstituteInDB, InstituteWithStats
from backend.schemas.course import CourseCreate, CourseInDB, CourseWithSubjects
from backend.services import admin as admin_service

router = APIRouter()

@router.get("/admin/institutes", response_model=List[InstituteInDB])
async def list_institutes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all registered institutes"""
    return admin_service.get_institutes(db)

@router.post("/admin/institutes", response_model=InstituteInDB, status_code=status.HTTP_201_CREATED)
async def create_institute(
    institute: InstituteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new institute"""
    return admin_service.create_institute(db, institute)

@router.get("/admin/institutes/{institute_id}", response_model=InstituteWithStats)
async def get_institute_stats(
    institute_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get detailed statistics for an institute"""
    return admin_service.get_institute_stats(db, institute_id)

@router.post("/admin/courses", response_model=CourseInDB, status_code=status.HTTP_201_CREATED)
async def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new course"""
    return admin_service.create_course(db, course, current_user.id)

@router.get("/admin/courses", response_model=List[CourseWithSubjects])
async def list_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all courses with their subjects"""
    return admin_service.get_courses(db)

@router.get("/admin/candidates", response_model=List[UserSchema])
async def list_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all registered candidates"""
    return admin_service.get_candidates(db)

@router.get("/admin/trainers", response_model=List[UserSchema])
async def list_trainers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List all registered trainers"""
    return admin_service.get_trainers(db)

@router.get("/admin/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get system-wide analytics"""
    return admin_service.get_system_analytics(db)
