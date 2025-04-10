from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List

from backend.core.config import settings
from backend.core.security import verify_token
from backend.core.db import get_db
from backend.models.user import User
from backend.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token)
    if not token_data:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == token_data["sub"]).first()
    if not user:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Role-specific dependencies
require_admin = require_role(["admin"])
require_trainer = require_role(["trainer"])
require_candidate = require_role(["candidate"])
require_trainer_or_admin = require_role(["trainer", "admin"]) 