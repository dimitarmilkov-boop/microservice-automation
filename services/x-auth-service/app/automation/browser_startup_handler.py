#!/usr/bin/env python3
"""
Browser Startup Handler

Automatically handles post-launch tasks including Cloudflare challenge solving.
Runs automatically 20 seconds after any browser session starts.
Now includes automatic proxy rotation for persistent challenges.
"""

import time
import threading
import logging
import os
from typing import Dict, Any, Optional
from selenium import webdriver

# Import Cloudflare handler
try:
    from cloudflare_handler import CloudflareHandler
except ImportError:
    CloudflareHandler = None

# Import proxy manager and GoLogin integration
try:
    from proxy_manager import RoyalProxyManager, CloudflareProxyRotator
    from gologin_proxy_updater import IntegratedCloudflareProxyHandler
except ImportError:
    RoyalProxyManager = None
    CloudflareProxyRotator = None
    IntegratedCloudflareProxyHandler = None

class BrowserStartupHandler:
    """
    Handles automatic post-launch browser tasks including proxy rotation.
    """
    
    def __init__(self, gologin_token: str = None):
        self.logger = logging.getLogger(__name__)
        self.active_handlers = {}  # Track running handlers
        
        # Initialize proxy manager if credentials available
        self.proxy_manager = self._init_proxy_manager()
        
        # Initialize integrated handler if GoLogin token available
        if gologin_token and self.proxy_manager and IntegratedCloudflareProxyHandler:
            self.integrated_handler = IntegratedCloudflareProxyHandler(gologin_token, self.proxy_manager)
            self.logger.info("🔗 Initialized integrated GoLogin proxy handler")
        else:
            self.integrated_handler = None
            if not gologin_token:
                self.logger.warning("No GoLogin token provided - proxy updates will be manual")
            
        # Fallback to basic proxy rotator
        self.proxy_rotator = CloudflareProxyRotator(self.proxy_manager) if self.proxy_manager else None
        
    def _init_proxy_manager(self):
        """Initialize Royal Proxy manager if credentials are available."""
        try:
            if not RoyalProxyManager:
                self.logger.debug("RoyalProxyManager not available")
                return None
                
            username = os.getenv('ROYAL_PROXY_USERNAME')
            password = os.getenv('ROYAL_PROXY_PASSWORD')
            api_token = os.getenv('ROYAL_PROXY_API_TOKEN')
            
            if username and password:
                self.logger.info("Initializing Royal Proxy Manager")
                return RoyalProxyManager(username, password, api_token)
            else:
                self.logger.warning("Royal Proxy credentials not found in environment variables")
                return None
                
        except Exception as e:
            self.logger.error(f"Error initializing proxy manager: {e}")
            return None
        
    def schedule_post_launch_tasks(self, profile_id: str, driver: webdriver.Chrome, delay_seconds: int = 20) -> None:
        """
        Schedule post-launch tasks to run after a delay.
        
        Args:
            profile_id: GoLogin profile ID
            driver: Selenium WebDriver instance
            delay_seconds: Delay before running tasks (default: 20 seconds)
        """
        self.logger.info(f"Scheduling post-launch tasks for profile {profile_id} in {delay_seconds} seconds")
        
        # Cancel any existing handler for this profile
        if profile_id in self.active_handlers:
            self.active_handlers[profile_id].cancel()
        
        # Create new timer
        timer = threading.Timer(delay_seconds, self._execute_post_launch_tasks, args=[profile_id, driver])
        timer.daemon = True  # Dies with main thread
        timer.start()
        
        # Store timer for potential cancellation
        self.active_handlers[profile_id] = timer
        
    def _execute_post_launch_tasks(self, profile_id: str, driver: webdriver.Chrome) -> None:
        """
        Execute all post-launch tasks.
        """
        try:
            self.logger.info(f"Executing post-launch tasks for profile {profile_id}")
            
            # Task 1: Cloudflare Challenge Solving (with proxy rotation)
            self._handle_cloudflare_challenges(profile_id, driver)
            
            # Task 2: Basic Page Readiness Check
            self._check_page_readiness(profile_id, driver)
            
            # Task 3: Log Browser Status
            self._log_browser_status(profile_id, driver)
            
            self.logger.info(f"Post-launch tasks completed for profile {profile_id}")
            
        except Exception as e:
            self.logger.error(f"Error in post-launch tasks for profile {profile_id}: {e}")
        finally:
            # Clean up handler reference
            if profile_id in self.active_handlers:
                del self.active_handlers[profile_id]
    
    def _handle_cloudflare_challenges(self, profile_id: str, driver: webdriver.Chrome) -> None:
        """
        Navigate to X.com first, then check for and solve Cloudflare challenges.
        If challenges persist, automatically rotate proxy and suggest restart.
        """
        try:
            if not CloudflareHandler:
                self.logger.debug("CloudflareHandler not available, skipping challenge check")
                return
            
            # STEP 1: Check current location and navigate to X.com only if needed
            try:
                current_url = driver.current_url.lower()
                
                # If we're already on a Twitter/X.com page, don't navigate away
                if any(domain in current_url for domain in ['twitter.com', 'x.com']):
                    self.logger.info(f"📍 Already on X.com page: {current_url} - skipping navigation")
                    current_url = driver.current_url
                    page_title = driver.title
                    self.logger.info(f"✅ Current X.com location - URL: {current_url}, Title: {page_title}")
                else:
                    # Only navigate if we're not already on X.com
                    self.logger.info(f"📍 Navigating to X.com for profile {profile_id}")
                    driver.get("https://x.com")
                    time.sleep(3)  # Give page time to load
                    
                    current_url = driver.current_url
                    page_title = driver.title
                    self.logger.info(f"✅ Successfully navigated to X.com - URL: {current_url}, Title: {page_title}")
                
            except Exception as e:
                self.logger.warning(f"⚠️ Error during X.com navigation check for {profile_id}: {e}")
                # Continue anyway - might still be able to handle challenges
            
            # STEP 2: Check for Cloudflare challenges that may appear on X.com
            self.logger.info(f"🔍 Checking for Cloudflare challenges on profile {profile_id}")
            
            # Create Cloudflare handler with profile_id for spam detection
            cf_handler = CloudflareHandler(driver, profile_id=profile_id)
            
            # Check current page for challenges
            challenge_result = cf_handler.handle_challenge_automatically(max_attempts=2)
            
            # Handle the challenge result with proper None checks
            if challenge_result is None:
                self.logger.warning(f"⚠️ Profile {profile_id}: Challenge handler returned None - challenge may still be active")
                # Check if we're still on challenge page
                try:
                    current_url = driver.current_url
                    page_title = driver.title.lower()
                    
                    if '/account/access' in current_url or 'bir dakika' in page_title:
                        self.logger.info(f"🔄 Challenge still active for {profile_id} - triggering automatic proxy rotation")
                        self._handle_persistent_challenge_with_rotation(profile_id)
                except Exception as e:
                    self.logger.debug(f"Error checking challenge status: {e}")
                    
            elif challenge_result.get('success'):
                # Check if it was actually solved or no challenge was detected
                method = challenge_result.get('method', 'unknown')
                if method == 'no_challenge':
                    self.logger.debug(f"✅ Profile {profile_id}: No Cloudflare challenge detected on X.com")
                else:
                    self.logger.info(f"🎉 Profile {profile_id}: Cloudflare challenge solved on X.com - {challenge_result}")
            else:
                # Challenge failed
                reason = challenge_result.get('reason', 'Unknown error')
                self.logger.warning(f"❌ Profile {profile_id}: Cloudflare challenge failed on X.com - {reason}")
                
                # STEP 3: If challenge persists, trigger automatic proxy rotation
                if 'timeout' in reason.lower() or 'failed' in reason.lower():
                    self.logger.info(f"🔄 Challenge persisted for {profile_id} - triggering automatic proxy rotation")
                    self._handle_persistent_challenge_with_rotation(profile_id)
                
        except Exception as e:
            self.logger.error(f"Error handling X.com navigation and Cloudflare challenges for profile {profile_id}: {e}")
    
    def _handle_persistent_challenge_with_rotation(self, profile_id: str) -> None:
        """
        Handle persistent Cloudflare challenges with automatic proxy rotation.
        """
        try:
            self.logger.info(f"🚨 PERSISTENT CHALLENGE DETECTED for profile {profile_id}")
            
            # Use integrated handler if available (updates GoLogin profile via API)
            if self.integrated_handler:
                self.logger.info(f"🔗 Using integrated GoLogin proxy handler for {profile_id}")
                
                rotation_result = self.integrated_handler.handle_persistent_challenge(profile_id)
                
                # Check if we should terminate due to too many failures
                if rotation_result.get('should_terminate'):
                    self.logger.error(f"💀 TERMINATING SESSION for {profile_id} - Too many challenge failures")
                    self.logger.error(f"   📊 Attempts: {rotation_result.get('attempts_last_hour', 0)} in last hour")
                    self.logger.error(f"   🚫 Reason: {rotation_result.get('termination_reason', 'Maximum retry limit exceeded')}")
                    self.logger.error(f"AUTOMATION_ALERT: Profile {profile_id} - SESSION TERMINATED due to persistent challenges")
                    
                    # Terminate session with error
                    self._terminate_session_with_error(profile_id, rotation_result.get('termination_reason', 'Persistent Cloudflare challenges'))
                    return
                
                if rotation_result.get('success'):
                    self.logger.info(f"🎉 INTEGRATED ROTATION SUCCESS for {profile_id}")
                    self.logger.info(f"   🔄 {rotation_result.get('old_country', 'unknown')} → {rotation_result['new_country']}")
                    self.logger.info(f"   📍 New IP: {rotation_result.get('new_ip', 'testing...')}")
                    self.logger.info(f"   ✅ GoLogin profile updated automatically")
                    
                    # Critical restart message
                    self.logger.warning(f"🔄 CRITICAL: Browser session for {profile_id} MUST BE RESTARTED")
                    self.logger.warning(f"AUTOMATION_ALERT: Profile {profile_id} - proxy updated in GoLogin, restart required")
                    
                else:
                    error = rotation_result.get('error', 'Unknown error')
                    self.logger.error(f"❌ INTEGRATED ROTATION FAILED for {profile_id}: {error}")
                    
                    # Fallback to basic proxy rotation
                    if self.proxy_rotator:
                        self.logger.info(f"🔄 Falling back to basic proxy rotation for {profile_id}")
                        self._fallback_proxy_rotation(profile_id)
                    else:
                        self._handle_persistent_challenge(profile_id)  # Manual recommendations
                        
            # Fallback to basic proxy rotation (doesn't update GoLogin profile)
            elif self.proxy_rotator:
                self.logger.info(f"🔄 Using basic proxy rotation for {profile_id} (manual GoLogin update required)")
                self._fallback_proxy_rotation(profile_id)
            else:
                # No proxy rotation available - manual recommendations only
                self._handle_persistent_challenge(profile_id)
                
        except Exception as e:
            self.logger.error(f"Error handling persistent challenge with rotation for {profile_id}: {e}")
    
    def _fallback_proxy_rotation(self, profile_id: str) -> None:
        """
        Fallback proxy rotation that doesn't update GoLogin profile.
        """
        try:
            rotation_result = self.proxy_rotator.handle_persistent_challenge(profile_id)
            
            # Check if we should terminate due to too many failures
            if rotation_result.get('should_terminate'):
                self.logger.error(f"💀 TERMINATING SESSION for {profile_id} - Too many challenge failures (fallback)")
                self.logger.error(f"   📊 Attempts: {rotation_result.get('attempts_last_hour', 0)} in last hour")
                self.logger.error(f"   🚫 Reason: {rotation_result.get('termination_reason', 'Maximum retry limit exceeded')}")
                self.logger.error(f"AUTOMATION_ALERT: Profile {profile_id} - SESSION TERMINATED due to persistent challenges (fallback)")
                
                # Terminate session with error
                self._terminate_session_with_error(profile_id, rotation_result.get('termination_reason', 'Persistent Cloudflare challenges (fallback)'))
                return
            
            if rotation_result.get('success'):
                new_country = rotation_result.get('new_country')
                new_session = rotation_result.get('new_session')
                proxy_test = rotation_result.get('proxy_test', {})
                
                self.logger.info(f"✅ Basic proxy rotation successful for {profile_id}")
                self.logger.info(f"   🌍 New location: {new_country}")
                self.logger.info(f"   🔗 New session: {new_session}")
                
                if proxy_test.get('success'):
                    new_ip = proxy_test.get('ip')
                    self.logger.info(f"   📍 New IP confirmed: {new_ip}")
                
                # Manual update required
                self.logger.warning(f"⚠️ MANUAL ACTION REQUIRED for {profile_id}:")
                self.logger.warning(f"   1. Update GoLogin profile proxy to: {new_country}")
                self.logger.warning(f"   2. Restart browser session")
                self.logger.warning(f"AUTOMATION_ALERT: Profile {profile_id} - proxy rotated, manual GoLogin update required")
                
            else:
                error = rotation_result.get('error', 'Unknown error')
                self.logger.error(f"❌ Basic proxy rotation failed for {profile_id}: {error}")
                self._handle_persistent_challenge(profile_id)  # Manual recommendations
                
        except Exception as e:
            self.logger.error(f"Error in fallback proxy rotation for {profile_id}: {e}")
    
    def _handle_persistent_challenge(self, profile_id: str) -> None:
        """
        Handle persistent Cloudflare challenges by suggesting manual intervention.
        """
        try:
            self.logger.info(f"🚨 PERSISTENT CHALLENGE DETECTED for profile {profile_id}")
            self.logger.info(f"💡 RECOMMENDED ACTIONS:")
            self.logger.info(f"   1. 🔄 Change proxy/IP address for this profile")
            self.logger.info(f"   2. 🔄 Restart browser session to get fresh fingerprint")
            self.logger.info(f"   3. ⏰ Wait 5-10 minutes before retrying")
            self.logger.info(f"   4. 🌍 Consider using different geographic location")
            
            # Store the challenge persistence info for the session manager
            challenge_info = {
                'profile_id': profile_id,
                'persistent_challenge_detected': True,
                'timestamp': time.time(),
                'recommended_action': 'proxy_change_and_restart'
            }
            
            # Log to help with automation decisions
            self.logger.warning(f"AUTOMATION_ALERT: Profile {profile_id} requires manual intervention - persistent Cloudflare challenge")
            
        except Exception as e:
            self.logger.error(f"Error handling persistent challenge for {profile_id}: {e}")
    
    def _check_page_readiness(self, profile_id: str, driver: webdriver.Chrome) -> None:
        """
        Check if page is ready for automation.
        """
        try:
            # Check if page is loaded
            ready_state = driver.execute_script("return document.readyState")
            current_url = driver.current_url
            
            self.logger.info(f"Profile {profile_id}: Page readiness - State: {ready_state}, URL: {current_url}")
            
            # Wait for page to be complete if not already
            if ready_state != 'complete':
                self.logger.info(f"Profile {profile_id}: Waiting for page to complete loading...")
                
                # Wait up to 15 seconds for page to complete
                for _ in range(15):
                    time.sleep(1)
                    ready_state = driver.execute_script("return document.readyState")
                    if ready_state == 'complete':
                        break
                
                self.logger.info(f"Profile {profile_id}: Final page state: {ready_state}")
            
        except Exception as e:
            self.logger.error(f"Error checking page readiness for profile {profile_id}: {e}")
    
    def _log_browser_status(self, profile_id: str, driver: webdriver.Chrome) -> None:
        """
        Log browser status and basic information.
        """
        try:
            current_url = driver.current_url
            title = driver.title
            user_agent = driver.execute_script("return navigator.userAgent")
            
            # Check for common indicators
            status_info = {
                'url': current_url,
                'title': title[:100] + '...' if len(title) > 100 else title,
                'user_agent': user_agent[:100] + '...' if len(user_agent) > 100 else user_agent,
                'window_handles': len(driver.window_handles),
                'ready_for_automation': True
            }
            
            # Check for error pages or issues
            if any(indicator in current_url.lower() for indicator in ['error', 'blocked', 'denied']):
                status_info['ready_for_automation'] = False
                status_info['issue'] = 'Error page detected'
            
            if any(indicator in title.lower() for indicator in ['error', 'blocked', 'access denied']):
                status_info['ready_for_automation'] = False
                status_info['issue'] = 'Error in page title'
            
            self.logger.info(f"Profile {profile_id}: Browser status - {status_info}")
            
        except Exception as e:
            self.logger.error(f"Error logging browser status for profile {profile_id}: {e}")
    
    def cancel_tasks_for_profile(self, profile_id: str) -> None:
        """
        Cancel any pending tasks for a profile.
        """
        if profile_id in self.active_handlers:
            self.logger.info(f"Cancelling post-launch tasks for profile {profile_id}")
            self.active_handlers[profile_id].cancel()
            del self.active_handlers[profile_id]
    
    def get_active_handlers(self) -> Dict[str, Any]:
        """
        Get information about active handlers.
        """
        return {
            profile_id: {
                'is_alive': handler.is_alive(),
                'remaining_time': getattr(handler, 'interval', 0) if handler.is_alive() else 0
            }
            for profile_id, handler in self.active_handlers.items()
        }

    def _terminate_session_with_error(self, profile_id: str, reason: str) -> None:
        """
        Terminate a session with an error due to persistent challenges.
        """
        try:
            self.logger.error(f"💀 TERMINATING SESSION: {profile_id}")
            self.logger.error(f"   🚫 Reason: {reason}")
            self.logger.error(f"   ⏰ Timestamp: {time.time()}")
            
            # Try to stop the session cleanly if possible
            try:
                # Import here to avoid circular imports
                from global_gologin_session_manager import GlobalGoLoginSessionManager
                session_manager = GlobalGoLoginSessionManager.get_instance()
                
                stop_result = session_manager.stop_local_session(profile_id, cleanup=True)
                if stop_result.get('success'):
                    self.logger.info(f"✅ Successfully stopped session for {profile_id}")
                else:
                    self.logger.warning(f"⚠️ Could not cleanly stop session for {profile_id}: {stop_result}")
                    
            except Exception as e:
                self.logger.error(f"Error stopping session for {profile_id}: {e}")
            
            # Log termination for monitoring/automation systems
            self.logger.error(f"SESSION_TERMINATION_ALERT: {profile_id} - {reason}")
            
            # Store termination info for potential analysis
            termination_info = {
                'profile_id': profile_id,
                'reason': reason,
                'timestamp': time.time(),
                'action': 'session_terminated',
                'status': 'failed_persistent_challenges'
            }
            
            self.logger.error(f"TERMINATION_DATA: {termination_info}")
            
        except Exception as e:
            self.logger.error(f"Error terminating session for {profile_id}: {e}")

# Global instance for use across the application
startup_handler = BrowserStartupHandler() 