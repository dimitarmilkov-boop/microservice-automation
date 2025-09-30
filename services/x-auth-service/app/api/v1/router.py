"""
API v1 Router - Combines all v1 endpoints.
"""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, jobs, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
