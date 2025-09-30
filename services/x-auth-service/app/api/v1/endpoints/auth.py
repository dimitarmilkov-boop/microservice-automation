"""
Authentication automation endpoints.
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from datetime import datetime
import uuid
from app.models import (
    XOAuthRequest,
    AccountSetupRequest,
    JobResponse,
    JobStatus,
)
from shared.logging_config import get_logger
from app.workers.x_worker import run_x_oauth_automation
from app.workers.account_setup_worker import run_account_setup_automation

logger = get_logger(__name__)
router = APIRouter()

# Temporary in-memory job storage (will be replaced with database)
jobs_store = {}


@router.post("/x-oauth", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
async def x_oauth_automation(
    request: XOAuthRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start X OAuth authorization automation.

    This endpoint triggers browser automation to:
    1. Start GoLogin session with specified profile
    2. Navigate to authorization URL
    3. Complete OAuth authorization flow
    4. Handle Cloudflare challenges if present

    Args:
        request: OAuth automation request with profile_id and authorization details

    Returns:
        Job information with job_id for status tracking
    """
    logger.info(
        "X OAuth automation requested",
        extra={
            "profile_name": request.profile_name,
            "api_app": request.api_app,
        },
    )

    # Generate job ID
    job_id = f"job_{uuid.uuid4().hex[:12]}"

    # Create job record
    job_data = {
        "job_id": job_id,
        "type": "x_oauth",
        "status": JobStatus.PENDING,
        "request": request.model_dump(),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    jobs_store[job_id] = job_data

    # Add background task to run automation
    background_tasks.add_task(run_x_oauth_automation, job_id, request, jobs_store)

    logger.info(
        "X OAuth job created",
        extra={"job_id": job_id, "profile_name": request.profile_name},
    )

    return JobResponse(
        job_id=job_id,
        status=JobStatus.PENDING,
        created_at=job_data["created_at"],
        message="X OAuth automation job created. Use /jobs/{job_id} to track status.",
    )


@router.post(
    "/account-setup",
    response_model=JobResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def account_setup_automation(
    request: AccountSetupRequest,
    background_tasks: BackgroundTasks,
):
    """
    Start X account setup automation.

    This endpoint triggers browser automation to:
    1. Start GoLogin session with specified profile
    2. Navigate to X (Twitter)
    3. Create/setup account with provided credentials
    4. Handle verification steps

    Args:
        request: Account setup request with profile and credential details

    Returns:
        Job information with job_id for status tracking
    """
    logger.info(
        "Account setup automation requested",
        extra={
            "profile_id": request.profile_id,
            "username": request.username,
        },
    )

    # Generate job ID
    job_id = f"job_{uuid.uuid4().hex[:12]}"

    # Create job record
    job_data = {
        "job_id": job_id,
        "type": "account_setup",
        "status": JobStatus.PENDING,
        "request": request.model_dump(exclude={"password"}),  # Don't store password in logs
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    jobs_store[job_id] = job_data

    # Add background task to run automation
    background_tasks.add_task(run_account_setup_automation, job_id, request, jobs_store)

    logger.info(
        "Account setup job created",
        extra={"job_id": job_id, "profile_id": request.profile_id},
    )

    return JobResponse(
        job_id=job_id,
        status=JobStatus.PENDING,
        created_at=job_data["created_at"],
        message="Account setup automation job created. Use /jobs/{job_id} to track status.",
    )
