"""
Threads Automation Worker
Orchestrates GoLogin sessions and executes automation actions based on settings.
"""
import sys
import os
import time
import random
import logging
import uuid
import json
from datetime import datetime, date
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from config import Config
from database import Database
from core.actions import ThreadsActions
from core.selectors import SELECTORS
from core.filters import ThreadsFilters
from core.ai_generator import AICommentGenerator

logger = logging.getLogger(__name__)


class ThreadsWorker:
    def __init__(self, profile_id, settings=None, db=None):
        self.profile_id = profile_id
        self.settings = settings or Config.DEFAULT_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        
        # Create directories
        self.screenshot_dir = Path(__file__).parent / 'screenshots'
        self.screenshot_dir.mkdir(exist_ok=True)
        self.log_dir = Path(__file__).parent / 'logs'
        self.log_dir.mkdir(exist_ok=True)
        
        self.stats = {
            "follows": 0,
            "likes": 0,
            "comments": 0,
            "errors": 0
        }
        
        # Track liked usernames to avoid duplicates
        self.liked_users = set()

    def take_screenshot(self, driver, name):
        """Save screenshot for debugging and proof"""
        try:
            ts = datetime.now().strftime('%H%M%S')
            filename = f'{ts}_{name}.png'
            path = self.screenshot_dir / filename
            driver.save_screenshot(str(path))
            print(f"[SCREENSHOT] {path}")
            return str(path)
        except Exception as e:
            print(f"[ERROR] Screenshot failed: {e}")
            return None

    def _extract_username_from_like(self, like_button):
        """Extract the username of the post author from a Like button context"""
        try:
            # Strategy 1: Go up to find post container, then find username link
            try:
                parent = like_button
                for _ in range(15):  # Go up max 15 levels
                    parent = parent.find_element(By.XPATH, '..')
                    links = parent.find_elements(By.XPATH, './/a[contains(@href, "/@")]')
                    if links:
                        href = links[0].get_attribute('href')
                        username = href.split('/@')[-1].split('/')[0].split('?')[0]
                        if username and username != 'threads.net':
                            return username
            except:
                pass
            
            # Strategy 2: Find any nearby span with username pattern
            try:
                parent = like_button
                for _ in range(10):
                    parent = parent.find_element(By.XPATH, '..')
                    spans = parent.find_elements(By.XPATH, './/span[contains(@class, "x1lliihq")]')
                    for span in spans:
                        text = span.text.strip()
                        if text and not ' ' in text and len(text) < 30:
                            return text
            except:
                pass
            
            return "unknown"
        except Exception as e:
            return "unknown"

    def _log_to_file(self, action_type, username, extra=""):
        """Log action to permanent file"""
        try:
            log_file = self.log_dir / f'actions_{datetime.now().strftime("%Y%m%d")}.log'
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"[{timestamp}] {action_type.upper():8} | @{username:20} | session:{self.session_id[:8]} | {extra}\n")
        except Exception as e:
            print(f"[ERROR] Log to file failed: {e}")

    def _find_follow_button_for_post(self, like_button, driver):
        """Find the Follow button (+ icon) for the same post as the Like button"""
        try:
            # Go up from the Like button to find the post container
            parent = like_button
            for _ in range(20):  # Go up max 20 levels to find post container
                parent = parent.find_element(By.XPATH, '..')
                
                # Look for the + icon (Follow button) within this container
                # The + icon is usually an SVG with specific classes or near the avatar
                try:
                    # Method 1: Find SVG with "Add" or follow-related aria-label
                    follow_svgs = parent.find_elements(By.XPATH, './/svg[@aria-label="Follow" or @aria-label="Add"]')
                    if follow_svgs:
                        # Get the clickable parent
                        for svg in follow_svgs:
                            try:
                                btn = svg.find_element(By.XPATH, './ancestor::div[@role="button"][1]')
                                return btn
                            except:
                                pass
                except:
                    pass
                
                # Method 2: Find div[role=button] containing the + icon near avatar
                try:
                    # Look for the blue + circle on profile pictures
                    plus_buttons = parent.find_elements(By.XPATH, 
                        './/div[@role="button"][contains(@class, "x1pahc9y") or contains(@class, "xeusxvb")]')
                    for btn in plus_buttons:
                        # Check if it's small (follow button is small, not the main buttons)
                        size = btn.size
                        if size.get('width', 100) < 50 and size.get('height', 100) < 50:
                            return btn
                except:
                    pass
                
                # Method 3: Find any element with "Follow" text that's clickable
                try:
                    follow_links = parent.find_elements(By.XPATH, 
                        './/a[contains(., "Follow")] | .//div[@role="button"][contains(., "Follow")]')
                    for link in follow_links:
                        text = link.text.strip()
                        # Make sure it says "Follow" not "Following" or "Followers"
                        if text == "Follow":
                            return link
                except:
                    pass
            
            return None
        except Exception as e:
            print(f"[DEBUG] Error finding follow button: {e}")
            return None

    def start(self):
        """Main automation entry point"""
        print(f"\n{'='*80}")
        print(f"[SESSION START] Profile: {self.profile_id}")
        print(f"Session ID: {self.session_id}")
        print(f"{'='*80}\n")
        
        logger.info(f"Starting session {self.session_id} for profile {self.profile_id}")
        
        # Create session in DB
        self.db.create_session(self.session_id, self.profile_id)

        try:
            if not self._check_limits():
                logger.warning("Daily limits reached. Stopping.")
                return

            print("[1/4] Launching browser...")
            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                print("[1/4] Browser launched!")
                self.take_screenshot(driver, '01_browser_launched')
                
                actions = ThreadsActions(driver)
                self._run_automation_loop(driver, actions)

        except Exception as e:
            logger.error(f"Session failed: {e}")
            print(f"[ERROR] Session failed: {e}")
            self.stats["errors"] += 1
            self.db.log_action(self.session_id, self.profile_id, "session_error", 
                              error=str(e), status='failed')
            import traceback
            traceback.print_exc()
        finally:
            # Complete session with stats
            self.db.complete_session(self.session_id, self.stats)
            
            print(f"\n{'='*80}")
            print(f"[4/4] SESSION COMPLETE")
            print(f"Stats: Likes={self.stats['likes']}, Follows={self.stats['follows']}, Errors={self.stats['errors']}")
            print(f"{'='*80}\n")

    def _run_automation_loop(self, driver, actions):
        """Core automation logic"""
        print("[2/4] Navigating to threads.com...")
        driver.get("https://www.threads.com/")
        time.sleep(15)
        
        print(f"[2/4] Page loaded. URL: {driver.current_url}")
        print(f"[2/4] Title: {driver.title}")
        self.take_screenshot(driver, '02_page_loaded')
        
        # Page analysis
        all_buttons = driver.find_elements(By.TAG_NAME, "button")
        all_divs_btn = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
        like_svgs = driver.find_elements(By.CSS_SELECTOR, 'svg[aria-label="Like"]')
        print(f"[DEBUG] Page: {len(all_buttons)} buttons, {len(all_divs_btn)} div[role=button], {len(like_svgs)} Like SVGs")
        
        # Check if login required
        if 'login' in driver.current_url.lower():
            print("[ERROR] Login page detected! Profile not logged in.")
            self.take_screenshot(driver, '03_login_required')
            self.db.log_action(self.session_id, self.profile_id, "error", 
                              error="Login required", status='failed')
            return
        
        # Start automation loop
        print("\n[3/4] Starting automation loop...")
        print("[3/4] Mode: FOLLOW first, then LIKE each post")
        processed_count = 0
        max_actions = 10
        scroll_attempts = 0
        max_scrolls = 5
        
        while processed_count < max_actions and scroll_attempts < max_scrolls:
            scroll_attempts += 1
            print(f"\n{'─'*60}")
            print(f"[3/4] SCROLL {scroll_attempts}/{max_scrolls}")
            print(f"{'─'*60}")
            
            # Find Like buttons (hearts) - each represents a post
            like_buttons = actions.find_like_buttons(driver)
            print(f"[3/4] Found {len(like_buttons)} posts (Like buttons)")
            
            if len(like_buttons) == 0:
                print("[3/4] No posts found, scrolling...")
                self.take_screenshot(driver, f'scroll_{scroll_attempts}_no_posts')
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)
                continue
            
            # Process each post: FOLLOW first, then LIKE
            for i, like_btn in enumerate(like_buttons[:5]):  # Max 5 per scroll
                if processed_count >= max_actions:
                    break
                
                try:
                    # Extract username from this post
                    username = self._extract_username_from_like(like_btn)
                    
                    # Skip if already processed this user
                    if username in self.liked_users and username != "unknown":
                        print(f"[3/4] Skipping @{username} (already processed)")
                        continue
                    
                    print(f"\n[3/4] ━━━ POST {i+1} ━━━")
                    print(f"[3/4] 👤 Target: @{username}")
                    
                    # ========== STEP 1: FOLLOW ==========
                    print(f"[3/4] Step 1: Looking for Follow button...")
                    follow_btn = self._find_follow_button_for_post(like_btn, driver)
                    
                    if follow_btn:
                        print(f"[3/4] Found Follow button, clicking...")
                        if actions.safe_click(follow_btn):
                            self.stats["follows"] += 1
                            print(f"[3/4] ✅ FOLLOWED @{username}!")
                            
                            # Screenshot after follow
                            screenshot_name = f'follow_{self.stats["follows"]:02d}_{username}'
                            screenshot_path = self.take_screenshot(driver, screenshot_name)
                            
                            # Log to DB
                            self.db.log_action(
                                session_id=self.session_id,
                                profile_id=self.profile_id,
                                action_type='follow',
                                target_username=username,
                                target_url=driver.current_url,
                                status='success',
                                screenshot_path=screenshot_path
                            )
                            self.db.update_daily_stats(self.profile_id, 'follow')
                            self._log_to_file('follow', username)
                            
                            actions.random_delay(1, 2)
                        else:
                            print(f"[3/4] ❌ Follow click failed")
                    else:
                        print(f"[3/4] ⚠️ No Follow button found (maybe already following)")
                    
                    # ========== STEP 2: LIKE ==========
                    print(f"[3/4] Step 2: Clicking Like button...")
                    if actions.safe_click(like_btn):
                        self.stats["likes"] += 1
                        processed_count += 1
                        self.liked_users.add(username)
                        
                        print(f"[3/4] ✅ LIKED @{username}!")
                        
                        # Screenshot after like
                        screenshot_name = f'like_{self.stats["likes"]:02d}_{username}'
                        screenshot_path = self.take_screenshot(driver, screenshot_name)
                        
                        # Log to DB
                        self.db.log_action(
                            session_id=self.session_id,
                            profile_id=self.profile_id,
                            action_type='like',
                            target_username=username,
                            target_url=driver.current_url,
                            status='success',
                            screenshot_path=screenshot_path
                        )
                        self.db.update_daily_stats(self.profile_id, 'like')
                        self._log_to_file('like', username)
                        
                        print(f"[3/4] ✅ Completed: Follow + Like for @{username}")
                        actions.random_delay(2, 4)
                    else:
                        print(f"[3/4] ❌ Like click failed for @{username}")
                        
                except Exception as e:
                    print(f"[ERROR] Action failed: {e}")
                    self.stats["errors"] += 1
                    self.db.log_action(
                        session_id=self.session_id,
                        profile_id=self.profile_id,
                        action_type='error',
                        status='failed',
                        error=str(e)
                    )
            
            # Scroll for more
            if processed_count < max_actions:
                print("\n[3/4] Scrolling for more content...")
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)
        
        # Final summary
        print(f"\n{'─'*60}")
        print(f"[3/4] AUTOMATION COMPLETE")
        print(f"{'─'*60}")
        print(f"Total Follows: {self.stats['follows']}")
        print(f"Total Likes: {self.stats['likes']}")
        print(f"Total Errors: {self.stats['errors']}")
        print(f"Users Processed: {', '.join(self.liked_users) if self.liked_users else 'None'}")
        
        self.take_screenshot(driver, 'final_state')

    def _check_limits(self):
        """Check against daily limits"""
        max_likes = self.settings.get('max_likes_per_day', 100)
        if self.db.is_daily_limit_reached(self.profile_id, 'like', max_likes):
            print(f"[LIMIT] Daily like limit ({max_likes}) reached!")
            return False
        return True
