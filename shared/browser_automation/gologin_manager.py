"""
Centralized GoLogin Management

Provides reusable GoLogin browser automation utilities for all services.
Handles profile launching, session management, and cleanup.
"""

import os
import sys
import io
import time
import tempfile
import shutil
import logging
from typing import Optional, Dict, Any
from gologin import GoLogin
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.core.os_manager import ChromeType


class GoLoginManager:
    """
    Manages GoLogin browser profiles and Selenium connections.
    
    Supports both cloud and local execution modes.
    """
    
    def __init__(self, gologin_token: Optional[str] = None, local_mode: bool = None):
        """
        Initialize GoLogin Manager.
        
        Args:
            gologin_token: GoLogin API token (defaults to GOLOGIN_TOKEN env var)
            local_mode: Use local Orbita instance (defaults to GOLOGIN_LOCAL_MODE env var)
        """
        self.logger = logging.getLogger(self.__class__.__name__)
        
        # Get GoLogin token
        self.gologin_token = gologin_token or os.getenv('GOLOGIN_TOKEN')
        if not self.gologin_token:
            raise ValueError("GOLOGIN_TOKEN must be provided as parameter or environment variable")
        
        # Determine execution mode
        if local_mode is None:
            local_mode_env = os.getenv('GOLOGIN_LOCAL_MODE', 'false').strip().lower()
            self.use_local_mode = local_mode_env in {'1', 'true', 'yes', 'on'}
        else:
            self.use_local_mode = local_mode
        
        self.logger.info(f"GoLogin Manager initialized - Mode: {'LOCAL' if self.use_local_mode else 'CLOUD'}")
    
    def start_session(self, profile_id: str, headless: bool = False) -> Optional[Dict[str, Any]]:
        """
        Start a GoLogin browser session and connect Selenium.
        
        Args:
            profile_id: GoLogin profile ID
            headless: Run browser in headless mode
            
        Returns:
            Dictionary containing:
                - driver: Selenium WebDriver instance
                - gl: GoLogin instance
                - tmpdir: Temporary directory path
                - debugger_address: Browser debugger address
            Returns None if session fails to start
        """
        gl = None
        tmpdir = None
        
        try:
            # Create temporary directory
            tmpdir = tempfile.mkdtemp(prefix="gologin_")
            self.logger.info(f"Created temp directory: {tmpdir}")
            
            # Prepare GoLogin configuration
            gl_config = {
                "token": self.gologin_token,
                "profile_id": profile_id,
                "tmpdir": tmpdir,
            }
            
            if self.use_local_mode:
                gl_config["local"] = True
                self.logger.info("Using LOCAL mode - connecting to Orbita on this machine")
            
            # Fix UTF-8 encoding for international characters
            self._fix_encoding()
            
            # Initialize GoLogin
            self.logger.info(f"Initializing GoLogin with profile: {profile_id}")
            gl = GoLogin(gl_config)
            
            # Start browser session
            self.logger.info("Starting browser session...")
            debugger_address = gl.start()
            
            if not debugger_address:
                self.logger.error("Failed to start GoLogin session - no debugger address returned")
                return None
            
            self.logger.info(f"Browser started successfully - Debugger: {debugger_address}")
            
            # Wait for browser to stabilize
            stabilization_time = 15
            self.logger.info(f"Waiting {stabilization_time}s for browser to stabilize...")
            time.sleep(stabilization_time)
            
            # Connect Selenium
            driver = self._connect_selenium(debugger_address)
            if not driver:
                self.logger.error("Failed to connect Selenium to browser")
                gl.stop()
                shutil.rmtree(tmpdir, ignore_errors=True)
                return None
            
            self.logger.info("GoLogin session ready!")
            
            return {
                'driver': driver,
                'gl': gl,
                'tmpdir': tmpdir,
                'debugger_address': debugger_address,
            }
        
        except Exception as e:
            self.logger.error(f"Error starting GoLogin session: {e}", exc_info=True)
            
            # Cleanup on error
            if gl:
                try:
                    gl.stop()
                except Exception:
                    pass
            
            if tmpdir:
                shutil.rmtree(tmpdir, ignore_errors=True)
            
            return None
    
    def _connect_selenium(self, debugger_address: str, max_retries: int = 3) -> Optional[webdriver.Chrome]:
        """
        Connect Selenium WebDriver to the GoLogin browser.
        Uses webdriver-manager to automatically download matching ChromeDriver version.
        
        Args:
            debugger_address: Browser debugger address (e.g., "127.0.0.1:9222")
            max_retries: Number of connection attempts
            
        Returns:
            WebDriver instance or None if connection fails
        """
        for attempt in range(1, max_retries + 1):
            try:
                self.logger.info(f"Connecting Selenium to {debugger_address} (attempt {attempt}/{max_retries})")
                
                chrome_options = Options()
                chrome_options.add_experimental_option("debuggerAddress", debugger_address)
                
                # Additional stability options
                chrome_options.add_argument("--no-first-run")
                chrome_options.add_argument("--no-default-browser-check")
                chrome_options.add_argument("--disable-blink-features=AutomationControlled")
                
                # Use webdriver-manager to get matching ChromeDriver
                # This automatically downloads the correct version for the browser
                try:
                    service = Service(ChromeDriverManager(chrome_type=ChromeType.CHROMIUM).install())
                    driver = webdriver.Chrome(service=service, options=chrome_options)
                except Exception as wdm_error:
                    # Fallback: try without specifying chrome_type
                    self.logger.warning(f"ChromeDriverManager with CHROMIUM failed, trying default: {wdm_error}")
                    service = Service(ChromeDriverManager().install())
                    driver = webdriver.Chrome(service=service, options=chrome_options)
                
                # Test connection
                driver.current_url
                
                self.logger.info("Selenium connected successfully")
                return driver
            
            except WebDriverException as e:
                self.logger.warning(f"Selenium connection attempt {attempt} failed: {e}")
                if attempt < max_retries:
                    time.sleep(2)
                else:
                    self.logger.error("All Selenium connection attempts failed")
                    return None
        
        return None
    
    def cleanup_session(self, session_data: Dict[str, Any]):
        """
        Clean up GoLogin session resources.
        
        Args:
            session_data: Dictionary returned by start_session()
        """
        try:
            # Close Selenium driver
            if 'driver' in session_data and session_data['driver']:
                try:
                    session_data['driver'].quit()
                    self.logger.info("Selenium driver closed")
                except Exception as e:
                    self.logger.warning(f"Error closing driver: {e}")
            
            # Stop GoLogin session
            if 'gl' in session_data and session_data['gl']:
                try:
                    session_data['gl'].stop()
                    self.logger.info("GoLogin session stopped")
                except Exception as e:
                    self.logger.warning(f"Error stopping GoLogin: {e}")
            
            # Remove temporary directory
            if 'tmpdir' in session_data and session_data['tmpdir']:
                try:
                    shutil.rmtree(session_data['tmpdir'], ignore_errors=True)
                    self.logger.info(f"Temp directory cleaned: {session_data['tmpdir']}")
                except Exception as e:
                    self.logger.warning(f"Error cleaning tmpdir: {e}")
        
        except Exception as e:
            self.logger.error(f"Error during session cleanup: {e}")
    
    def _fix_encoding(self):
        """Fix UTF-8 encoding for international characters in GoLogin responses."""
        try:
            if hasattr(sys.stdout, 'buffer') and 'UTF' not in str(sys.stdout.encoding).upper():
                sys.stdout = io.TextIOWrapper(
                    sys.stdout.buffer, 
                    encoding='utf-8', 
                    errors='replace', 
                    line_buffering=True
                )
            
            if hasattr(sys.stderr, 'buffer') and 'UTF' not in str(sys.stderr.encoding).upper():
                sys.stderr = io.TextIOWrapper(
                    sys.stderr.buffer, 
                    encoding='utf-8', 
                    errors='replace', 
                    line_buffering=True
                )
        except Exception as e:
            self.logger.warning(f"Could not fix encoding: {e}")


# Context manager for automatic cleanup
class GoLoginSession:
    """
    Context manager for GoLogin sessions with automatic cleanup.
    
    Usage:
        manager = GoLoginManager()
        with GoLoginSession(manager, profile_id) as session:
            driver = session['driver']
            driver.get('https://example.com')
            # ... automation code ...
        # Session automatically cleaned up
    """
    
    def __init__(self, manager: GoLoginManager, profile_id: str, headless: bool = False):
        self.manager = manager
        self.profile_id = profile_id
        self.headless = headless
        self.session_data = None
    
    def __enter__(self) -> Dict[str, Any]:
        self.session_data = self.manager.start_session(self.profile_id, self.headless)
        if not self.session_data:
            raise RuntimeError(f"Failed to start GoLogin session for profile {self.profile_id}")
        return self.session_data
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session_data:
            self.manager.cleanup_session(self.session_data)

