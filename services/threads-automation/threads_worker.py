"""
Threads Automation Worker
Orchestrates GoLogin sessions and executes automation actions based on settings.
Follow first, then Like each post.
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
        
        # Track processed users to avoid duplicates
        self.processed_users = set()
        self.followed_users = []  # Track who we followed

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

    def _extract_username_from_post(self, element):
        """Extract username from a post element by finding nearby links"""
        try:
            parent = element
            for _ in range(15):
                parent = parent.find_element(By.XPATH, '..')
                links = parent.find_elements(By.XPATH, './/a[contains(@href, "/@")]')
                if links:
                    href = links[0].get_attribute('href')
                    username = href.split('/@')[-1].split('/')[0].split('?')[0]
                    if username and username not in ['threads.net', 'threads.com', '']:
                        return username
        except:
            pass
        return "unknown"

    def _log_to_file(self, action_type, username, extra=""):
        """Log action to permanent file"""
        try:
            log_file = self.log_dir / f'actions_{datetime.now().strftime("%Y%m%d")}.log'
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"[{timestamp}] {action_type.upper():8} | @{username:25} | session:{self.session_id[:8]} | {extra}\n")
            print(f"[LOG] {action_type.upper()} @{username} -> {log_file.name}")
        except Exception as e:
            print(f"[ERROR] Log to file failed: {e}")

    def _find_plus_button_for_post(self, like_button, driver):
        """
        Find the + button (small 16x16 icon near avatar) for a post.
        This button opens a popup where we can click Follow.
        """
        try:
            parent = like_button
            
            # Walk up the DOM tree to find the post container
            for level in range(10):
                parent = parent.find_element(By.XPATH, '..')
                
                # Skip if we're in "Suggested for you" section
                try:
                    text_content = parent.text
                    if 'Suggested for you' in text_content:
                        continue
                except:
                    pass
                
                # Find small div[role="button"] elements (the + icon is ~16x16)
                buttons = parent.find_elements(By.XPATH, './/div[@role="button"]')
                
                for btn in buttons:
                    try:
                        size = btn.size
                        w, h = size.get('width', 0), size.get('height', 0)
                        text = btn.text.strip()
                        
                        # The + button is small (14-20px) and has NO text (just SVG icon)
                        if 14 <= w <= 24 and 14 <= h <= 24 and text == '':
                            # Verify it has an SVG child
                            svgs = btn.find_elements(By.TAG_NAME, 'svg')
                            if svgs:
                                print(f"[DEBUG] Found + button: {w}x{h}px")
                                return btn
                    except:
                        pass
            
            return None
        except Exception as e:
            print(f"[DEBUG] _find_plus_button_for_post error: {e}")
            return None

    def _click_follow_in_popup(self, driver, actions):
        """
        After clicking + button, find and click the Follow button in the popup.
        Returns True if successful.
        """
        try:
            import time
            time.sleep(1)  # Wait for popup to appear
            
            # Find Follow button in popup (div[role="button"] with text "Follow")
            follow_buttons = driver.find_elements(By.XPATH, '//div[@role="button"]')
            
            for btn in follow_buttons:
                try:
                    text = btn.text.strip()
                    if text == 'Follow':
                        size = btn.size
                        w = size.get('width', 0)
                        # The popup Follow button is larger (not the small 16x16 + icon)
                        if w > 50:
                            print(f"[DEBUG] Found Follow button in popup: {w}px wide")
                            btn.click()
                            time.sleep(0.5)
                            return True
                except:
                    pass
            
            print("[DEBUG] No Follow button found in popup")
            return False
        except Exception as e:
            print(f"[DEBUG] _click_follow_in_popup error: {e}")
            return False

    def _close_popup(self, driver):
        """Close popup by pressing Escape or clicking outside"""
        try:
            # Method 1: Press Escape (safest - no scrolling)
            from selenium.webdriver.common.keys import Keys
            from selenium.webdriver.common.action_chains import ActionChains
            
            actions = ActionChains(driver)
            actions.send_keys(Keys.ESCAPE).perform()
            time.sleep(0.3)
            print("[DEBUG] Closed popup with Escape")
        except Exception as e:
            print(f"[DEBUG] Escape failed: {e}")
            try:
                # Method 2: Click on dark overlay area (top of page, safe zone)
                driver.execute_script("""
                    var overlay = document.elementFromPoint(window.innerWidth - 50, 50);
                    if (overlay) overlay.click();
                """)
                time.sleep(0.3)
                print("[DEBUG] Closed popup with JS click")
            except Exception as e2:
                print(f"[DEBUG] JS click failed: {e2}")

    def start(self):
        """Main automation entry point"""
        print(f"\n{'='*80}")
        print(f"[SESSION START] Profile: {self.profile_id}")
        print(f"Session ID: {self.session_id}")
        print(f"Mode: FOLLOW first, then LIKE")
        print(f"{'='*80}\n")
        
        logger.info(f"Starting session {self.session_id} for profile {self.profile_id}")
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
            self.db.complete_session(self.session_id, self.stats)
            print(f"\n{'='*80}")
            print(f"[4/4] SESSION COMPLETE")
            print(f"Follows: {self.stats['follows']} | Likes: {self.stats['likes']} | Errors: {self.stats['errors']}")
            print(f"Followed: {', '.join(self.followed_users) if self.followed_users else 'None'}")
            print(f"Liked: {', '.join(self.processed_users) if self.processed_users else 'None'}")
            print(f"{'='*80}\n")

    def _run_automation_loop(self, driver, actions):
        """Core automation logic: FOLLOW first, then LIKE"""
        print("[2/4] Navigating to threads.com...")
        driver.get("https://www.threads.com/")
        time.sleep(15)
        
        print(f"[2/4] Page loaded. URL: {driver.current_url}")
        print(f"[2/4] Title: {driver.title}")
        self.take_screenshot(driver, '02_page_loaded')
        
        # Page analysis
        like_svgs = driver.find_elements(By.CSS_SELECTOR, 'svg[aria-label="Like"]')
        all_divs_btn = driver.find_elements(By.CSS_SELECTOR, "div[role='button']")
        print(f"[DEBUG] Page: {len(like_svgs)} Like SVGs, {len(all_divs_btn)} div[role=button]")
        
        # Check if login required
        if 'login' in driver.current_url.lower():
            print("[ERROR] Login page detected! Profile not logged in.")
            self.take_screenshot(driver, '03_login_required')
            return
        
        print("\n[3/4] Starting automation loop (FOLLOW → LIKE)...")
        processed_count = 0
        max_actions = 10
        scroll_attempts = 0
        max_scrolls = 5
        
        while processed_count < max_actions and scroll_attempts < max_scrolls:
            scroll_attempts += 1
            print(f"\n{'─'*60}")
            print(f"[3/4] SCROLL {scroll_attempts}/{max_scrolls}")
            print(f"{'─'*60}")
            
            # Find Like buttons (each represents a post)
            like_buttons = actions.find_like_buttons(driver)
            print(f"[3/4] Found {len(like_buttons)} posts")
            
            if len(like_buttons) == 0:
                print("[3/4] No posts found, scrolling...")
                self.take_screenshot(driver, f'scroll_{scroll_attempts}_no_posts')
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)
                continue
            
            # Process each post: FOLLOW first, then LIKE
            for i, like_btn in enumerate(like_buttons[:5]):
                if processed_count >= max_actions:
                    break
                
                try:
                    # Extract username
                    username = self._extract_username_from_post(like_btn)
                    
                    # Skip if already processed
                    if username in self.processed_users and username != "unknown":
                        print(f"[3/4] Skipping @{username} (already done)")
                        continue
                    
                    print(f"\n[3/4] ━━━ POST {i+1}: @{username} ━━━")
                    
                    # ========== STEP 1: FOLLOW (+ button -> popup -> Follow) ==========
                    print(f"[3/4] Step 1: Looking for + button...")
                    plus_btn = self._find_plus_button_for_post(like_btn, driver)
                    
                    if plus_btn:
                        print(f"[3/4] Found + button, clicking to open popup...")
                        if actions.safe_click(plus_btn):
                            # Wait for popup and click Follow
                            if self._click_follow_in_popup(driver, actions):
                                self.stats["follows"] += 1
                                self.followed_users.append(username)
                                print(f"[3/4] ✅ FOLLOWED @{username}!")
                                
                                # Screenshot (proof of follow)
                                ss_path = self.take_screenshot(driver, f'follow_{self.stats["follows"]:02d}_{username}')
                                
                                # Log to DB
                                self.db.log_action(
                                    session_id=self.session_id,
                                    profile_id=self.profile_id,
                                    action_type='follow',
                                    target_username=username,
                                    target_url=driver.current_url,
                                    status='success',
                                    screenshot_path=ss_path
                                )
                                self.db.update_daily_stats(self.profile_id, 'follow')
                                self._log_to_file('follow', username)
                                
                                # Close popup
                                self._close_popup(driver)
                                actions.random_delay(1, 2)
                            else:
                                print(f"[3/4] ⚠️ Could not click Follow in popup")
                                self._close_popup(driver)
                        else:
                            print(f"[3/4] ❌ + button click failed")
                    else:
                        print(f"[3/4] ⚠️ No + button found (maybe already following)")
                    
                    # ========== STEP 2: LIKE ==========
                    print(f"[3/4] Step 2: Clicking Like button...")
                    if actions.safe_click(like_btn):
                        self.stats["likes"] += 1
                        processed_count += 1
                        self.processed_users.add(username)
                        
                        print(f"[3/4] ✅ LIKED @{username}!")
                        
                        # Screenshot
                        ss_path = self.take_screenshot(driver, f'like_{self.stats["likes"]:02d}_{username}')
                        
                        # Log to DB
                        self.db.log_action(
                            session_id=self.session_id,
                            profile_id=self.profile_id,
                            action_type='like',
                            target_username=username,
                            target_url=driver.current_url,
                            status='success',
                            screenshot_path=ss_path
                        )
                        self.db.update_daily_stats(self.profile_id, 'like')
                        self._log_to_file('like', username)
                        
                        print(f"[3/4] ✅ Done: Follow + Like @{username}")
                        actions.random_delay(2, 4)
                    else:
                        print(f"[3/4] ❌ Like click failed")
                        
                except Exception as e:
                    print(f"[ERROR] Action failed: {e}")
                    self.stats["errors"] += 1
            
            # Scroll for more
            if processed_count < max_actions:
                print("\n[3/4] Scrolling for more...")
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(3)
        
        # Final summary
        print(f"\n{'─'*60}")
        print(f"[3/4] AUTOMATION COMPLETE")
        print(f"{'─'*60}")
        print(f"Follows: {self.stats['follows']}")
        print(f"Likes: {self.stats['likes']}")
        print(f"Errors: {self.stats['errors']}")
        print(f"Users: {', '.join(self.processed_users)}")
        self.take_screenshot(driver, 'final_state')

    def _check_limits(self):
        """Check against daily limits"""
        max_likes = self.settings.get('max_likes_per_day', 100)
        if self.db.is_daily_limit_reached(self.profile_id, 'like', max_likes):
            print(f"[LIMIT] Daily like limit ({max_likes}) reached!")
            return False
        return True
