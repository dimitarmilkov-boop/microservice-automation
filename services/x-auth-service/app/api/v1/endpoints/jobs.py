"""
Job management endpoints.
"""

from fastapi import APIRouter, HTTPException, status
from app.models import JobStatusResponse
from shared.logging_config import get_logger

# Reference jobs_store via the auth module to avoid stale copies after reloads
# TODO: Replace with proper database
import app.api.v1.endpoints.auth as auth

logger = get_logger(__name__)
router = APIRouter()


@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get status of an automation job.

    Args:
        job_id: Unique job identifier

    Returns:
        Detailed job status including progress and results

    Raises:
        404: Job not found
    """
    logger.info("Job status requested", extra={"job_id": job_id})

    # Get job from store (always reference current module state)
    job_data = getattr(auth, "jobs_store", {}).get(job_id)

    if not job_data:
        logger.warning("Job not found", extra={"job_id": job_id})
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found",
        )

    # Build response
    response = JobStatusResponse(
        job_id=job_data["job_id"],
        status=job_data["status"],
        created_at=job_data["created_at"],
        updated_at=job_data["updated_at"],
        started_at=job_data.get("started_at"),
        completed_at=job_data.get("completed_at"),
        progress=job_data.get("progress", 0),
        result=job_data.get("result"),
        error=job_data.get("error"),
    )

    return response


@router.delete("/{job_id}")
async def cancel_job(job_id: str):
    """
    Cancel a running job.

    Args:
        job_id: Unique job identifier

    Returns:
        Cancellation confirmation

    Raises:
        404: Job not found
    """
    logger.info("Job cancellation requested", extra={"job_id": job_id})

    # Get job from store (always reference current module state)
    job_data = getattr(auth, "jobs_store", {}).get(job_id)

    if not job_data:
        logger.warning("Job not found", extra={"job_id": job_id})
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found",
        )

    # TODO: Implement actual job cancellation logic
    # For now, just update status
    from app.models import JobStatus
    from datetime import datetime

    job_data["status"] = JobStatus.CANCELLED
    job_data["updated_at"] = datetime.utcnow()

    logger.info("Job cancelled", extra={"job_id": job_id})

    return {
        "success": True,
        "message": f"Job {job_id} cancelled",
        "job_id": job_id,
    }
