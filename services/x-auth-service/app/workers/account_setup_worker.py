"""
Account Setup Automation Worker

This worker handles X (Twitter) account login using browser automation.
Logs DISCONNECTED users into X and marks them as "Connected" in the database.
"""

import os
from pathlib import Path
from datetime import datetime
from app.models import AccountSetupRequest, JobStatus
from shared.logging_config import get_logger

logger = get_logger(__name__)


def run_account_setup_automation(
    job_id: str, request: AccountSetupRequest, jobs_store: dict
):
    """
    Execute X account login automation for DISCONNECTED users.

    This function:
    1. Gets all DISCONNECTED users from the database
    2. Starts GoLogin browser session
    3. Logs each user into X (with 2FA handling)
    4. Marks successfully logged-in users as "Connected"
    5. Returns summary of login attempts

    Args:
        job_id: Unique job identifier
        request: Account setup request (contains profile_id)
        jobs_store: Reference to jobs storage (temporary, will be DB)
    """
    logger.info(
        "Starting account setup automation worker (X login for DISCONNECTED users)",
        extra={"job_id": job_id, "profile_id": request.profile_id},
    )

    try:
        # Update job status to RUNNING
        jobs_store[job_id]["status"] = JobStatus.RUNNING
        jobs_store[job_id]["started_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["progress"] = 10

        # Import automation module and config
        from app.automation.selenium_oauth_automation import SeleniumOAuthAutomator
        from app.config import settings
        
        # Get database path (project root directory)
        db_path = Path(__file__).parent.parent.parent.parent / "twitter_accounts.db"
        logger.info(f"Using database: {db_path}", extra={"job_id": job_id})
        
        jobs_store[job_id]["progress"] = 20

        # Initialize automator with token from config
        logger.info("Initializing OAuth automator", extra={"job_id": job_id})
        automator = SeleniumOAuthAutomator(
            db_path=str(db_path),
            gologin_token=settings.gologin_token
        )
        jobs_store[job_id]["progress"] = 30

        # Run bulk user login automation
        logger.info(
            "Starting bulk user login for DISCONNECTED accounts",
            extra={"job_id": job_id, "profile_id": request.profile_id}
        )
        result = automator.automate_bulk_user_login(profile_id=request.profile_id)
        jobs_store[job_id]["progress"] = 90

        # Check result
        if not result.get('success'):
            raise Exception(result.get('error', 'Unknown error during bulk login'))

        # Mark job as completed
        jobs_store[job_id]["status"] = JobStatus.COMPLETED
        jobs_store[job_id]["completed_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["progress"] = 100
        jobs_store[job_id]["result"] = {
            "success": True,
            "message": f"Account setup completed: {result['successful_logins']}/{result['total_users']} users logged in",
            "profile_id": request.profile_id,
            "total_users": result['total_users'],
            "successful_logins": result['successful_logins'],
            "failed_logins": result['failed_logins'],
            "login_results": result.get('login_results', []),
        }

        logger.info(
            "Account setup automation completed successfully",
            extra={
                "job_id": job_id,
                "profile_id": request.profile_id,
                "successful_logins": result['successful_logins'],
                "failed_logins": result['failed_logins'],
            },
        )

    except Exception as e:
        # Mark job as failed
        logger.error(
            "Account setup automation failed",
            extra={
                "job_id": job_id,
                "profile_id": request.profile_id,
                "error": str(e),
            },
            exc_info=True,
        )

        jobs_store[job_id]["status"] = JobStatus.FAILED
        jobs_store[job_id]["completed_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["error"] = str(e)
        jobs_store[job_id]["result"] = {
            "success": False,
            "error": str(e),
            "profile_id": request.profile_id,
        }
