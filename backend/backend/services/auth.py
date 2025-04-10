from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from passlib.context import CryptContext
from uuid import uuid4
import logging

from backend.models.user import User, Candidate, Trainer
from backend.models.institute import Institute
from backend.schemas.user import UserCreate, UserInDB
from backend.core.security import get_password_hash, verify_password

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def get_user_by_email(db: Session, email: str) -> User:
    return db.query(User).filter(User.email == email).first()

def register_user(db: Session, user_data: UserCreate) -> UserInDB:
    logger.debug(f"Attempting to register user with data: {user_data.dict()}")
    
    # Check if institute exists for candidates and trainers
    if user_data.role in ["candidate", "trainer"]:
        logger.debug(f"Checking institute with ID: {user_data.institute_id}")
        institute = db.query(Institute).filter(Institute.id == user_data.institute_id).first()
        if not institute:
            logger.error(f"Institute not found with ID: {user_data.institute_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Institute not found"
            )
        logger.debug(f"Found institute: {institute.name}")

    # Create user
    try:
        db_user = User(
            id=uuid4(),
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            role=user_data.role,
            aadhaar_id=user_data.aadhaar_id,
            full_name=user_data.full_name
        )
        logger.debug("Created user object")
        
        db.add(db_user)
        db.flush()  # Flush to get the user ID without committing
        logger.debug(f"Flushed user with ID: {db_user.id}")

        # Create role-specific profile
        if user_data.role == "candidate":
            logger.debug("Creating candidate profile")
            candidate = Candidate(
                user_id=db_user.id,
                institute_id=user_data.institute_id,
                is_ekyc_verified=False
            )
            db.add(candidate)
        elif user_data.role == "trainer":
            logger.debug("Creating trainer profile")
            trainer = Trainer(
                user_id=db_user.id,
                institute_id=user_data.institute_id
            )
            db.add(trainer)

        db.commit()
        db.refresh(db_user)
        logger.debug("Successfully committed and refreshed user")
        return UserInDB.from_orm(db_user)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Integrity error during registration: {str(e)}")
        if "duplicate key value violates unique constraint" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email or Aadhaar ID already registered"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error during registration: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def is_first_admin(db: Session) -> bool:
    return db.query(User).filter(User.role == "admin").first() is None
