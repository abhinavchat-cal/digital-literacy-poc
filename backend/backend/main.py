from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import settings
from backend.routers import auth, candidate, trainer, admin, institute

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
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
