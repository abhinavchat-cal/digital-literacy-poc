from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.core.config import settings
from backend.routers import auth, candidate, trainer, admin, institute

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Log CORS origins for debugging
logger.info(f"Configured CORS origins: {settings.BACKEND_CORS_ORIGINS}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(candidate.router, prefix="/api/v1/candidate", tags=["candidate"])
app.include_router(trainer.router, prefix="/api/v1/trainer", tags=["trainer"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(institute.router, prefix="/api/v1/institute", tags=["institute"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Digital Literacy Platform API",
        "version": settings.VERSION,
        "docs_url": "/docs"
    }
