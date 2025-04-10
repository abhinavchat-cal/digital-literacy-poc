from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.core.db import get_db
from backend.schemas.institute import InstituteCreate, InstituteInDB
from backend.services import institute as institute_service

router = APIRouter()

@router.post("/institutes", response_model=InstituteInDB, status_code=status.HTTP_201_CREATED)
async def create_institute(
    institute: InstituteCreate,
    db: Session = Depends(get_db)
):
    """Create a new institute"""
    return institute_service.create_institute(db, institute)

@router.get("/institutes", response_model=List[InstituteInDB])
async def list_institutes(
    db: Session = Depends(get_db)
):
    """List all institutes"""
    return institute_service.get_institutes(db) 