"""
Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class JobStatus(str, Enum):
    """Job status enumeration."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


# ============================================================================
# Request Models
# ============================================================================


class XOAuthRequest(BaseModel):
    """Request model for X OAuth automation - Browser clicking service."""

    profile_name: str = Field(..., description="GoLogin profile name (e.g., '1234')")
    api_app: str = Field(..., description="API app to select from dropdown (e.g., 'AIOTT1')")

    class Config:
        json_schema_extra = {
            "example": {
                "profile_name": "1234",
                "api_app": "AIOTT1",
            }
        }


class AccountSetupRequest(BaseModel):
    """Request model for X account setup automation."""

    profile_id: str = Field(..., description="GoLogin profile ID")
    username: str = Field(..., description="X (Twitter) username")
    password: str = Field(..., description="X password")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")

    class Config:
        json_schema_extra = {
            "example": {
                "profile_id": "686e7a83d44e36ee50584179",
                "username": "testuser",
                "password": "SecurePass123!",
                "email": "user@example.com",
            }
        }


# ============================================================================
# Response Models
# ============================================================================


class JobResponse(BaseModel):
    """Response model for job creation."""

    job_id: str = Field(..., description="Unique job identifier")
    status: JobStatus = Field(..., description="Current job status")
    created_at: datetime = Field(..., description="Job creation timestamp")
    message: str = Field(default="Job created successfully")

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_123456789",
                "status": "pending",
                "created_at": "2025-09-30T10:00:00Z",
                "message": "Job created successfully",
            }
        }


class JobStatusResponse(BaseModel):
    """Response model for job status."""

    job_id: str
    status: JobStatus
    created_at: datetime
    updated_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    progress: int = Field(default=0, ge=0, le=100, description="Progress percentage")
    result: Optional[Dict[str, Any]] = Field(None, description="Job result data")
    error: Optional[str] = Field(None, description="Error message if failed")

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_123456789",
                "status": "completed",
                "created_at": "2025-09-30T10:00:00Z",
                "updated_at": "2025-09-30T10:05:00Z",
                "started_at": "2025-09-30T10:00:05Z",
                "completed_at": "2025-09-30T10:05:00Z",
                "progress": 100,
                "result": {
                    "success": True,
                    "oauth_completed": True,
                    "profile_id": "686e7a83d44e36ee50584179",
                },
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check."""

    status: str = Field(default="healthy")
    service: str
    version: str
    timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "service": "x-auth-service",
                "version": "0.1.0",
                "timestamp": "2025-09-30T10:00:00Z",
            }
        }


class ErrorResponse(BaseModel):
    """Response model for errors."""

    success: bool = False
    error_code: str
    error_message: str
    details: Optional[Dict[str, Any]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error_code": "GOLOGIN_ERROR",
                "error_message": "Failed to start GoLogin session",
                "details": {"profile_id": "686e7a83d44e36ee50584179"},
            }
        }
