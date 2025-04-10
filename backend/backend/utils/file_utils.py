from pathlib import Path
from typing import Optional
from fastapi import UploadFile
import shutil
import os
from uuid import UUID

from backend.core.config import settings

def get_file_path(relative_path: str) -> Path:
    """
    Get the full file path from a relative path.
    
    Args:
        relative_path: Path relative to UPLOAD_BASE_DIR
    
    Returns:
        Path: Full path to the file
    """
    full_path = settings.UPLOAD_BASE_DIR / relative_path
    print(f"DEBUG get_file_path: relative_path={relative_path}, UPLOAD_BASE_DIR={settings.UPLOAD_BASE_DIR}, full_path={full_path}")
    print(f"DEBUG get_file_path: Does file exist? {full_path.exists()}")
    return full_path

def save_uploaded_file(
    file: UploadFile,
    base_dir: Path,
    sub_dir: Optional[str] = None,
    filename: Optional[str] = None
) -> str:
    """
    Save an uploaded file to the specified directory.
    
    Args:
        file: The uploaded file
        base_dir: Base directory for storage
        sub_dir: Optional subdirectory within base_dir
        filename: Optional custom filename, otherwise uses original filename
    
    Returns:
        str: The relative path to the saved file
    """
    # Create the full directory path
    if sub_dir:
        save_dir = base_dir / sub_dir
    else:
        save_dir = base_dir
    
    # Ensure directory exists
    save_dir.mkdir(parents=True, exist_ok=True)
    
    # Use original filename if none provided
    if not filename:
        filename = file.filename
    
    # Create the full file path
    file_path = save_dir / filename
    
    # Save the file
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return the relative path
    return str(file_path.relative_to(settings.UPLOAD_BASE_DIR))

def save_exam_file(file: UploadFile, exam_id: UUID, trainer_id: UUID) -> str:
    """Save an exam file in the exam-specific directory"""
    sub_dir = f"{trainer_id}/{exam_id}"
    return save_uploaded_file(
        file=file,
        base_dir=settings.EXAM_FILES_DIR,
        sub_dir=sub_dir
    )

def save_trainer_file(file: UploadFile, trainer_id: UUID) -> str:
    """Save a trainer-specific file"""
    return save_uploaded_file(
        file=file,
        base_dir=settings.TRAINER_FILES_DIR,
        sub_dir=str(trainer_id)
    )

def save_institute_file(file: UploadFile, institute_id: UUID) -> str:
    """Save an institute-specific file"""
    return save_uploaded_file(
        file=file,
        base_dir=settings.INSTITUTE_FILES_DIR,
        sub_dir=str(institute_id)
    )

def delete_file(file_path: str) -> bool:
    """
    Delete a file from the uploads directory.
    
    Args:
        file_path: Relative path to the file from UPLOAD_BASE_DIR
    
    Returns:
        bool: True if file was deleted, False if file didn't exist
    """
    full_path = settings.UPLOAD_BASE_DIR / file_path
    try:
        full_path.unlink()
        return True
    except FileNotFoundError:
        return False 