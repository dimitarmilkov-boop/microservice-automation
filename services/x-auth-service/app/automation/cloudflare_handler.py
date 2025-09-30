#!/usr/bin/env python3
"""
Cloudflare Challenge Handler

Detects and handles Cloudflare protection challenges including:
- Cloudflare "Checking your browser" pages
- Turnstile captchas
- hCaptcha challenges
- Manual verification prompts

Integrates with anti-captcha services for automated solving.
"""

import time
import logging
import requests
import json
import os
import re
import sqlite3
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from dotenv import load_dotenv
from gologin_manager_enhanced import EnhancedGoLoginManager

# Load environment variables
load_dotenv()

class CloudflareHandler:
    """
    Handles Cloudflare challenges with multiple solving strategies.
    """
    
    def __init__(self, driver: webdriver.Chrome, config: Dict[str, Any] = None, profile_id: str = None):
        self.driver = driver
        self.logger = logging.getLogger(__name__)
        self.config = config or {}
        self.profile_id = profile_id  # Store profile_id for spam detection
        
        # Track recent solve attempts to prevent loops
        self.recent_attempts = {}
        
        # Anti-captcha service configuration
        self.anticaptcha_key = os.getenv('ANTICAPTCHA_API_KEY')
        self.twocaptcha_key = os.getenv('TWOCAPTCHA_API_KEY')
        self.capsolver_key = os.getenv('CAPSOLVER_API_KEY')
        
        # Detection patterns for different languages
        self.cloudflare_indicators = [
            # English
            "Checking your browser",
            "Please wait while we check your browser",
            "This process is automatic",
            "DDoS protection by Cloudflare",
            "Verify you are human",
            "Complete the security check",
            
            # Turkish
            "Tarayıcınız kontrol ediliyor",
            "insan olduğunuzu doğrulayın",
            "güvenlik kontrolünü tamamlayın",
            "bağlantınızın güvenliğini gözden geçirmesi",
            
            # Spanish
            "Verificando tu navegador",
            "Verifica que eres humano",
            
            # French
            "Vérification de votre navigateur",
            "Vérifiez que vous êtes humain",
            
            # German
            "Ihr Browser wird überprüft",
            "Bestätigen Sie, dass Sie ein Mensch sind",
            
            # Common elements
            "cloudflare",
            "cf-challenge",
            "cf-wrapper"
        ]
        
        # Captcha selectors
        self.captcha_selectors = {
            'turnstile': [
                'iframe[src*="challenges.cloudflare.com"]',
                '[data-sitekey]',
                '.cf-turnstile',
                '#cf-turnstile'
            ],
            'hcaptcha': [
                'iframe[src*="hcaptcha.com"]',
                '.h-captcha',
                '[data-hcaptcha-sitekey]'
            ],
            'checkbox': [
                'input[type="checkbox"]',
                '.cf-checkbox',
                '[data-ray]'
            ]
        }

    def detect_cloudflare_challenge(self) -> Dict[str, Any]:
        """
        Detect if current page has a Cloudflare challenge.
        Returns challenge type and details.
        """
        try:
            current_url = self.driver.current_url
            page_source = self.driver.page_source.lower()
            page_title = self.driver.title.lower()
            
            challenge_info = {
                'detected': False,
                'type': None,
                'details': {},
                'url': current_url,
                'title': page_title
            }
            
            # Check for Turkish indicators first - these should NEVER be treated as javascript_automatic
            turkish_indicators = [
                'insan olduğunuzu doğrulayın',
                'bağlantınızın güvenliğini gözden geçirmesi', 
                'bir dakika lütfen',
                'tarayıcınız kontrol ediliyor',
                'güvenlik kontrolü',
                # Handle URL encoding and different encodings
                'insan oldu%c4%9funuzu do%c4%9frulayın',
                'ba%c4%9flant%c4%b1n%c4%b1z%c4%b1n g%c3%bcvenli%c4%9fini',
                'bir dakika l%c3%bctfen',
                'lütfen',
                'lã¼tfen',  # Common encoding variant
                'güvenlik',
                'g%c3%bcvenlik',
                'doğrulayın',
                'do%c4%9frulayın'
            ]
            
            is_turkish_challenge = any(indicator in page_source for indicator in turkish_indicators) or \
                                  any(indicator in page_title for indicator in turkish_indicators)
            
            if is_turkish_challenge:
                challenge_info['detected'] = True
                challenge_info['type'] = 'checkbox'  # Force Turkish challenges to be treated as checkbox
                challenge_info['details']['indicator'] = 'Turkish Cloudflare challenge'
                challenge_info['details']['turkish_indicators'] = [ind for ind in turkish_indicators if ind in page_source or ind in page_title]
                self.logger.info(f"🇹🇷 Detected Turkish Cloudflare challenge - forcing checkbox treatment")
                
                # Mark spam detected in database
                if self.profile_id:
                    self._mark_spam_detected(self.profile_id, "Turkish Cloudflare challenge detected")
                
                return challenge_info
            
            # First check for JavaScript-based automatic challenges (only if not Turkish)
            if 'window._cf_chl_opt' in self.driver.page_source and 'ctype' in page_source:
                challenge_info['detected'] = True
                challenge_info['type'] = 'javascript_automatic'
                challenge_info['details']['indicator'] = 'JavaScript automatic challenge'
                self.logger.info("🤖 Detected JavaScript-based Cloudflare challenge - requires waiting")
                return challenge_info
            
            # Check for Cloudflare indicators in page content
            for indicator in self.cloudflare_indicators:
                if indicator.lower() in page_source or indicator.lower() in page_title:
                    challenge_info['detected'] = True
                    challenge_info['details']['indicator'] = indicator
                    self.logger.info(f"Cloudflare challenge detected: {indicator}")
                    break
            
            if not challenge_info['detected']:
                # Check URL patterns
                if any(pattern in current_url.lower() for pattern in ['challenge', 'captcha', 'verify']):
                    challenge_info['detected'] = True
                    challenge_info['details']['indicator'] = 'URL pattern'
            
            if challenge_info['detected']:
                # Determine challenge type
                challenge_info['type'] = self._identify_challenge_type()
                challenge_info['details'].update(self._extract_challenge_details())
                
                # Debug logging for Turkish challenges
                self.logger.info(f"🔍 CHALLENGE DETECTED: Type = '{challenge_info['type']}', Indicator = '{challenge_info['details'].get('indicator', 'unknown')}'")
                
            return challenge_info
            
        except Exception as e:
            self.logger.error(f"Error detecting Cloudflare challenge: {e}")
            return {'detected': False, 'error': str(e)}

    def _identify_challenge_type(self) -> str:
        """Identify the specific type of Cloudflare challenge."""
        try:
            self.logger.debug("Identifying challenge type...")
            
            # Check for Turnstile
            for selector in self.captcha_selectors['turnstile']:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    self.logger.info(f"Found Turnstile element using selector: {selector}")
                    return 'turnstile'
            
            # Check for hCaptcha
            for selector in self.captcha_selectors['hcaptcha']:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    self.logger.info(f"Found hCaptcha element using selector: {selector}")
                    return 'hcaptcha'
            
            # Check for simple checkbox
            for selector in self.captcha_selectors['checkbox']:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    self.logger.info(f"Found checkbox element using selector: {selector}")
                    return 'checkbox'
            
            # Check page content for specific challenge types
            page_source = self.driver.page_source.lower()
            
            # More specific checks for Turkish challenge pages
            if any(word in page_source for word in ['insan olduğunuzu doğrulayın', 'güvenlik kontrolünü tamamlayın', 'bağlantınızın güvenliğini gözden geçirmesi']):
                self.logger.info("Detected Turkish challenge page")
                
                # First check if there are actual interactive elements (checkbox, turnstile)
                interactive_selectors = [
                    'input[type="checkbox"]',
                    '.cf-turnstile',
                    '[data-sitekey]',
                    'iframe[src*="turnstile"]',
                    'button[type="submit"]',
                    '.challenge-form button',
                    '.cf-challenge button',
                    'form',
                    '.challenge-form',
                    '#challenge-form',
                    '.cf-challenge-form'
                ]
                
                interactive_elements = []
                for selector in interactive_selectors:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        interactive_elements.extend(elements)
                        self.logger.debug(f"Found {len(elements)} elements with selector: {selector}")
                
                if interactive_elements:
                    self.logger.info(f"Found {len(interactive_elements)} interactive elements - treating as checkbox/turnstile challenge")
                    
                    # Log details about the interactive elements found
                    for i, elem in enumerate(interactive_elements[:3]):  # Show first 3
                        try:
                            tag = elem.tag_name
                            elem_type = elem.get_attribute('type')
                            elem_class = elem.get_attribute('class')
                            elem_id = elem.get_attribute('id')
                            sitekey = elem.get_attribute('data-sitekey')
                            self.logger.info(f"Interactive element {i+1}: <{tag}> type='{elem_type}' class='{elem_class}' id='{elem_id}' sitekey='{sitekey}'")
                        except Exception as e:
                            self.logger.debug(f"Error inspecting element {i+1}: {e}")
                    
                    # Check if it's specifically turnstile
                    if any(elem.get_attribute('data-sitekey') for elem in interactive_elements if elem.get_attribute('data-sitekey')):
                        return 'turnstile'
                    else:
                        return 'checkbox'
                
                # FORCE all Turkish challenges to be treated as checkbox challenges
                # Never treat Turkish challenges as browser_check - always try active solving
                self.logger.info("Turkish challenge detected - FORCING checkbox treatment (no browser_check fallback)")
                
                # Log what we actually see on the page for debugging
                self.logger.info(f"Page URL: {self.driver.current_url}")
                self.logger.info(f"Page title: {self.driver.title}")
                
                # Check if page source contains any hints about interactivity
                interactive_keywords = ['button', 'form', 'input', 'checkbox', 'submit', 'click', 'verify', 'continue', 'devam', 'tıkla']
                found_keywords = [kw for kw in interactive_keywords if kw in page_source]
                if found_keywords:
                    self.logger.info(f"Found interactive keywords: {found_keywords}")
                else:
                    self.logger.info("No obvious interactive keywords found - but proceeding with checkbox attempt")
                
                return 'checkbox'
            
            if 'turnstile' in page_source:
                self.logger.info("Found 'turnstile' in page source")
                return 'turnstile'
            elif 'hcaptcha' in page_source:
                self.logger.info("Found 'hcaptcha' in page source")
                return 'hcaptcha'
            elif any(word in page_source for word in ['checking', 'kontrol', 'vérification']):
                self.logger.info("Detected browser check based on page content")
                return 'browser_check'
            
            self.logger.warning("Could not identify challenge type")
            return 'unknown'
            
        except Exception as e:
            self.logger.error(f"Error identifying challenge type: {e}")
            return 'unknown'

    def _extract_challenge_details(self) -> Dict[str, Any]:
        """Extract details needed for solving the challenge."""
        details = {}
        
        try:
            # Extract site key for captchas - Enhanced selectors
            sitekey_selectors = [
                # Turnstile selectors
                '[data-sitekey]',
                '[data-turnstile-sitekey]',
                '.cf-turnstile[data-sitekey]',
                'iframe[src*="turnstile"]',
                'div[data-sitekey]',
                # hCaptcha selectors
                '[data-hcaptcha-sitekey]',
                '.h-captcha[data-sitekey]',
                # Generic captcha selectors
                '[data-callback]',
                '.captcha-container[data-sitekey]'
            ]
            
            # Try each selector
            for selector in sitekey_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        element = elements[0]
                        # Try multiple attribute names
                        for attr in ['data-sitekey', 'data-hcaptcha-sitekey', 'data-turnstile-sitekey', 'sitekey']:
                            sitekey = element.get_attribute(attr)
                            if sitekey:
                                details['sitekey'] = sitekey
                                self.logger.info(f"Found sitekey: {sitekey[:10]}... using selector: {selector}")
                                break
                        if 'sitekey' in details:
                            break
                        
                        # For iframe elements, try to extract from src
                        if selector.startswith('iframe'):
                            src = element.get_attribute('src')
                            if src and 'sitekey=' in src:
                                import re
                                match = re.search(r'sitekey=([^&]+)', src)
                                if match:
                                    details['sitekey'] = match.group(1)
                                    self.logger.info(f"Extracted sitekey from iframe src: {details['sitekey'][:10]}...")
                                    break
                except Exception as e:
                    self.logger.debug(f"Error with selector {selector}: {e}")
                    continue
            
            # If no sitekey found, try JavaScript extraction
            if 'sitekey' not in details:
                try:
                    # Try to find sitekey in page source or JavaScript
                    page_source = self.driver.page_source
                    import re
                    
                    # Common patterns for sitekey in JavaScript
                    patterns = [
                        r'sitekey["\']?\s*:\s*["\']([^"\']+)["\']',
                        r'data-sitekey["\']?\s*:\s*["\']([^"\']+)["\']',
                        r'siteKey["\']?\s*:\s*["\']([^"\']+)["\']',
                        r'"sitekey"\s*:\s*"([^"]+)"',
                        r'sitekey=([^&\s]+)',
                        r'turnstile\.render\([^,]+,\s*{\s*sitekey:\s*["\']([^"\']+)["\']'
                    ]
                    
                    for pattern in patterns:
                        match = re.search(pattern, page_source, re.IGNORECASE)
                        if match:
                            details['sitekey'] = match.group(1)
                            self.logger.info(f"Found sitekey in page source: {details['sitekey'][:10]}...")
                            break
                except Exception as e:
                    self.logger.debug(f"Error extracting sitekey from page source: {e}")
            
            if 'sitekey' not in details:
                self.logger.warning("No sitekey found using any method")
            
            # Extract challenge form action
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            if forms:
                details['form_action'] = forms[0].get_attribute('action')
            
            # Extract any hidden inputs
            hidden_inputs = self.driver.find_elements(By.CSS_SELECTOR, 'input[type="hidden"]')
            details['hidden_fields'] = {}
            for input_elem in hidden_inputs:
                name = input_elem.get_attribute('name')
                value = input_elem.get_attribute('value')
                if name and value:
                    details['hidden_fields'][name] = value
            
            return details
            
        except Exception as e:
            self.logger.error(f"Error extracting challenge details: {e}")
            return details

    def solve_challenge(self, challenge_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Attempt to solve the detected Cloudflare challenge.
        """
        if not challenge_info.get('detected'):
            return {'success': False, 'reason': 'No challenge detected'}
        
        challenge_type = challenge_info.get('type')
        self.logger.info(f"🎯 SOLVING: Attempting to solve '{challenge_type}' challenge")
        self.logger.info(f"🔍 CHALLENGE INFO: {challenge_info}")
        
        try:
            if challenge_type == 'javascript_automatic':
                result = self._wait_for_javascript_challenge()
                # Ensure result is not None
                if result is None:
                    result = {'success': False, 'reason': 'JavaScript challenge method returned None'}
            elif challenge_type == 'browser_check':
                result = self._wait_for_browser_check()
                # Ensure result is not None
                if result is None:
                    result = {'success': False, 'reason': 'Browser check method returned None'}
                
                # If browser check times out, try to re-detect and solve as interactive challenge
                if not result.get('success'):
                    self.logger.info("Browser check failed, re-checking for interactive elements...")
                    
                    # Re-check for interactive elements
                    interactive_elements = self.driver.find_elements(By.CSS_SELECTOR, 
                        'input[type="checkbox"], .cf-turnstile, [data-sitekey], iframe[src*="turnstile"]')
                    
                    if interactive_elements:
                        self.logger.info("Found interactive elements after browser check timeout - trying checkbox solve")
                        checkbox_result = self._solve_checkbox_challenge()
                        if checkbox_result and checkbox_result.get('success'):
                            return checkbox_result
                    
                    # Turkish challenges are handled by the dedicated Turkish enhanced solver
                    # No fallback needed here
                
                return result
            elif challenge_type == 'checkbox':
                self.logger.info("🎯 CHECKBOX CHALLENGE: Starting enhanced Turkish checkbox solving...")
                
                # Check if this is a Turkish challenge - use enhanced solver
                page_source = self.driver.page_source.lower()
                turkish_indicators = ['insan olduğunuzu doğrulayın', 'bağlantınızın güvenliğini gözden geçirmesi', 'bir dakika lütfen', 'lütfen', 'doğrulayın']
                
                if any(indicator in page_source for indicator in turkish_indicators):
                    self.logger.info("🇹🇷 Turkish challenge detected - using enhanced Turkish solver")
                    enhanced_success = self._solve_turkish_challenge_enhanced()
                    if enhanced_success:
                        return {'success': True, 'method': 'enhanced_turkish_solver', 'service': 'specialized'}
                    else:
                        # NO FALLBACK - If Turkish enhanced solver fails, mark as captcha and stop
                        self.logger.warning("🇹🇷 Enhanced Turkish solver failed - NO FALLBACK, marking as captcha")
                        return {'success': False, 'reason': 'Turkish challenge failed after 2 attempts - captcha marked'}
                
                # Standard checkbox challenge solving (non-Turkish)
                result = self._solve_checkbox_challenge()
                # Ensure result is not None
                if result is None:
                    result = {'success': False, 'reason': 'Checkbox challenge method returned None'}
                return result
            elif challenge_type == 'turnstile':
                result = self._solve_turnstile_challenge(challenge_info)
                # Ensure result is not None
                if result is None:
                    result = {'success': False, 'reason': 'Turnstile challenge method returned None'}
                return result
            elif challenge_type == 'hcaptcha':
                result = self._solve_hcaptcha_challenge(challenge_info)
                # Ensure result is not None
                if result is None:
                    result = {'success': False, 'reason': 'hCaptcha challenge method returned None'}
                return result
            else:
                return self._manual_intervention_required(challenge_info)
                
        except Exception as e:
            self.logger.error(f"Error solving challenge: {e}")
            return {'success': False, 'reason': f'Solving error: {str(e)}'}

    def _wait_for_javascript_challenge(self, timeout: int = 60) -> Dict[str, Any]:
        """
        Wait for JavaScript-based Cloudflare challenge to complete automatically.
        These challenges solve themselves via JavaScript execution.
        """
        self.logger.info(f"⏳ Waiting for JavaScript challenge to complete automatically (timeout: {timeout}s)")
        
        start_time = time.time()
        initial_url = self.driver.current_url
        
        while time.time() - start_time < timeout:
            try:
                current_url = self.driver.current_url
                page_source = self.driver.page_source.lower()
                
                # Check if we've been redirected away from challenge page
                if current_url != initial_url and 'x.com' in current_url and '/account/access' not in current_url:
                    self.logger.info(f"🎉 JavaScript challenge completed! Redirected to: {current_url}")
                    return {
                        'success': True,
                        'method': 'javascript_automatic',
                        'redirect_url': current_url,
                        'completion_time': time.time() - start_time
                    }
                
                # Check if challenge page indicators are gone
                if 'window._cf_chl_opt' not in self.driver.page_source:
                    self.logger.info(f"🎉 JavaScript challenge completed! Challenge script removed")
                    return {
                        'success': True,
                        'method': 'javascript_automatic',
                        'completion_time': time.time() - start_time
                    }
                
                # Check if we're on the main X.com page
                page_title = self.driver.title.lower()
                if 'x' in page_title and 'bir dakika' not in page_title and 'just a moment' not in page_title:
                    self.logger.info(f"🎉 JavaScript challenge completed! Reached main page: {page_title}")
                    return {
                        'success': True,
                        'method': 'javascript_automatic',
                        'completion_time': time.time() - start_time
                    }
                
                # Wait a bit before checking again
                time.sleep(2)
                
            except Exception as e:
                self.logger.warning(f"Error during JavaScript challenge wait: {e}")
                time.sleep(1)
        
        # If timeout, try one fallback strategy before giving up
        self.logger.warning(f"⏰ JavaScript challenge timeout after {timeout} seconds - trying fallback")
        
        try:
            # Try a simple page refresh as fallback
            self.logger.info("🔄 Attempting page refresh as fallback strategy")
            self.driver.refresh()
            time.sleep(5)
            
            # Check if refresh helped
            current_url = self.driver.current_url
            page_title = self.driver.title.lower()
            
            if '/account/access' not in current_url or 'bir dakika' not in page_title:
                self.logger.info(f"🎉 Fallback refresh succeeded! URL: {current_url}")
                return {
                    'success': True,
                    'method': 'javascript_fallback_refresh',
                    'completion_time': time.time() - start_time
                }
        except Exception as e:
            self.logger.warning(f"Fallback refresh failed: {e}")
        
        return {
            'success': False,
            'reason': f'JavaScript challenge timeout after {timeout} seconds',
            'method': 'javascript_automatic'
        }

    def _wait_for_browser_check(self, timeout: int = 90) -> Dict[str, Any]:
        """Wait for automatic browser check to complete."""
        self.logger.info("Waiting for browser check to complete...")
        
        start_time = time.time()
        initial_url = self.driver.current_url
        
        # Log initial state
        self._log_page_state("before browser check")
        
        # Wait at least 5 seconds before checking (give challenge time to process)
        time.sleep(5)
        
        # Track consecutive stable checks
        consecutive_stable_checks = 0
        last_check_result = None
        
        while time.time() - start_time < timeout:
            try:
                current_url = self.driver.current_url
                page_source = self.driver.page_source.lower()
                
                elapsed_time = time.time() - start_time
                self.logger.debug(f"Checking browser check status (elapsed: {elapsed_time:.1f}s)")
                
                # Check if URL changed to a non-challenge page
                if current_url != initial_url:
                    if 'challenge' not in current_url.lower() and 'access' not in current_url.lower():
                        self.logger.info(f"Browser check completed - URL changed to: {current_url}")
                        return {'success': True, 'method': 'automatic_wait'}
                
                # Check if we're on a success page (common after challenge completion)
                if any(success_indicator in current_url.lower() for success_indicator in ['home', 'timeline', 'feed']):
                    self.logger.info("Browser check completed - reached success page")
                    return {'success': True, 'method': 'automatic_wait'}
                
                # Check for specific Turkish challenge completion indicators
                # Only consider it complete if we reach a Twitter page or the URL changes significantly
                if ('bir dakika lütfen' in page_source and 'insan olduğunuzu doğrulayın' not in page_source and 
                    ('twitter.com' in current_url or 'x.com' in current_url) and 
                    'challenge' not in current_url.lower() and 'access' not in current_url.lower()):
                    self.logger.info("Browser check completed - Turkish challenge indicators changed and reached Twitter")
                    return {'success': True, 'method': 'automatic_wait'}
                
                # Check if challenge-specific elements disappeared
                challenge_elements = [
                    'cf-challenge',
                    'cf-wrapper',
                    'challenge-form',
                    'challenge-stage',
                    'challenge-container',
                    'cf-turnstile',
                    'checkbox',
                    'verify you are human',
                    'insan olduğunuzu doğrulayın'
                ]
                
                has_challenge_elements = any(elem in page_source for elem in challenge_elements)
                
                # Specifically check for checkbox presence
                checkbox_present = any(selector in page_source for selector in [
                    'input[type="checkbox"]',
                    'type="checkbox"',
                    'checkbox',
                    'cf-turnstile'
                ])
                
                # If checkbox is still present, challenge is not complete
                if checkbox_present:
                    self.logger.debug(f"Checkbox still present, challenge not complete (elapsed: {elapsed_time:.1f}s)")
                    has_challenge_elements = True
                
                # Check for page changes that might indicate progress
                current_check_result = {
                    'url': current_url,
                    'title': self.driver.title,
                    'has_challenge_elements': has_challenge_elements,
                    'page_length': len(page_source)
                }
                
                # If page hasn't changed for multiple checks, it might be stuck
                if last_check_result and current_check_result == last_check_result:
                    consecutive_stable_checks += 1
                else:
                    consecutive_stable_checks = 0
                    last_check_result = current_check_result
                
                # If page is stable for too long, try refreshing
                if consecutive_stable_checks >= 10 and elapsed_time > 30:  # 20 seconds of stability
                    self.logger.info("Page appears stuck, trying refresh...")
                    try:
                        self.driver.refresh()
                        time.sleep(3)
                        consecutive_stable_checks = 0
                    except Exception as e:
                        self.logger.debug(f"Refresh failed: {e}")
                
                # Only consider it complete if both conditions are met:
                # 1. No challenge elements found
                # 2. We're not still on an access/challenge URL
                if not has_challenge_elements and 'access' not in current_url.lower():
                    # Double-check by waiting a bit more
                    time.sleep(3)
                    current_url_recheck = self.driver.current_url
                    if current_url_recheck == current_url:  # URL stable
                        self._log_page_state("after browser check completion")
                        self.logger.info("Browser check completed - challenge elements cleared and URL stable")
                        return {'success': True, 'method': 'automatic_wait'}
                
                # Log progress every 15 seconds
                if int(elapsed_time) % 15 == 0:
                    self.logger.info(f"Still waiting for challenge completion... ({elapsed_time:.0f}s elapsed)")
                
                time.sleep(2)  # Check every 2 seconds
                
            except Exception as e:
                self.logger.debug(f"Error during browser check wait: {e}")
                time.sleep(2)
        
        self.logger.warning(f"Browser check timeout after {timeout} seconds")
        
        # Turkish challenges are handled by the dedicated Turkish enhanced solver
        # No fallback needed here
        
        return {'success': False, 'reason': 'Browser check timeout'}

    def _log_page_state(self, context: str = ""):
        """Log current page state for debugging."""
        try:
            url = self.driver.current_url
            title = self.driver.title
            page_source = self.driver.page_source.lower()
            
            self.logger.info(f"Page state {context}: URL={url}, Title='{title}'")
            
            # Check for specific indicators
            indicators_found = []
            for indicator in self.cloudflare_indicators[:10]:  # Check first 10 indicators
                if indicator.lower() in page_source:
                    indicators_found.append(indicator)
            
            if indicators_found:
                self.logger.info(f"Found indicators: {indicators_found}")
            else:
                self.logger.info("No Cloudflare indicators found")
                
        except Exception as e:
            self.logger.debug(f"Error logging page state: {e}")

    def _solve_checkbox_challenge(self) -> Dict[str, Any]:
        """Attempt to solve simple checkbox challenge (non-Turkish only)."""
        try:
            self.logger.info("🚀 ENHANCED CHECKBOX SOLVER: Starting enhanced checkbox challenge solving...")
            
            # This method should only handle non-Turkish challenges
            # Turkish challenges are handled by _solve_turkish_challenge_enhanced()
            
            # Enhanced checkbox selectors with iframe and shadow DOM support
            checkbox_selectors = [
                # Standard checkbox selectors
                'input[type="checkbox"]',
                '.cf-checkbox input',
                '[data-ray] input',
                'label input[type="checkbox"]',
                
                # Turnstile and captcha specific
                '.cf-turnstile',
                '[data-sitekey]',
                'iframe[src*="turnstile"]',
                'div[data-sitekey]',
                
                # Form elements
                '#challenge-form input[type="checkbox"]',
                '.challenge-form input[type="checkbox"]',
                'button[type="submit"]',
                '.challenge-form button',
                '.cf-challenge button',
                
                # Generic clickable elements
                '[onclick]',
                '.clickable',
                'button',
                'input[type="button"]',
                'input[type="submit"]',
                'a[href="#"]',
                'div[role="button"]',
                
                # Cloudflare specific elements
                '.cf-wrapper button',
                '.cf-content button',
                '.cf-footer button',
                '.cf-section button'
            ]
            
            clicked_something = False
            
            # Try to find and click checkbox elements
            for selector in checkbox_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        self.logger.info(f"Found {len(elements)} elements for selector: {selector}")
                        
                        for element in elements:
                            try:
                                # Check if element is visible and clickable
                                if element.is_displayed() and element.is_enabled():
                                    # Try clicking the element
                                    element.click()
                                    self.logger.info(f"Clicked element: {selector}")
                                    clicked_something = True
                                    time.sleep(2)  # Wait for potential response
                                    
                                    # Check if this solved the challenge
                                    completion_result = self._wait_for_challenge_completion()
                                    if completion_result.get('success'):
                                        return completion_result
                                    
                            except Exception as e:
                                self.logger.debug(f"Could not click element {selector}: {e}")
                                
                except Exception as e:
                    self.logger.debug(f"Error finding elements for selector {selector}: {e}")
            
            # Check iframe content for interactive elements
            self.logger.info("Checking iframe content for interactive elements...")
            try:
                iframes = self.driver.find_elements(By.TAG_NAME, 'iframe')
                for iframe in iframes:
                    try:
                        self.driver.switch_to.frame(iframe)
                        
                        # Look for interactive elements in iframe
                        iframe_elements = self.driver.find_elements(By.CSS_SELECTOR, 'input, button, [onclick], [role="button"]')
                        for element in iframe_elements:
                            try:
                                if element.is_displayed() and element.is_enabled():
                                    element.click()
                                    self.logger.info("Clicked element in iframe")
                                    clicked_something = True
                                    time.sleep(2)
                                    break
                            except Exception as e:
                                self.logger.debug(f"Could not click iframe element: {e}")
                        
                        self.driver.switch_to.default_content()
                        
                        if clicked_something:
                            completion_result = self._wait_for_challenge_completion()
                            if completion_result.get('success'):
                                return completion_result
                            
                    except Exception as e:
                        self.logger.debug(f"Error processing iframe: {e}")
                        try:
                            self.driver.switch_to.default_content()
                        except:
                            pass
                            
            except Exception as e:
                self.logger.debug(f"Error checking iframes: {e}")
            
            # Check shadow DOM for interactive elements
            self.logger.info("Checking shadow DOM for interactive elements...")
            try:
                shadow_elements = self.driver.execute_script("""
                    const elements = [];
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_ELEMENT,
                        null,
                        false
                    );
                    
                    let node;
                    while (node = walker.nextNode()) {
                        if (node.shadowRoot) {
                            const shadowElements = node.shadowRoot.querySelectorAll('input, button, [onclick], [role="button"]');
                            shadowElements.forEach(el => elements.push(el));
                        }
                    }
                    
                    return elements.length;
                """)
                
                if shadow_elements > 0:
                    self.logger.info(f"Found {shadow_elements} shadow DOM elements")
                    # Try to click shadow DOM elements
                    self.driver.execute_script("""
                        const walker = document.createTreeWalker(
                            document.body,
                            NodeFilter.SHOW_ELEMENT,
                            null,
                            false
                        );
                        
                        let node;
                        while (node = walker.nextNode()) {
                            if (node.shadowRoot) {
                                const shadowElements = node.shadowRoot.querySelectorAll('input, button, [onclick], [role="button"]');
                                shadowElements.forEach(el => {
                                    try {
                                        el.click();
                                    } catch (e) {
                                        console.log('Could not click shadow element:', e);
                                    }
                                });
                            }
                        }
                    """)
                    clicked_something = True
                    time.sleep(2)
                    
            except Exception as e:
                self.logger.debug(f"Error checking shadow DOM: {e}")
            
            if clicked_something:
                # Wait for potential completion after all clicks
                time.sleep(2)
                return self._wait_for_challenge_completion()
            else:
                # If no obvious elements found, try some generic actions that might trigger completion
                self.logger.info("No obvious clickable elements found - trying generic actions")
                
                try:
                    # Strategy 1: Try clicking anywhere on the page (might trigger hidden elements)
                    self.driver.execute_script("document.body.click();")
                    time.sleep(2)
                    
                    # Strategy 2: Try pressing Space key (sometimes activates hidden buttons)
                    from selenium.webdriver.common.keys import Keys
                    body = self.driver.find_element(By.TAG_NAME, 'body')
                    body.send_keys(Keys.SPACE)
                    time.sleep(2)
                    
                    # Strategy 3: Try pressing Enter key
                    body.send_keys(Keys.ENTER)
                    time.sleep(2)
                    
                    # Strategy 4: Try clicking on the center of the page
                    self.driver.execute_script("document.elementFromPoint(window.innerWidth/2, window.innerHeight/2).click();")
                    time.sleep(2)
                    
                    # Strategy 5: Trigger any change/focus events
                    self.driver.execute_script("""
                        // Try to trigger various events that might complete the challenge
                        document.dispatchEvent(new Event('DOMContentLoaded'));
                        document.dispatchEvent(new Event('load'));
                        window.dispatchEvent(new Event('focus'));
                        window.dispatchEvent(new Event('click'));
                    """)
                    time.sleep(3)
                    
                    self.logger.info("Completed generic actions - checking for challenge completion")
                    return self._wait_for_challenge_completion()
                    
                except Exception as e:
                    self.logger.error(f"Error in generic actions: {e}")
                    return {'success': False, 'reason': f'Generic actions failed: {str(e)}'}
            
        except Exception as e:
            self.logger.error(f"Error solving checkbox challenge: {e}")
            return {'success': False, 'reason': f'Checkbox challenge error: {str(e)}'}

    def _solve_turnstile_challenge(self, challenge_info: Dict[str, Any]) -> Dict[str, Any]:
        """Solve Turnstile challenge using anti-captcha service with enhanced parameter extraction."""
        if not self.anticaptcha_key and not self.twocaptcha_key:
            return {'success': False, 'reason': 'No anti-captcha API key configured'}
        
        try:
            sitekey = challenge_info['details'].get('sitekey')
            self.logger.debug(f"Challenge info details: {challenge_info['details']}")
            
            if not sitekey:
                # Additional debugging - show what elements are on the page
                self.logger.warning("No sitekey found, debugging page elements...")
                try:
                    # Log all elements that might contain sitekey
                    elements_with_data = self.driver.find_elements(By.CSS_SELECTOR, '[data-sitekey], [data-turnstile-sitekey], [data-hcaptcha-sitekey], .cf-turnstile, .h-captcha, iframe')
                    self.logger.info(f"Found {len(elements_with_data)} potential captcha elements")
                    
                    for i, elem in enumerate(elements_with_data[:5]):  # Limit to first 5
                        try:
                            tag = elem.tag_name
                            attrs = {}
                            for attr in ['data-sitekey', 'data-turnstile-sitekey', 'data-hcaptcha-sitekey', 'class', 'id', 'src']:
                                val = elem.get_attribute(attr)
                                if val:
                                    attrs[attr] = val
                            self.logger.info(f"Element {i+1}: <{tag}> {attrs}")
                        except Exception as e:
                            self.logger.debug(f"Error inspecting element {i+1}: {e}")
                            
                    # Also check page source for common patterns
                    page_source = self.driver.page_source
                    if 'turnstile' in page_source.lower():
                        self.logger.info("Page contains 'turnstile' references")
                    if 'sitekey' in page_source.lower():
                        self.logger.info("Page contains 'sitekey' references")
                        
                except Exception as e:
                    self.logger.debug(f"Error during debugging: {e}")
                    
                return {'success': False, 'reason': 'No sitekey found for Turnstile'}
            
            # Enhanced parameter extraction for Cloudflare Challenge pages
            self.logger.info("🔍 Extracting Turnstile parameters for Cloudflare Challenge page...")
            turnstile_params = self._extract_turnstile_parameters(sitekey)
            
            # Check if this is a Turkish page - prioritize 2captcha for Turkish challenges
            page_source = self.driver.page_source.lower()
            is_turkish_page = any(turkish_indicator in page_source for turkish_indicator in 
                                ['insan olduğunuzu doğrulayın', 'bağlantınızın güvenliğini gözden geçirmesi', 'bir dakika lütfen'])
            
            # Try with available services - prioritize 2captcha for Turkish pages
            if is_turkish_page and self.twocaptcha_key:
                self.logger.info("Turkish page detected - trying 2captcha first")
                result = self._solve_with_2captcha_enhanced(turnstile_params)
                if result['success']:
                    return self._submit_turnstile_solution(result, turnstile_params)
                else:
                    self.logger.info("2captcha failed on Turkish page, falling back to Anti-Captcha")
            
            if self.anticaptcha_key:
                # Check balance first
                balance_check = self._check_anticaptcha_balance()
                if balance_check['success']:
                    if balance_check['balance'] < 0.001:  # Minimum balance check
                        self.logger.warning(f"Anti-Captcha balance too low: ${balance_check['balance']}")
                        return {'success': False, 'reason': 'Insufficient Anti-Captcha balance'}
                else:
                    self.logger.warning(f"Could not check balance: {balance_check['reason']}")
                
                result = self._solve_with_anticaptcha_enhanced(turnstile_params)
                if result['success']:
                    return self._submit_turnstile_solution(result, turnstile_params)
            
            # If not Turkish page or Anti-Captcha failed, try 2captcha as fallback
            if not is_turkish_page and self.twocaptcha_key:
                self.logger.info("Trying 2captcha as fallback")
                result = self._solve_with_2captcha_enhanced(turnstile_params)
                if result['success']:
                    return self._submit_turnstile_solution(result, turnstile_params)
            
            return {'success': False, 'reason': 'All anti-captcha services failed'}
            
        except Exception as e:
            return {'success': False, 'reason': f'Turnstile error: {str(e)}'}

    def _extract_turnstile_parameters(self, sitekey: str) -> Dict[str, Any]:
        """Extract Turnstile parameters using JavaScript injection as described in 2captcha docs."""
        try:
            self.logger.info("🔧 Injecting JavaScript to extract Turnstile parameters...")
            
            # Inject the parameter extraction script from 2captcha documentation
            extraction_script = """
            window.turnstileParams = {};
            window.turnstileExtracted = false;
            
            const i = setInterval(() => {
                if (window.turnstile) {
                    clearInterval(i);
                    
                    // Store original render function
                    const originalRender = window.turnstile.render;
                    
                    // Override render function to capture parameters
                    window.turnstile.render = (a, b) => {
                        window.turnstileParams = {
                            sitekey: b.sitekey,
                            cData: b.cData,
                            chlPageData: b.chlPageData,
                            action: b.action,
                            url: window.location.href
                        };
                        
                        // Store callback for later use
                        window.tsCallback = b.callback;
                        window.turnstileExtracted = true;
                        
                        console.log('Turnstile parameters extracted:', window.turnstileParams);
                        
                        // Call original render to maintain functionality
                        return originalRender ? originalRender(a, b) : 'extracted';
                    };
                }
            }, 10);
            
            // Also try to extract from existing elements
            const elements = document.querySelectorAll('[data-sitekey], .cf-turnstile, iframe[src*="turnstile"]');
            if (elements.length > 0) {
                const elem = elements[0];
                window.turnstileParams = {
                    sitekey: elem.getAttribute('data-sitekey') || elem.getAttribute('data-turnstile-sitekey'),
                    url: window.location.href
                };
                console.log('Turnstile parameters from DOM:', window.turnstileParams);
            }
            
            return window.turnstileParams || {};
            """
            
            # Execute the extraction script
            self.driver.execute_script(extraction_script)
            
            # Wait for parameters to be extracted
            max_wait = 10  # seconds
            for attempt in range(max_wait):
                try:
                    # Check if parameters were extracted
                    extracted = self.driver.execute_script("return window.turnstileExtracted || false;")
                    params = self.driver.execute_script("return window.turnstileParams || {};")
                    
                    if extracted or params.get('sitekey'):
                        self.logger.info("✅ Turnstile parameters extracted successfully")
                        
                        # Log extracted parameters
                        for key, value in params.items():
                            if value:
                                if key in ['cData', 'chlPageData'] and len(str(value)) > 20:
                                    self.logger.info(f"   {key}: {str(value)[:20]}...")
                                else:
                                    self.logger.info(f"   {key}: {value}")
                        
                        return {
                            'sitekey': params.get('sitekey') or sitekey,
                            'cData': params.get('cData'),
                            'chlPageData': params.get('chlPageData'),
                            'action': params.get('action'),
                            'url': params.get('url') or self.driver.current_url
                        }
                        
                    time.sleep(1)
                    
                except Exception as e:
                    self.logger.debug(f"Parameter extraction attempt {attempt + 1} failed: {e}")
                    time.sleep(1)
            
            # Fallback to basic parameter extraction
            self.logger.warning("⚠️ JavaScript extraction failed, using fallback method")
            return self._extract_turnstile_parameters_fallback(sitekey)
            
        except Exception as e:
            self.logger.error(f"Error in parameter extraction: {e}")
            return self._extract_turnstile_parameters_fallback(sitekey)

    def _extract_turnstile_parameters_fallback(self, sitekey: str) -> Dict[str, Any]:
        """Fallback method to extract Turnstile parameters from page source."""
        try:
            page_source = self.driver.page_source
            import re
            
            params = {
                'sitekey': sitekey,
                'url': self.driver.current_url
            }
            
            # Look for action parameter in JavaScript
            action_patterns = [
                r'action["\']?\s*:\s*["\']([^"\']+)["\']',
                r'"action"\s*:\s*"([^"]+)"',
                r'action=([^&\s]+)'
            ]
            
            for pattern in action_patterns:
                match = re.search(pattern, page_source, re.IGNORECASE)
                if match:
                    params['action'] = match.group(1)
                    self.logger.info(f"Found action parameter: {params['action']}")
                    break
            
            # Look for cData parameter
            cdata_patterns = [
                r'cData["\']?\s*:\s*["\']([^"\']+)["\']',
                r'"cData"\s*:\s*"([^"]+)"',
                r'cData=([^&\s]+)'
            ]
            
            for pattern in cdata_patterns:
                match = re.search(pattern, page_source, re.IGNORECASE)
                if match:
                    params['cData'] = match.group(1)
                    self.logger.info(f"Found cData parameter: {params['cData'][:20]}...")
                    break
            
            # Look for chlPageData parameter
            chl_patterns = [
                r'chlPageData["\']?\s*:\s*["\']([^"\']+)["\']',
                r'"chlPageData"\s*:\s*"([^"]+)"',
                r'chlPageData=([^&\s]+)'
            ]
            
            for pattern in chl_patterns:
                match = re.search(pattern, page_source, re.IGNORECASE)
                if match:
                    params['chlPageData'] = match.group(1)
                    self.logger.info(f"Found chlPageData parameter: {params['chlPageData'][:20]}...")
                    break
            
            return params
            
        except Exception as e:
            self.logger.error(f"Error in fallback parameter extraction: {e}")
            return {
                'sitekey': sitekey,
                'url': self.driver.current_url
            }

    def _solve_with_2captcha_enhanced(self, turnstile_params: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced 2captcha solving with proper Turnstile parameter support."""
        try:
            self.logger.info("🚀 Starting enhanced 2captcha solve for Turnstile")
            
            # Create task with enhanced parameters
            task = {
                "type": "TurnstileTaskProxyless",
                "websiteURL": turnstile_params['url'],
                "websiteKey": turnstile_params['sitekey']
            }
            
            # Add optional parameters if found (using 2captcha parameter names)
            if turnstile_params.get('action'):
                task["action"] = turnstile_params['action']
                self.logger.info(f"🎯 Added action parameter: {task['action']}")
                
            if turnstile_params.get('cData'):
                task["data"] = turnstile_params['cData']  # 2captcha uses "data" instead of "cData"
                self.logger.info(f"📊 Added cData parameter: {task['data'][:20]}...")
                
            if turnstile_params.get('chlPageData'):
                task["pagedata"] = turnstile_params['chlPageData']  # 2captcha uses "pagedata" instead of "chlPageData"
                self.logger.info(f"📄 Added chlPageData parameter: {task['pagedata'][:20]}...")
            
            # Create task using new API format
            create_data = {
                "clientKey": self.twocaptcha_key,
                "task": task,
                "softId": 0
            }
            
            self.logger.info(f"📤 Submitting enhanced Turnstile task to 2captcha...")
            
            # Submit task using new API format
            response = requests.post('https://api.2captcha.com/createTask', 
                                   json=create_data, timeout=30)
            
            if response.status_code != 200:
                return {'success': False, 'reason': f'2captcha API error: {response.status_code}'}
            
            result = response.json()
            
            if result.get('errorId', 0) != 0:
                error_code = result.get('errorCode', 'UNKNOWN_ERROR')
                error_desc = result.get('errorDescription', 'Unknown error')
                return {'success': False, 'reason': f'2captcha error: {error_code} - {error_desc}'}
            
            task_id = result.get('taskId')
            if not task_id:
                return {'success': False, 'reason': '2captcha: No task ID returned'}
            
            self.logger.info(f"✅ 2captcha task created: {task_id}")
            
            # Wait for solution with enhanced timeout for complex challenges
            max_wait_time = 300  # 5 minutes for complex Turnstile challenges
            check_interval = 5   # Check every 5 seconds
            
            for attempt in range(max_wait_time // check_interval):
                time.sleep(check_interval)
                
                check_data = {
                    "clientKey": self.twocaptcha_key,
                    "taskId": task_id
                }
                
                check_response = requests.post('https://api.2captcha.com/getTaskResult', 
                                             json=check_data, timeout=30)
                
                if check_response.status_code == 200:
                    check_result = check_response.json()
                    
                    if check_result.get('status') == 'ready':
                        solution = check_result.get('solution', {})
                        token = solution.get('token')
                        user_agent = solution.get('userAgent')
                        cost = check_result.get('cost', 0)
                        
                        if token:
                            self.logger.info(f"🎉 2captcha solved enhanced Turnstile! Cost: ${cost}")
                            
                            result_data = {
                                'success': True,
                                'token': token,
                                'cost': cost,
                                'task_id': task_id,
                                'service': '2captcha'
                            }
                            
                            if user_agent:
                                result_data['user_agent'] = user_agent
                                self.logger.info(f"📱 Received user agent: {user_agent}")
                            
                            return result_data
                        else:
                            return {'success': False, 'reason': '2captcha: No token in solution'}
                    
                    elif check_result.get('status') == 'processing':
                        self.logger.debug(f"2captcha processing enhanced Turnstile... attempt {attempt + 1}")
                        continue
                    else:
                        error_code = check_result.get('errorCode', 'UNKNOWN_ERROR')
                        error_desc = check_result.get('errorDescription', 'Unknown error')
                        return {'success': False, 'reason': f'2captcha error: {error_code} - {error_desc}'}
                else:
                    self.logger.debug(f"2captcha check request failed: {check_response.status_code}")
            
            return {'success': False, 'reason': '2captcha timeout after 5 minutes'}
            
        except Exception as e:
            self.logger.error(f"2captcha enhanced exception: {e}")
            return {'success': False, 'reason': f'2captcha error: {str(e)}'}

    def _solve_with_anticaptcha_enhanced(self, turnstile_params: Dict[str, Any]) -> Dict[str, Any]:
        """Enhanced Anti-Captcha solving with proper Turnstile parameter support."""
        try:
            self.logger.info("🚀 Starting enhanced Anti-Captcha solve for Turnstile")
            
            # Create task with enhanced parameters
            task = {
                "type": "TurnstileTaskProxyless",
                "websiteURL": turnstile_params['url'],
                "websiteKey": turnstile_params['sitekey']
            }
            
            # Add optional parameters if found (using Anti-Captcha parameter names)
            if turnstile_params.get('action'):
                task["action"] = turnstile_params['action']
                self.logger.info(f"🎯 Added action parameter: {task['action']}")
                
            if turnstile_params.get('cData'):
                task["cData"] = turnstile_params['cData']  # Anti-Captcha uses "cData"
                self.logger.info(f"📊 Added cData parameter: {task['cData'][:20]}...")
                
            if turnstile_params.get('chlPageData'):
                task["chlPageData"] = turnstile_params['chlPageData']  # Anti-Captcha uses "chlPageData"
                self.logger.info(f"📄 Added chlPageData parameter: {task['chlPageData'][:20]}...")
            
            # Create task data with proper structure
            task_data = {
                "clientKey": self.anticaptcha_key,
                "task": task,
                "softId": 0
            }
            
            self.logger.info(f"📤 Submitting enhanced Turnstile task to Anti-Captcha...")
            
            # Submit task
            response = requests.post('https://api.anti-captcha.com/createTask', 
                                   json=task_data, timeout=30)
            
            if response.status_code != 200:
                return {'success': False, 'reason': f'Anti-Captcha API error: {response.status_code}'}
            
            result = response.json()
            
            if result.get('errorId', 0) != 0:
                error_code = result.get('errorCode', 'UNKNOWN_ERROR')
                error_desc = result.get('errorDescription', 'Unknown error')
                return {'success': False, 'reason': f'Anti-Captcha error: {error_code} - {error_desc}'}
            
            task_id = result.get('taskId')
            if not task_id:
                return {'success': False, 'reason': 'Anti-Captcha: No task ID returned'}
            
            self.logger.info(f"✅ Anti-Captcha task created: {task_id}")
            
            # Wait for solution with enhanced timeout
            max_wait_time = 300  # 5 minutes
            check_interval = 5   # Check every 5 seconds
            
            for attempt in range(max_wait_time // check_interval):
                time.sleep(check_interval)
                
                check_data = {
                    "clientKey": self.anticaptcha_key,
                    "taskId": task_id
                }
                
                check_response = requests.post('https://api.anti-captcha.com/getTaskResult', 
                                             json=check_data, timeout=30)
                
                if check_response.status_code == 200:
                    check_result = check_response.json()
                    
                    if check_result.get('errorId', 0) != 0:
                        error_code = check_result.get('errorCode', 'UNKNOWN_ERROR')
                        error_desc = check_result.get('errorDescription', 'Unknown error')
                        return {'success': False, 'reason': f'Anti-Captcha error: {error_code} - {error_desc}'}
                    
                    status = check_result.get('status')
                    
                    if status == 'ready':
                        solution = check_result.get('solution', {})
                        token = solution.get('token')
                        user_agent = solution.get('userAgent')
                        cost = check_result.get('cost', 0)
                        solve_count = check_result.get('solveCount', 0)
                        
                        if token:
                            self.logger.info(f"🎉 Anti-Captcha solved enhanced Turnstile! Cost: ${cost}, Attempts: {solve_count}")
                            
                            result_data = {
                                'success': True,
                                'token': token,
                                'cost': cost,
                                'solve_count': solve_count,
                                'task_id': task_id,
                                'service': 'anticaptcha'
                            }
                            
                            if user_agent:
                                result_data['user_agent'] = user_agent
                                self.logger.info(f"📱 Received user agent: {user_agent}")
                            
                            return result_data
                        else:
                            return {'success': False, 'reason': 'Anti-Captcha: No token in solution'}
                    
                    elif status == 'processing':
                        self.logger.debug(f"Anti-Captcha processing enhanced Turnstile... attempt {attempt + 1}")
                        continue
                    else:
                        return {'success': False, 'reason': f'Anti-Captcha unknown status: {status}'}
                else:
                    self.logger.debug(f"Anti-Captcha check request failed: {check_response.status_code}")
            
            return {'success': False, 'reason': 'Anti-Captcha timeout after 5 minutes'}
            
        except Exception as e:
            self.logger.error(f"Anti-Captcha enhanced exception: {e}")
            return {'success': False, 'reason': f'Anti-Captcha error: {str(e)}'}

    def _submit_turnstile_solution(self, result: Dict[str, Any], turnstile_params: Dict[str, Any]) -> Dict[str, Any]:
        """Submit the Turnstile solution token with enhanced callback handling."""
        try:
            token = result.get('token')
            user_agent = result.get('user_agent')
            
            if not token:
                return {'success': False, 'reason': 'No token provided'}
            
            self.logger.info(f"🎯 Submitting Turnstile solution token: {token[:20]}...")
            
            # Set user agent if provided (important for Turnstile)
            if user_agent:
                try:
                    self.driver.execute_cdp_cmd('Network.setUserAgentOverride', {
                        "userAgent": user_agent
                    })
                    self.logger.info(f"📱 Set user agent for Turnstile submission: {user_agent}")
                except Exception as e:
                    self.logger.debug(f"Could not set user agent: {e}")
            
            # Method 1: Try to execute the callback function directly
            try:
                callback_result = self.driver.execute_script(f"""
                    if (window.tsCallback && typeof window.tsCallback === 'function') {{
                        window.tsCallback('{token}');
                        return 'callback_executed';
                    }}
                    return 'no_callback';
                """)
                
                if callback_result == 'callback_executed':
                    self.logger.info("✅ Executed Turnstile callback function with token")
                    time.sleep(3)
                    return self._wait_for_challenge_completion()
                else:
                    self.logger.debug("No callback function found, trying other methods")
                    
            except Exception as e:
                self.logger.debug(f"Callback execution failed: {e}")
            
            # Method 2: Look for token input field
            token_selectors = [
                'input[name="cf-turnstile-response"]',
                'textarea[name="cf-turnstile-response"]',
                'input[name="h-captcha-response"]',
                'textarea[name="h-captcha-response"]',
                'input[name="g-recaptcha-response"]',
                'textarea[name="g-recaptcha-response"]'
            ]
            
            token_submitted = False
            for selector in token_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    self.driver.execute_script(f"arguments[0].value = '{token}';", elements[0])
                    # Trigger change event
                    self.driver.execute_script("arguments[0].dispatchEvent(new Event('change'));", elements[0])
                    self.logger.info(f"✅ Submitted token to field: {selector}")
                    token_submitted = True
                    break
            
            # Method 3: Try JavaScript injection for various Turnstile scenarios
            if not token_submitted:
                self.logger.info("🔧 Trying JavaScript injection methods...")
                try:
                    injection_script = f"""
                        // Method 1: Direct turnstile callback
                        if (window.turnstile && window.turnstile.render) {{
                            window.turnstile.render = function() {{ return '{token}'; }};
                        }}
                        
                        // Method 2: Check for existing callback
                        if (window.cf_turnstile_callback) {{
                            window.cf_turnstile_callback('{token}');
                        }}
                        
                        // Method 3: Create hidden input with token
                        var tokenInput = document.createElement('input');
                        tokenInput.type = 'hidden';
                        tokenInput.name = 'cf-turnstile-response';
                        tokenInput.value = '{token}';
                        document.body.appendChild(tokenInput);
                        
                        // Method 4: Try to find and fill any turnstile response field
                        var responseFields = document.querySelectorAll('input[name*="turnstile"], textarea[name*="turnstile"], input[name*="captcha"], textarea[name*="captcha"]');
                        for (var i = 0; i < responseFields.length; i++) {{
                            responseFields[i].value = '{token}';
                            responseFields[i].dispatchEvent(new Event('change'));
                        }}
                        
                        return 'injection_completed';
                    """
                    
                    result_msg = self.driver.execute_script(injection_script)
                    self.logger.info(f"🔧 JavaScript injection result: {result_msg}")
                    
                except Exception as e:
                    self.logger.debug(f"JavaScript injection failed: {e}")
            
            # Method 4: Submit form
            try:
                forms = self.driver.find_elements(By.TAG_NAME, 'form')
                if forms:
                    self.driver.execute_script("arguments[0].submit();", forms[0])
                    self.logger.info("📤 Submitted Turnstile form")
                    time.sleep(3)
                    return self._wait_for_challenge_completion()
                else:
                    # Try to trigger form submission via JavaScript
                    self.driver.execute_script("""
                        // Try to find and submit any form
                        var forms = document.querySelectorAll('form');
                        if (forms.length > 0) {
                            forms[0].submit();
                        } else {
                            // Try to trigger click on submit buttons
                            var buttons = document.querySelectorAll('button[type="submit"], input[type="submit"], button');
                            for (var i = 0; i < buttons.length; i++) {
                                if (buttons[i].textContent.toLowerCase().includes('submit') || 
                                    buttons[i].textContent.toLowerCase().includes('continue') ||
                                    buttons[i].textContent.toLowerCase().includes('verify')) {
                                    buttons[i].click();
                                    break;
                                }
                            }
                        }
                    """)
                    self.logger.info("🔧 Attempted JavaScript form submission")
                    
            except Exception as e:
                self.logger.debug(f"Form submission failed: {e}")
            
            # Wait for completion
            time.sleep(5)
            return self._wait_for_challenge_completion()
            
        except Exception as e:
            self.logger.error(f"Error submitting Turnstile solution: {e}")
            return {'success': False, 'reason': f'Submission error: {str(e)}'}

    def _wait_for_challenge_completion(self, timeout: int = 15) -> Dict[str, Any]:
        """Wait for challenge completion after solution submission."""
        start_time = time.time()
        initial_url = self.driver.current_url
        
        # Check if this is a Turkish challenge page for special handling
        page_source = self.driver.page_source.lower()
        is_turkish_page = any(indicator in page_source for indicator in [
            'insan olduğunuzu doğrulayın', 
            'bağlantınızın güvenliğini gözden geçirmesi',
            'bir dakika lütfen'
        ])
        
        if is_turkish_page:
            self.logger.info("Turkish challenge completion detection - using enhanced method")
            
            # For Turkish pages, use different completion criteria
            while time.time() - start_time < timeout:
                try:
                    current_url = self.driver.current_url
                    
                    # Primary check: URL change away from access page
                    if 'access' not in current_url.lower():
                        self.logger.info(f"Turkish challenge completed - URL changed to: {current_url}")
                        return {'success': True, 'method': 'url_change'}
                    
                    # Secondary check: Page title change
                    try:
                        current_title = self.driver.title.lower()
                        if 'bir dakika' not in current_title and 'please wait' not in current_title:
                            self.logger.info(f"Turkish challenge completed - Title changed to: {current_title}")
                            return {'success': True, 'method': 'title_change'}
                    except Exception:
                        pass
                    
                    # Tertiary check: Turkish indicators gone from page
                    try:
                        current_page_source = self.driver.page_source.lower()
                        turkish_indicators_present = any(indicator in current_page_source for indicator in [
                            'insan olduğunuzu doğrulayın', 
                            'bağlantınızın güvenliğini gözden geçirmesi'
                        ])
                        
                        if not turkish_indicators_present:
                            self.logger.info("Turkish challenge completed - Challenge indicators cleared from page")
                            return {'success': True, 'method': 'indicators_cleared'}
                    except Exception:
                        pass
                    
                    time.sleep(2)  # Longer wait for Turkish challenges
                    
                except Exception as e:
                    self.logger.debug(f"Error waiting for Turkish completion: {e}")
                    time.sleep(2)
        
        else:
            # Standard completion detection for non-Turkish challenges
            while time.time() - start_time < timeout:
                try:
                    current_url = self.driver.current_url
                    
                    # Check if redirected away from challenge page
                    if current_url != initial_url and 'challenge' not in current_url.lower():
                        return {'success': True, 'method': 'redirect'}
                    
                    # Check if challenge elements disappeared (but don't call detect again to avoid loops)
                    page_source = self.driver.page_source.lower()
                    if not any(indicator.lower() in page_source for indicator in self.cloudflare_indicators):
                        return {'success': True, 'method': 'elements_cleared'}
                    
                    time.sleep(1)
                    
                except Exception as e:
                    self.logger.debug(f"Error waiting for completion: {e}")
                    time.sleep(1)
        
        return {'success': False, 'reason': 'Completion timeout'}

    def _manual_intervention_required(self, challenge_info: Dict[str, Any]) -> Dict[str, Any]:
        """Handle cases requiring manual intervention."""
        self.logger.warning("Manual intervention required for Cloudflare challenge")
        
        # Could implement notification system here
        # For now, return failure with instructions
        return {
            'success': False,
            'reason': 'Manual intervention required',
            'instructions': 'Please solve the Cloudflare challenge manually in the browser',
            'challenge_info': challenge_info
        }

    def _handle_turkish_challenge_fallback(self) -> Dict[str, Any]:
        """Fallback method for Turkish Cloudflare challenges that timeout."""
        try:
            self.logger.info("Attempting Turkish challenge fallback strategies...")
            
            # Strategy 1: Try clicking on checkboxes or buttons first
            try:
                # Look for checkbox elements
                checkbox_selectors = [
                    'input[type="checkbox"]',
                    '.cf-turnstile',
                    '[data-sitekey]',
                    'button[type="submit"]',
                    '.challenge-form button',
                    '.cf-challenge button'
                ]
                
                clicked_element = False
                for selector in checkbox_selectors:
                    try:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        if elements:
                            elements[0].click()
                            self.logger.info(f"Clicked checkbox/button: {selector}")
                            clicked_element = True
                            time.sleep(3)
                            break
                    except Exception as e:
                        self.logger.debug(f"Could not click {selector}: {e}")
                
                if not clicked_element:
                    # Fallback to clicking page body
                    self.driver.execute_script("document.body.click();")
                    time.sleep(2)
                    self.logger.debug("Clicked on page body")
                    
            except Exception as e:
                self.logger.debug(f"Click strategy failed: {e}")
            
            # Strategy 2: Try pressing Enter key
            try:
                from selenium.webdriver.common.keys import Keys
                self.driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ENTER)
                time.sleep(2)
                self.logger.debug("Pressed Enter key")
            except Exception as e:
                self.logger.debug(f"Enter key strategy failed: {e}")
            
            # Strategy 3: Try scrolling (sometimes triggers challenge completion)
            try:
                self.driver.execute_script("window.scrollTo(0, 100);")
                time.sleep(1)
                self.driver.execute_script("window.scrollTo(0, 0);")
                time.sleep(2)
                self.logger.debug("Performed scroll actions")
            except Exception as e:
                self.logger.debug(f"Scroll strategy failed: {e}")
            
            # Strategy 4: Wait a bit longer and check again
            self.logger.info("Waiting additional 15 seconds after fallback actions...")
            time.sleep(15)
            
            # Check if any of the strategies worked
            current_url = self.driver.current_url
            if 'access' not in current_url.lower():
                self.logger.info(f"Turkish challenge fallback successful - URL: {current_url}")
                return {'success': True, 'method': 'turkish_fallback'}
            
            # Check page source for changes
            page_source = self.driver.page_source.lower()
            if 'insan olduğunuzu doğrulayın' not in page_source:
                self.logger.info("Turkish challenge fallback successful - indicators cleared")
                return {'success': True, 'method': 'turkish_fallback'}
            
            self.logger.warning("Turkish challenge fallback strategies did not work")
            return {'success': False, 'reason': 'Turkish challenge fallback failed'}
            
        except Exception as e:
            self.logger.error(f"Error in Turkish challenge fallback: {e}")
            return {'success': False, 'reason': f'Fallback error: {str(e)}'}

    def handle_challenge_automatically(self, max_attempts: int = 3) -> Dict[str, Any]:
        """
        Main method to automatically detect and handle Cloudflare challenges.
        """
        for attempt in range(max_attempts):
            self.logger.info(f"Cloudflare challenge handling attempt {attempt + 1}/{max_attempts}")
            
            # Detect challenge
            challenge_info = self.detect_cloudflare_challenge()
            
            if not challenge_info['detected']:
                return {'success': True, 'method': 'no_challenge'}
            
            # Attempt to solve
            solve_result = self.solve_challenge(challenge_info)
            
            if solve_result['success']:
                self.logger.info("Cloudflare challenge solved successfully")
                return solve_result
            
            self.logger.warning(f"Challenge solve attempt {attempt + 1} failed: {solve_result['reason']}")
            
            # Wait before retry
            if attempt < max_attempts - 1:
                time.sleep(5)
        
        return {
            'success': False,
            'reason': f'Failed to solve challenge after {max_attempts} attempts',
            'last_error': solve_result.get('reason', 'Unknown error')
        } 

    def _solve_turkish_challenge_enhanced(self) -> bool:
        """
        Enhanced Turkish Cloudflare challenge solver with STRICT 2-attempt limit.
        If not working after 2 attempts, mark as captcha and close session.
        NO LONG WAITS - Quick attempts only.
        """
        try:
            self.logger.info("🇹🇷 TURKISH ENHANCED SOLVER: Starting specialized Turkish challenge solving...")
            
            # Try ONLY 2 attempts maximum - NO MORE
            for attempt in range(2):
                self.logger.info(f"🎯 Turkish challenge attempt {attempt + 1}/2")
                
                # Quick page refresh
                try:
                    current_url = self.driver.current_url
                    self.logger.info(f"🔄 Refreshing Turkish challenge page: {current_url}")
                    self.driver.refresh()
                    time.sleep(5)  # Short wait only
                    
                    # Quick check if resolved
                    current_url = self.driver.current_url
                    if 'x.com/account/access' not in current_url:
                        self.logger.info(f"✅ Turkish challenge resolved after refresh - redirected to: {current_url}")
                        return True
                    
                    # Quick Turnstile check - NO LONG WAITS
                    self.logger.info("🔧 Injecting 2captcha-recommended Turnstile interceptor for Cloudflare Challenge page...")
                    
                    # Inject interceptor
                    interceptor_script = """
                    window.turkishTurnstileData = null;
                    window.turkishCallbackFunction = null;
                    window.turkishDataExtracted = false;
                    
                    const i = setInterval(() => {
                        if (window.turnstile) {
                            clearInterval(i);
                            window.turnstile.render = (a, b) => {
                                let p = {
                                    type: "TurnstileTaskProxyless",
                                    websiteKey: b.sitekey,
                                    websiteURL: window.location.href,
                                    data: b.cData,
                                    pagedata: b.chlPageData,
                                    action: b.action,
                                    userAgent: navigator.userAgent
                                };
                                window.turkishTurnstileData = p;
                                window.tsCallback = b.callback;
                                window.turkishCallbackFunction = b.callback;
                                window.turkishDataExtracted = true;
                                return 'intercepted';
                            };
                        }
                    }, 10);
                    
                    setTimeout(() => {
                        clearInterval(i);
                    }, 10000);
                    
                    return true;
                    """
                    
                    self.driver.execute_script(interceptor_script)
                    
                    # Wait for Turnstile data - MAXIMUM 10 seconds only
                    self.logger.info("⏳ Waiting for Turkish Turnstile data extraction...")
                    
                    turnstile_data = None
                    for data_attempt in range(10):  # 10 seconds max wait
                        try:
                            data = self.driver.execute_script("return window.turkishTurnstileData;")
                            if data and data.get('websiteKey'):
                                turnstile_data = data
                                self.logger.info(f"✅ Turkish Turnstile data extracted: {turnstile_data}")
                                break
                        except Exception as e:
                            self.logger.debug(f"Turkish data extraction attempt {data_attempt + 1} failed: {e}")
                        
                        time.sleep(1)
                    
                    # If no Turnstile data, try DOM extraction quickly
                    if not turnstile_data:
                        self.logger.warning("⚠️ JavaScript interception failed, trying DOM extraction...")
                        turnstile_data = self._extract_turkish_turnstile_from_dom()
                    
                    # If still no data, try non-Turnstile approach
                    if not turnstile_data:
                        self.logger.info("❌ Could not extract Turkish Turnstile data - trying non-Turnstile approach")
                        if self._solve_non_turnstile_turkish_challenge():
                            return True
                    
                    # If this attempt failed, wait briefly before next attempt
                    if attempt < 1:  # Only wait if not the last attempt
                        self.logger.info(f"⏳ Attempt {attempt + 1} failed, waiting 5 seconds before next attempt...")
                        time.sleep(5)
                
                except Exception as e:
                    self.logger.error(f"Turkish challenge attempt {attempt + 1} error: {e}")
                    if attempt < 1:
                        time.sleep(5)
            
            # After 2 attempts failed - mark as captcha and return False
            self.logger.warning("❌ 2 Turkish challenge attempts failed - marking as captcha")
            
            # Mark captcha detected immediately
            if self.profile_id:
                self._mark_captcha_detected(self.profile_id, "Turkish Cloudflare challenge - 2 attempts failed")
            
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Turkish enhanced solver error: {e}")
            
            # Mark captcha detected on error too
            if self.profile_id:
                self._mark_captcha_detected(self.profile_id, f"Turkish Cloudflare challenge error: {str(e)}")
            
            return False

    def _solve_non_turnstile_turkish_challenge(self) -> bool:
        """
        Handle Turkish challenges that don't have Turnstile elements.
        STRICT 2-attempt limit - NO LONG WAITS.
        """
        try:
            self.logger.info("🇹🇷 NON-TURNSTILE TURKISH SOLVER: Starting time-based/redirect challenge solving...")
            
            # Strategy 1: Check for meta refresh - but cap at 60 seconds max
            meta_refresh = self.driver.find_elements(By.CSS_SELECTOR, 'meta[http-equiv="refresh"]')
            if meta_refresh:
                content = meta_refresh[0].get_attribute('content')
                if content:
                    timeout_match = re.search(r'(\d+)', content)
                    if timeout_match:
                        timeout = int(timeout_match.group(1))
                        self.logger.info(f"🔄 Found meta refresh: {timeout}")
                        
                        # Cap timeout at 60 seconds instead of 360
                        if timeout > 60:
                            self.logger.warning(f"⚠️ Meta refresh timeout too long ({timeout}s), capping at 60s")
                            timeout = 60
                        
                        self.logger.info(f"⏳ Waiting {timeout} seconds for meta refresh...")
                        time.sleep(timeout)
                        
                        current_url = self.driver.current_url
                        if 'x.com/account/access' not in current_url:
                            self.logger.info(f"✅ Meta refresh successful - redirected to: {current_url}")
                            return True
            
            # Strategy 2: Try ONLY 2 quick attempts
            self.logger.info("🔄 Trying 2 quick attempts...")
            
            for attempt in range(2):
                self.logger.info(f"🎯 Attempt {attempt + 1}/2 - Quick page interaction...")
                
                try:
                    # Click in the center of the page
                    self.driver.execute_script("""
                        const centerX = window.innerWidth / 2;
                        const centerY = window.innerHeight / 2;
                        const element = document.elementFromPoint(centerX, centerY);
                        if (element) {
                            element.click();
                        }
                    """)
                    
                    time.sleep(3)  # Short wait only
                    
                    # Check if this helped
                    current_url = self.driver.current_url
                    if 'x.com/account/access' not in current_url:
                        self.logger.info(f"✅ Quick attempt {attempt + 1} successful - redirected to: {current_url}")
                        return True
                    
                    # Try a gentle page refresh
                    self.driver.refresh()
                    time.sleep(3)
                    
                    current_url = self.driver.current_url
                    if 'x.com/account/access' not in current_url:
                        self.logger.info(f"✅ Refresh attempt {attempt + 1} successful - redirected to: {current_url}")
                        return True
                    
                except Exception as e:
                    self.logger.debug(f"Quick attempt {attempt + 1} failed: {e}")
            
            # After 2 attempts failed - mark as captcha and return False
            self.logger.warning("❌ 2 quick attempts failed - marking as captcha and closing session")
            
            # Mark captcha detected immediately
            if self.profile_id:
                self._mark_captcha_detected(self.profile_id, "Turkish Cloudflare challenge - 2 attempts failed")
            
            return False
            
        except Exception as e:
            self.logger.error(f"❌ Non-Turnstile Turkish solver error: {e}")
            
            # Mark captcha detected on error too
            if self.profile_id:
                self._mark_captcha_detected(self.profile_id, f"Turkish Cloudflare challenge error: {str(e)}")
            
            return False

    def _extract_turkish_turnstile_from_dom(self) -> Optional[Dict[str, Any]]:
        """Extract Turnstile data from DOM elements for Turkish challenges."""
        try:
            self.logger.info("🔍 TURKISH DOM EXTRACTION: Starting comprehensive DOM analysis...")
            
            # First, let's analyze what's actually on the page
            page_source = self.driver.page_source
            current_url = self.driver.current_url
            page_title = self.driver.title
            
            self.logger.info(f"📄 Page analysis - URL: {current_url}")
            self.logger.info(f"📄 Page analysis - Title: {page_title}")
            self.logger.info(f"📄 Page analysis - Source length: {len(page_source)} characters")
            
            # Check if this is actually a Cloudflare challenge page
            cf_indicators = ['cloudflare', 'cf-', 'challenge', 'ray id', 'performance & security']
            found_cf_indicators = [ind for ind in cf_indicators if ind.lower() in page_source.lower()]
            self.logger.info(f"🔍 Cloudflare indicators found: {found_cf_indicators}")
            
            # Look for any form of interactive elements
            interactive_selectors = [
                'input', 'button', 'form', 'iframe', 'div[onclick]', 'a[href]',
                '[data-sitekey]', '[data-turnstile-sitekey]', '.cf-turnstile',
                'iframe[src*="turnstile"]', 'div[id*="turnstile"]', '[data-callback]',
                'script[src*="turnstile"]', 'script[src*="cloudflare"]'
            ]
            
            found_elements = {}
            for selector in interactive_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    found_elements[selector] = len(elements)
                    self.logger.info(f"🔍 Found {len(elements)} elements for selector: {selector}")
            
            # Look for Turnstile elements specifically
            turnstile_selectors = [
                '[data-sitekey]',
                '[data-turnstile-sitekey]',
                '.cf-turnstile',
                'iframe[src*="turnstile"]',
                'div[id*="turnstile"]'
            ]
            
            for selector in turnstile_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    element = elements[0]
                    sitekey = (element.get_attribute('data-sitekey') or 
                              element.get_attribute('data-turnstile-sitekey') or
                              element.get_attribute('sitekey'))
                    
                    if sitekey:
                        self.logger.info(f"✅ Found Turkish Turnstile sitekey in DOM: {sitekey}")
                        return {
                            'websiteURL': current_url,
                            'websiteKey': sitekey,
                            'userAgent': self.driver.execute_script("return navigator.userAgent;"),
                            'action': 'managed',
                            'data': '',
                            'pagedata': ''
                        }
            
            # Try to extract from page source with more patterns
            import re
            
            # Look for sitekey in JavaScript
            sitekey_patterns = [
                r'sitekey["\']?\s*[:=]\s*["\']([^"\']{10,})["\']',
                r'data-sitekey["\']?\s*[:=]\s*["\']([^"\']{10,})["\']',
                r'"sitekey"\s*:\s*"([^"]{10,})"',
                r'turnstile["\']?\s*[:=]\s*["\']([^"\']{10,})["\']',
                r'cf-turnstile["\'].*?sitekey["\']?\s*[:=]\s*["\']([^"\']{10,})["\']'
            ]
            
            for pattern in sitekey_patterns:
                matches = re.findall(pattern, page_source, re.IGNORECASE)
                if matches:
                    sitekey = matches[0]
                    self.logger.info(f"✅ Found Turkish Turnstile sitekey in source: {sitekey}")
                    return {
                        'websiteURL': current_url,
                        'websiteKey': sitekey,
                        'userAgent': self.driver.execute_script("return navigator.userAgent;"),
                        'action': 'managed',
                        'data': '',
                        'pagedata': ''
                    }
            
            # Check for any JavaScript that might indicate a challenge
            js_patterns = [
                r'window\.turnstile',
                r'cf-turnstile',
                r'cloudflare',
                r'challenge',
                r'captcha'
            ]
            
            found_js_patterns = []
            for pattern in js_patterns:
                if re.search(pattern, page_source, re.IGNORECASE):
                    found_js_patterns.append(pattern)
            
            if found_js_patterns:
                self.logger.info(f"🔍 Found JavaScript patterns: {found_js_patterns}")
            
            # If this is a Turkish challenge page but no Turnstile elements found,
            # it might be a different type of challenge (like a simple redirect or time-based)
            if any(indicator in page_source.lower() for indicator in ['insan olduğunuzu doğrulayın', 'bağlantınızın güvenliğini gözden geçirmesi', 'bir dakika lütfen']):
                self.logger.warning("🇹🇷 Turkish challenge detected but no Turnstile elements found")
                self.logger.info("🔍 This might be a time-based or redirect challenge, not a Turnstile challenge")
                
                # Try to check if it's just a waiting page
                meta_refresh = self.driver.find_elements(By.CSS_SELECTOR, 'meta[http-equiv="refresh"]')
                if meta_refresh:
                    refresh_content = meta_refresh[0].get_attribute('content')
                    self.logger.info(f"🔄 Found meta refresh: {refresh_content}")
                
                # Check for any JavaScript that might handle automatic redirect
                scripts = self.driver.find_elements(By.TAG_NAME, 'script')
                for script in scripts:
                    script_content = script.get_attribute('innerHTML')
                    if script_content and ('setTimeout' in script_content or 'setInterval' in script_content or 'location' in script_content):
                        self.logger.info(f"🔍 Found potentially relevant script: {script_content[:200]}...")
                        break
            
            self.logger.warning("❌ No Turnstile data found in DOM extraction")
            return None
            
        except Exception as e:
            self.logger.error(f"Error extracting Turkish Turnstile from DOM: {e}")
            return None
    
    def _solve_turkish_with_2captcha(self, turnstile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Solve Turkish Turnstile challenge with 2captcha using proper parameters."""
        try:
            # Create task with all available parameters
            task = {
                "type": "TurnstileTaskProxyless",
                "websiteURL": turnstile_data['websiteURL'],
                "websiteKey": turnstile_data['websiteKey']
            }
            
            # Add optional parameters
            if turnstile_data.get('action'):
                task["action"] = turnstile_data['action']
            if turnstile_data.get('data'):
                task["data"] = turnstile_data['data']
            if turnstile_data.get('pagedata'):
                task["pagedata"] = turnstile_data['pagedata']
            
            self.logger.info(f"🚀 Submitting Turkish Turnstile task to 2captcha: {task}")
            
            # Submit task
            create_response = requests.post(
                'https://api.2captcha.com/createTask',
                json={"clientKey": self.twocaptcha_key, "task": task},
                timeout=30
            )
            
            if create_response.status_code != 200:
                return {'success': False, 'reason': f'HTTP {create_response.status_code}'}
            
            create_result = create_response.json()
            if create_result.get('errorId', 0) != 0:
                return {'success': False, 'reason': create_result.get('errorDescription', 'Unknown error')}
            
            task_id = create_result.get('taskId')
            if not task_id:
                return {'success': False, 'reason': 'No task ID returned'}
            
            self.logger.info(f"✅ Turkish task created: {task_id}")
            
            # Wait for solution with extended timeout for Turkish challenges
            max_wait = 240  # 4 minutes
            check_interval = 5
            
            for attempt in range(max_wait // check_interval):
                time.sleep(check_interval)
                
                check_response = requests.post(
                    'https://api.2captcha.com/getTaskResult',
                    json={"clientKey": self.twocaptcha_key, "taskId": task_id},
                    timeout=30
                )
                
                if check_response.status_code == 200:
                    check_result = check_response.json()
                    
                    if check_result.get('status') == 'ready':
                        solution = check_result.get('solution', {})
                        token = solution.get('token')
                        user_agent = solution.get('userAgent')  # Get userAgent from API response
                        
                        if token:
                            self.logger.info(f"🎉 Turkish challenge solved! Token: {token[:20]}...")
                            
                            # Log userAgent if provided
                            if user_agent:
                                self.logger.info(f"📱 Received userAgent from 2captcha: {user_agent}")
                            
                            return {
                                'success': True,
                                'token': token,
                                'userAgent': user_agent,  # Include userAgent in response
                                'cost': check_result.get('cost', 0),
                                'service': '2captcha'
                            }
                    
                    elif check_result.get('status') == 'processing':
                        self.logger.debug(f"Turkish challenge processing... attempt {attempt + 1}")
                        continue
                    else:
                        error_desc = check_result.get('errorDescription', 'Unknown error')
                        return {'success': False, 'reason': error_desc}
            
            return {'success': False, 'reason': 'Timeout after 4 minutes'}
            
        except Exception as e:
            self.logger.error(f"Turkish 2captcha solve error: {e}")
            return {'success': False, 'reason': str(e)}
    
    def _submit_turkish_token_via_callback(self, token: str) -> bool:
        """Submit Turkish challenge token via callback function."""
        try:
            result = self.driver.execute_script(f"""
                if (window.turkishCallbackFunction && typeof window.turkishCallbackFunction === 'function') {{
                    console.log('🇹🇷 Executing Turkish callback with token');
                    window.turkishCallbackFunction('{token}');
                    return true;
                }}
                
                // Fallback to global callback
                if (window.tsCallback && typeof window.tsCallback === 'function') {{
                    console.log('🇹🇷 Executing global callback with token');
                    window.tsCallback('{token}');
                    return true;
                }}
                
                return false;
            """)
            
            if result:
                self.logger.info("✅ Turkish token submitted via callback")
                time.sleep(3)  # Wait for callback to process
                return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Turkish callback submission error: {e}")
            return False
    
    def _submit_turkish_token_via_form(self, token: str) -> bool:
        """Submit Turkish challenge token via form fields."""
        try:
            # Look for token input fields
            selectors = [
                'input[name="cf-turnstile-response"]',
                'textarea[name="cf-turnstile-response"]',
                'input[name="h-captcha-response"]',
                'textarea[name="h-captcha-response"]',
                'input[name="g-recaptcha-response"]',
                'textarea[name="g-recaptcha-response"]'
            ]
            
            for selector in selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    element = elements[0]
                    self.driver.execute_script(f"""
                        arguments[0].value = '{token}';
                        arguments[0].dispatchEvent(new Event('change'));
                        arguments[0].dispatchEvent(new Event('input'));
                    """, element)
                    
                    self.logger.info(f"✅ Turkish token set in form field: {selector}")
                    
                    # Try to submit form
                    form = element.find_element(By.XPATH, "./ancestor::form")
                    if form:
                        self.driver.execute_script("arguments[0].submit();", form)
                        self.logger.info("✅ Turkish form submitted")
                        return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Turkish form submission error: {e}")
            return False
    
    def _submit_turkish_token_via_reload(self, token: str) -> bool:
        """Submit Turkish challenge token via page reload with token injection."""
        try:
            # Inject token into page and reload
            self.driver.execute_script(f"""
                // Store token globally
                window.turkishChallengeToken = '{token}';
                
                // Try to find and populate any token fields
                const tokenFields = document.querySelectorAll('input[name*="turnstile"], textarea[name*="turnstile"], input[name*="captcha"], textarea[name*="captcha"]');
                tokenFields.forEach(field => {{
                    field.value = '{token}';
                    field.dispatchEvent(new Event('change'));
                }});
                
                // Force page reload
                window.location.reload();
            """)
            
            self.logger.info("✅ Turkish token injected and page reloaded")
            time.sleep(5)  # Wait for reload
            return True
            
        except Exception as e:
            self.logger.error(f"Turkish reload submission error: {e}")
            return False
    
    def _wait_for_turkish_challenge_completion(self) -> bool:
        """Wait for Turkish challenge to complete with enhanced detection."""
        try:
            self.logger.info("⏳ Waiting for Turkish challenge completion...")
            
            max_wait = 30  # 30 seconds
            for attempt in range(max_wait):
                time.sleep(1)
                
                # Check if we're no longer on a challenge page
                current_url = self.driver.current_url
                page_title = self.driver.title.lower()
                page_source = self.driver.page_source.lower()
                
                # Success indicators
                success_indicators = [
                    'x.com/home' in current_url,
                    'x.com/i/flow' in current_url,
                    'twitter.com/home' in current_url,
                    'dashboard' in page_title,
                    'timeline' in page_source,
                    'tweet' in page_source and 'compose' in page_source
                ]
                
                if any(success_indicators):
                    self.logger.info(f"✅ Turkish challenge completed! Redirected to: {current_url}")
                    
                    # Mark spam resolved in database
                    if self.profile_id:
                        self._mark_spam_resolved(self.profile_id)
                    
                    return True
                
                # Check if Turkish challenge indicators are gone
                turkish_indicators = [
                    'insan olduğunuzu doğrulayın',
                    'bağlantınızın güvenliğini gözden geçirmesi',
                    'bir dakika lütfen',
                    'güvenlik kontrolü'
                ]
                
                if not any(indicator in page_source for indicator in turkish_indicators):
                    self.logger.info("✅ Turkish challenge indicators removed from page")
                    return True
                
                # Log progress
                if attempt % 5 == 0:
                    self.logger.debug(f"Turkish challenge completion check {attempt + 1}/{max_wait}")
            
            self.logger.warning("⚠️ Turkish challenge completion timeout")
            return False
            
        except Exception as e:
            self.logger.error(f"Turkish challenge completion error: {e}")
            return False

    def _mark_spam_detected(self, profile_id: str, reason: str = "Cloudflare challenge detected"):
        """Mark spam detected in database for Twitter accounts."""
        try:
            import sqlite3
            conn = sqlite3.connect('twitter_accounts.db')
            c = conn.cursor()
            
            # Find Twitter account linked to this GoLogin profile
            c.execute('''
                SELECT ta.id 
                FROM twitter_accounts ta
                JOIN gologin_profiles gp ON ta.id = gp.account_id
                WHERE gp.profile_id = ?
            ''', (profile_id,))
            result = c.fetchone()
            
            if result:
                account_id = result[0]
                c.execute('''
                    UPDATE twitter_accounts 
                    SET spam_detected = 1,
                        spam_detected_at = ?,
                        spam_detection_reason = ?,
                        spam_resolved = 0,
                        spam_resolved_at = NULL
                    WHERE id = ?
                ''', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'), reason, account_id))
                
                conn.commit()
                self.logger.info(f"✅ Marked spam detected for Twitter account {account_id} (profile {profile_id}): {reason}")
            else:
                self.logger.warning(f"❌ No Twitter account found for GoLogin profile {profile_id}")
            
            # Always mark captcha for GoLogin profile regardless of Twitter account link
            self._mark_captcha_detected(profile_id, reason)
            
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error marking spam detected for profile {profile_id}: {e}")
            # Still try to mark captcha even if spam detection fails
            try:
                self._mark_captcha_detected(profile_id, reason)
            except Exception as captcha_error:
                self.logger.error(f"Error marking captcha detected for profile {profile_id}: {captcha_error}")

    def _mark_captcha_detected(self, profile_id: str, reason: str = "Captcha challenge detected"):
        """Mark captcha detected for a GoLogin profile and stop the cloud session."""
        try:
            manager = EnhancedGoLoginManager()
            success = manager.mark_captcha_detected(profile_id, reason)
            
            if success:
                self.logger.info(f"✅ Marked captcha detected for GoLogin profile {profile_id}: {reason}")
                
                # CRITICAL: Stop the cloud session when captcha is detected
                self.logger.info(f"🛑 Stopping cloud session for profile {profile_id} due to captcha detection")
                stop_result = manager.stop_cloud_session(profile_id)
                
                if stop_result.get('status') == 'success':
                    session_duration = stop_result.get('session_duration', 0)
                    self.logger.info(f"✅ Cloud session stopped for profile {profile_id} (Duration: {session_duration:.1f}s)")
                elif stop_result.get('status') == 'warning':
                    self.logger.warning(f"⚠️ No active session found for profile {profile_id}: {stop_result.get('message', 'Unknown')}")
                else:
                    self.logger.error(f"❌ Failed to stop cloud session for profile {profile_id}: {stop_result.get('message', 'Unknown error')}")
                
            else:
                self.logger.warning(f"❌ Failed to mark captcha detected for GoLogin profile {profile_id}")
                
        except Exception as e:
            self.logger.error(f"Error marking captcha detected for GoLogin profile {profile_id}: {e}")

    def _mark_spam_resolved(self, profile_id: str):
        """
        Mark an account's spam status as resolved in the database.
        """
        try:
            # Connect to database
            conn = sqlite3.connect('twitter_accounts.db')
            cursor = conn.cursor()
            
            # Update spam resolution status using the correct relationship
            cursor.execute("""
                UPDATE twitter_accounts 
                SET spam_resolved = 1, 
                    spam_resolved_at = ?
                WHERE id = (
                    SELECT account_id 
                    FROM gologin_profiles 
                    WHERE profile_id = ?
                )
            """, (datetime.now().isoformat(), profile_id))
            
            if cursor.rowcount > 0:
                self.logger.info(f"✅ SPAM RESOLVED: Marked profile {profile_id} as spam resolved")
            else:
                self.logger.warning(f"⚠️ Could not find profile {profile_id} in database for spam resolution")
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Error marking spam resolution for profile {profile_id}: {e}")