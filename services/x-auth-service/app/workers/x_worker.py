"""
X OAuth Automation Worker - Browser Clicking Service

This worker drives the X OAuth consent flow for AIOTT apps.
It generates the OAuth URL, ensures the profile is logged in,
clicks the authorize button, and confirms the callback redirect.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add project root to Python path to access shared module
project_root = Path(__file__).parent.parent.parent.parent.resolve()
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from app.models import XOAuthRequest, JobStatus
from shared.logging_config import get_logger

logger = get_logger(__name__)

# Constants
AIOTT_BASE_URL = os.getenv("AIOTT_BASE_URL", "https://aiott.pro").rstrip("/")
CALLBACK_URL_TEMPLATE = f"{AIOTT_BASE_URL}/oauth/callback/{{config_name}}"
CALLBACK_FALLBACK_PATHS = [
    f"{AIOTT_BASE_URL}/oauth/callback",
    f"{AIOTT_BASE_URL}/auth/twitter/oauth2/callback",
    f"{AIOTT_BASE_URL}/auth/twitter/oauth2/callback2",
]
TIMEOUT_SECONDS = 120  # 2 minutes


def run_x_oauth_automation(job_id: str, request: XOAuthRequest, jobs_store: dict):
    """
    Execute X OAuth authorization - BROWSER CLICKING ONLY.
    
    Supports two modes:
    1. Single account (all_accounts=False): Process one profile
    2. Bulk processing (all_accounts=True): Process all Connected accounts
    
    Args:
        job_id: Unique job identifier
        request: Contains profile_name, api_app, and all_accounts flag
        jobs_store: In-memory job storage
    """
    # FORCE console output
    import sys
    sys.stdout.flush()
    sys.stderr.flush()
    
    print(f"\n{'='*80}", flush=True)
    print(f"[WORKER] Starting OAuth automation for job {job_id}", flush=True)
    
    if request.all_accounts:
        print(f"[WORKER] Mode: BULK (All Connected Accounts)", flush=True)
    else:
        print(f"[WORKER] Mode: SINGLE", flush=True)
        print(f"[WORKER] Profile: {request.profile_name}", flush=True)
    
    print(f"[WORKER] API App: {request.api_app}", flush=True)
    print(f"{'='*80}\n", flush=True)
    
    logger.info(
        "Starting OAuth automation",
        extra={"job_id": job_id, "mode": "bulk" if request.all_accounts else "single", "api_app": request.api_app},
    )
    
    try:
        # Update job status to RUNNING
        jobs_store[job_id]["status"] = JobStatus.RUNNING
        jobs_store[job_id]["started_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["progress"] = 10

        from app.automation.selenium_oauth_automation import SeleniumOAuthAutomator

        gologin_token = os.getenv("GOLOGIN_TOKEN")
        if not gologin_token:
            raise ValueError("GOLOGIN_TOKEN environment variable is required for OAuth automation")

        db_path = (Path(__file__).parent.parent.parent.parent.parent / "twitter_accounts.db").resolve()
        automator = SeleniumOAuthAutomator(db_path=str(db_path), gologin_token=gologin_token)

        if request.all_accounts:
            # BULK MODE: Process all accounts with ONE profile
            if not request.profile_name:
                raise Exception("profile_name is required for bulk OAuth authorization")
            
            logger.info("[BULK OAUTH] Starting bulk OAuth authorization for all accounts")
            print(f"\n{'='*80}", flush=True)
            print(f"[BULK] Starting bulk OAuth authorization", flush=True)
            print(f"[BULK] Profile: {request.profile_name}", flush=True)
            print(f"[BULK] API App: {request.api_app}", flush=True)
            print(f"{'='*80}\n", flush=True)
            
            accounts = automator._get_all_accounts_for_bulk_oauth()
            if not accounts:
                raise Exception("No accounts with credentials found in database")
            
            total_accounts = len(accounts)
            successful = 0
            failed = 0
            results = []
            
            print(f"\n{'='*80}", flush=True)
            print(f"[BULK] Found {total_accounts} accounts to process", flush=True)
            print(f"{'='*80}\n", flush=True)
            
            # Call the NEW bulk method that opens browser ONCE
            try:
                bulk_result = automator.automate_bulk_oauth_with_single_browser(
                    profile_id=request.profile_name,
                    api_app=request.api_app,
                    accounts=accounts
                )
                
                return bulk_result
                
            except Exception as e:
                logger.error(f"[BULK OAUTH] Fatal error: {e}")
                raise Exception(f"Bulk OAuth automation failed: {str(e)}")
        
        else:
            # SINGLE MODE: Process one account
            if not request.profile_name:
                raise ValueError("profile_name is required when all_accounts is False")
            
            logger.info("[FLOW] Starting Selenium orchestrated OAuth flow", extra={"job_id": job_id})
            flow_result = automator.automate_oauth_for_profile(request.profile_name, request.api_app)

            if not flow_result.get("success"):
                raise Exception(flow_result.get("error", "OAuth automation failed"))

            jobs_store[job_id]["progress"] = 100
            jobs_store[job_id]["status"] = JobStatus.COMPLETED
            jobs_store[job_id]["completed_at"] = datetime.utcnow()
            jobs_store[job_id]["updated_at"] = datetime.utcnow()
            jobs_store[job_id]["result"] = {
                "success": True,
                "mode": "single",
                "message": "Authorization completed - button clicked and redirected to callback",
                "profile_name": request.profile_name,
                "api_app": request.api_app,
                "callback": flow_result.get("oauth_result", {}),
                "state": flow_result.get("state"),
            }

        logger.info("OAuth automation completed successfully", extra={"job_id": job_id})

    except Exception as e:
        # Mark job as failed
        error_message = str(e)
        
        # Determine error type
        if "2FA" in error_message.upper():
            error_code = "2FA_REQUIRED"
        elif "TIMEOUT" in error_message.upper():
            error_code = "TIMEOUT"
        elif "CLOUDFLARE" in error_message.upper():
            error_code = "CLOUDFLARE_FAILED"
        else:
            error_code = "AUTOMATION_ERROR"
        
        logger.error(
            "Browser automation failed",
            extra={
                "job_id": job_id,
                "profile_name": request.profile_name,
                "error_code": error_code,
                "error": error_message,
            },
            exc_info=True,
        )

        jobs_store[job_id]["status"] = JobStatus.FAILED
        jobs_store[job_id]["completed_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["error"] = error_message
        jobs_store[job_id]["result"] = {
            "success": False,
            "error_code": error_code,
            "error": error_message,
            "profile_name": request.profile_name,
        }
    
    finally:
        # Always close the browser
        logger.debug("Cleanup handled by SeleniumOAuthAutomator", extra={"job_id": job_id})