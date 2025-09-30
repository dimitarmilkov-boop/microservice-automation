"""
X OAuth Automation Worker - Browser Clicking Service

This worker clicks "Authorize app" button on AIOTT for X accounts.
NO OAuth token handling - just browser automation.
"""

import os
import time
from datetime import datetime
from app.models import XOAuthRequest, JobStatus
from shared.logging_config import get_logger

logger = get_logger(__name__)

# Constants
AIOTT_URL = "https://aiott.pro/accounts/add"
CALLBACK_URL_PATTERN = "aiott.pro/oauth/callback"
TIMEOUT_SECONDS = 120  # 2 minutes


def run_x_oauth_automation(job_id: str, request: XOAuthRequest, jobs_store: dict):
    """
    Execute X OAuth authorization - BROWSER CLICKING ONLY.
    
    Steps:
    1. Start GoLogin browser with profile_name
    2. Navigate to https://aiott.pro/accounts/add
    3. Select api_app from dropdown
    4. Click "Login using X" button
    5. Wait for X authorization page
    6. Click "Authorize app" button (multi-language detection)
    7. Detect redirect to callback URL
    8. Report success/failure
    
    Args:
        job_id: Unique job identifier
        request: Contains profile_name and api_app
        jobs_store: In-memory job storage
    """
    logger.info(
        "Starting browser clicking automation",
        extra={"job_id": job_id, "profile_name": request.profile_name, "api_app": request.api_app},
    )
    
    driver = None

    try:
        # Update job status to RUNNING
        jobs_store[job_id]["status"] = JobStatus.RUNNING
        jobs_store[job_id]["started_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["progress"] = 10

        # Import automation modules
        from app.automation.gologin_session_monitor import GoLoginSessionMonitor
        from app.automation.selenium_oauth_automation import SeleniumOAuthAutomation
        from app.automation.cloudflare_handler import CloudflareHandler
        
        # Step 1: Start GoLogin browser session
        logger.info("Step 1: Starting GoLogin browser", extra={"job_id": job_id, "profile_name": request.profile_name})
        
        session_monitor = GoLoginSessionMonitor(
            token=os.getenv("GOLOGIN_TOKEN"),
            profile_name=request.profile_name
        )
        
        driver = session_monitor.start_session()
        logger.info("Browser started successfully", extra={"job_id": job_id})
        jobs_store[job_id]["progress"] = 20

        # Step 2: Navigate to AIOTT
        logger.info("Step 2: Navigating to AIOTT", extra={"job_id": job_id, "url": AIOTT_URL})
        driver.get(AIOTT_URL)
        time.sleep(3)  # Wait for page load
        jobs_store[job_id]["progress"] = 30

        # Step 3: Check for Cloudflare challenge
        logger.info("Step 3: Checking for Cloudflare", extra={"job_id": job_id})
        cf_handler = CloudflareHandler(driver)
        if cf_handler.is_challenge_present():
            logger.info("Cloudflare detected, solving...", extra={"job_id": job_id})
            cf_result = cf_handler.handle_challenge_automatically()
            if not cf_result.get("success"):
                raise Exception(f"Cloudflare challenge failed: {cf_result.get('error')}")
        jobs_store[job_id]["progress"] = 40

        # Step 4: Select API app from dropdown
        logger.info("Step 4: Selecting API app", extra={"job_id": job_id, "api_app": request.api_app})
        # TODO: Find dropdown and select api_app
        # dropdown = driver.find_element(By.ID, "api-app-selector")
        # Select(dropdown).select_by_visible_text(request.api_app)
        jobs_store[job_id]["progress"] = 50

        # Step 5: Click "Login using X" button
        logger.info("Step 5: Clicking 'Login using X'", extra={"job_id": job_id})
        # TODO: Find and click the button
        # login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Login using X')]")
        # login_button.click()
        time.sleep(3)  # Wait for X authorization page
        jobs_store[job_id]["progress"] = 60

        # Step 6: Wait for X authorization page and click "Authorize app"
        logger.info("Step 6: Clicking 'Authorize app' on X", extra={"job_id": job_id})
        oauth_automation = SeleniumOAuthAutomation(driver)
        
        # Multi-language button detection
        authorize_result = oauth_automation.click_authorize_button()
        if not authorize_result.get("success"):
            raise Exception(f"Failed to click authorize: {authorize_result.get('error')}")
        
        jobs_store[job_id]["progress"] = 80

        # Step 7: Detect redirect to callback URL
        logger.info("Step 7: Waiting for callback redirect", extra={"job_id": job_id})
        start_time = time.time()
        callback_detected = False
        
        while time.time() - start_time < TIMEOUT_SECONDS:
            current_url = driver.current_url
            if CALLBACK_URL_PATTERN in current_url:
                callback_detected = True
                logger.info("Callback URL detected", extra={"job_id": job_id, "url": current_url})
                break
            time.sleep(1)
        
        if not callback_detected:
            raise Exception("TIMEOUT: Callback URL not detected within 2 minutes")
        
        jobs_store[job_id]["progress"] = 100

        # Mark job as completed
        jobs_store[job_id]["status"] = JobStatus.COMPLETED
        jobs_store[job_id]["completed_at"] = datetime.utcnow()
        jobs_store[job_id]["updated_at"] = datetime.utcnow()
        jobs_store[job_id]["result"] = {
            "success": True,
            "message": "Authorization completed - button clicked and redirected to callback",
            "profile_name": request.profile_name,
            "api_app": request.api_app,
        }

        logger.info(
            "Browser automation completed successfully",
            extra={"job_id": job_id, "profile_name": request.profile_name},
        )

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
        if driver:
            try:
                driver.quit()
                logger.info("Browser closed", extra={"job_id": job_id})
            except Exception as e:
                logger.warning("Error closing browser", extra={"job_id": job_id, "error": str(e)})