from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    aadhaar_id: str = Field(pattern=r'^[0-9]{12}$')
    role: str

class UserCreate(UserBase):
    password: str
    institute_id: Optional[UUID] = None

    @validator('institute_id')
    def validate_institute_id(cls, v, values):
        # For candidates and trainers, institute_id is required
        if 'role' in values and values['role'] in ['candidate', 'trainer'] and not v:
            raise ValueError('institute_id is required for candidates and trainers')
        
        # For admin role, institute_id should be None
        if 'role' in values and values['role'] == 'admin':
            return None
            
        return v

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: UUID
    created_at: datetime
    hashed_password: str

    class Config:
        from_attributes = True

class User(UserBase):
    id: UUID
    created_at: datetime
    is_ekyc_verified: Optional[bool] = None  # Only for candidates

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
