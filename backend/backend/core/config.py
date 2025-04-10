from pydantic_settings import BaseSettings
from typing import Optional, List, Union
from pydantic import AnyHttpUrl, validator, model_validator
import os
from pathlib import Path


class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Literacy Campaign"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "digital_literacy"
    SQLALCHEMY_DATABASE_URL: Optional[str] = None

    # JWT
    SECRET_KEY: str = "your-secret-key-for-jwt"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    CORS_ORIGINS: Optional[str] = None
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # File Storage Configuration
    UPLOAD_BASE_DIR: Path = Path("uploads")
    EXAM_FILES_DIR: Path = UPLOAD_BASE_DIR / "exams"
    TRAINER_FILES_DIR: Path = UPLOAD_BASE_DIR / "trainers"
    INSTITUTE_FILES_DIR: Path = UPLOAD_BASE_DIR / "institutes"
    
    @model_validator(mode="after")
    def set_dynamic_fields_and_dirs(self):
        # Construct DB URL if not provided
        if not self.SQLALCHEMY_DATABASE_URL:
            self.SQLALCHEMY_DATABASE_URL = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
                f"{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
            )

        # Update CORS_ORIGINS if provided
        if self.CORS_ORIGINS:
            self.BACKEND_CORS_ORIGINS = [i.strip() for i in self.CORS_ORIGINS.split(",")]

        # Create upload directories
        for path in [
            self.UPLOAD_BASE_DIR,
            self.EXAM_FILES_DIR,
            self.TRAINER_FILES_DIR,
            self.INSTITUTE_FILES_DIR,
        ]:
            path.mkdir(parents=True, exist_ok=True)

        return self

settings = Settings()
