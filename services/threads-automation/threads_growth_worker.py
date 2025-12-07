"""
Threads Growth Worker
Implements the "Targeted Follow" logic (Dark Panel) from the Chrome Extension.
Does NOT scroll the feed. Instead, it goes to a target profile, opens followers, and follows them.
"""
import sys
import os
import time
import random
import logging
import uuid
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from config import Config
from database import Database
from core.selectors import SELECTORS
from core.filters import ThreadsFilters
from growth_config import GROWTH_SETTINGS, TARGETS

logger = logging.getLogger(__name__)

class ThreadsGrowthWorker:
    def __init__(self, profile_id, target_username=None, db=None):
        self.profile_id = profile_id
        self.target_username = target_username or TARGETS[0] # Default to first target if none
        self.settings = GROWTH_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.session_id = str(uuid.uuid4())
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'growth'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "follows": 0,
            "processed": 0,
            "errors": 0
        }

    def take_screenshot(self, driver, name):
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

    def start(self):
        print(f"\n{'='*80}")
        print(f"[GROWTH SESSION] Profile: {self.profile_id}")
        print(f"Target: @{self.target_username}")
        print(f"Goal: {self.settings['max_follows_per_session']} follows")
        print(f"{'='*80}\n")
        
        try:
            # Check limits
            if self.db.is_daily_limit_reached(self.profile_id, 'follow', 100): # Hard limit
                print("[LIMIT] Daily follow limit reached. Stopping.")
                return

            print("[1/4] Launching browser...")
            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                
                # 1. Navigate to Target
                self._navigate_to_target(driver)
                
                # 2. Open Followers Modal
                if self._open_followers_modal(driver):
                    # 3. Scroll and Follow Loop
                    self._process_followers_modal(driver)
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            print(f"\n[COMPLETE] Followed: {self.stats['follows']} | Processed: {self.stats['processed']}")

    def _navigate_to_target(self, driver):
        url = f"https://www.threads.net/@{self.target_username}"
        print(f"[2/4] Navigating to {url}...")
        driver.get(url)
        time.sleep(5)
        self.take_screenshot(driver, 'target_profile')

    def _open_followers_modal(self, driver):
        print("[3/4] Opening followers list...")
        try:
            followers_btn = None
            
            # Strategy 1: Open Modal via "Followers" count (Standard robust method)
            xpath = "//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'followers') or contains(text(), 'подписчиков')]"
            candidates = driver.find_elements(By.XPATH, xpath)
            
            print(f"[DEBUG] Found {len(candidates)} text candidates for 'followers'")
            
            for el in candidates:
                try:
                    if not el.is_displayed():
                        continue
                    text = el.text.strip()
                    # We want the label "5.4M followers"
                    if len(text) < 30 and any(char.isdigit() for char in text): 
                        print(f"[DEBUG] Candidate match: '{text}' (Tag: {el.tag_name})")
                        followers_btn = el
                        break
                    elif len(text) < 20: # "Followers" text without number
                        print(f"[DEBUG] Candidate match (text-only): '{text}'")
                        followers_btn = el
                        break 
                        print(f"[DEBUG] Candidate match: '{text}' (Tag: {el.tag_name})")
                        followers_btn = el
                        break
                    elif len(text) < 20: # "Following" text without number
                        print(f"[DEBUG] Candidate match (text-only): '{text}'")
                        followers_btn = el
                        break
                except:
                    continue

            if followers_btn:
                print(f"[DEBUG] Clicking followers button: '{followers_btn.text}'")
                # Scroll into view to ensure it's clickable
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", followers_btn)
                time.sleep(1)
                followers_btn.click()
                time.sleep(3)
                self.take_screenshot(driver, 'modal_opened')
                return True
            else:
                print("[ERROR] Could not find followers button/link.")
                self.take_screenshot(driver, 'error_no_followers_btn')
                return False
                
        except Exception as e:
            print(f"[ERROR] Failed to open modal: {e}")
            return False

    def _switch_to_following_tab(self, driver, modal):
        print("[3.5/4] Switching to 'Following' tab...")
        try:
            # DEBUG: List all tabs
            tabs = modal.find_elements(By.XPATH, ".//*[@role='tab']")
            print(f"[DEBUG] Found {len(tabs)} tabs in modal.")
            
            target_tab = None
            
            for tab in tabs:
                text = tab.text.strip()
                # print(f"[DEBUG] Tab found: '{text}' (Selected: {tab.get_attribute('aria-selected')})") 
                
                if "Following" in text or "Подписки" in text:
                    target_tab = tab
                    break
            
            if not target_tab:
                # Fallback: Find by generic text if role=tab fails
                 print("[DEBUG] No role='tab' matched. Searching by text...")
                 xpath_text = ".//*[contains(text(), 'Following') or contains(text(), 'Подписки')]"
                 candidates = modal.find_elements(By.XPATH, xpath_text)
                 for c in candidates:
                     if len(c.text) < 20: # Short text
                         target_tab = c
                         break

            if target_tab:
                is_selected = target_tab.get_attribute("aria-selected")
                if is_selected == "true":
                     print("[DEBUG] 'Following' tab is already active.")
                     return True
                     
                print(f"[ACTION] Clicking 'Following' tab: '{target_tab.text}'")
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_tab)
                time.sleep(0.5)
                target_tab.click()
                time.sleep(3) # Wait for list to reload
                return True
            else:
                print("[WARN] Could not find 'Following' tab element.")
                return False

        except Exception as e:
            print(f"[WARN] Failed to switch tab: {e}")
            return False

    def _process_followers_modal(self, driver):
        print("[4/4] Starting Follow Loop...")
        
        # Find the modal container
        try:
            modal = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, '[role="dialog"]'))
            )
            print("[DEBUG] Modal detected.")
        except:
            print("[ERROR] Modal element not found after clicking.")
            return

        # NEW: Switch to "Following" tab
        self._switch_to_following_tab(driver, modal)

        processed_in_session = 0
        scroll_attempts = 0
        
        while processed_in_session < self.settings['max_follows_per_session']:
            # 1. Find all Follow buttons in the modal
            buttons = modal.find_elements(By.TAG_NAME, "button") # Or div[role=button]
            
            # Also check for divs acting as buttons
            div_buttons = modal.find_elements(By.CSS_SELECTOR, "div[role='button']")
            buttons.extend(div_buttons)
            
            valid_buttons = []
            
            # 2. Filter for "Follow" buttons (skip "Following")
            for btn in buttons:
                try:
                    text = btn.text.strip()
                    if not text:
                        continue
                        
                    # print(f"[DEBUG] Inspecting button: '{text}'") # Uncomment for verbose debug

                    # Must have text, must correspond to "Follow"
                    if text in SELECTORS["follow_button_text"]:
                        valid_buttons.append(btn)
                    
                    # Heuristic fallback: if it contains "Follow" but isn't "Following", "Followers", or "Requested"
                    # CRITICAL: Must exclude "Followers" to prevent clicking the tab header!
                    elif "Follow" in text and "Following" not in text and "Requested" not in text and "Followers" not in text:
                         print(f"[DEBUG] Heuristic match for follow button: '{text}'")
                         valid_buttons.append(btn)
                except:
                    pass
            
            print(f"[LOOP] Found {len(valid_buttons)} potential buttons to follow.")
            
            if not valid_buttons:
                print("[LOOP] No buttons found visible. Scrolling...")
                self._scroll_modal(driver, modal)
                scroll_attempts += 1
                if scroll_attempts > self.settings['max_scrolls']:
                    print("[STOP] Max scrolls reached.")
                    break
                continue
                
            # 3. Process visible buttons
            for btn in valid_buttons:
                if processed_in_session >= self.settings['max_follows_per_session']:
                    break
                    
                try:
                    # Extract Username (Best Effort)
                    username = "unknown"
                    try:
                        # Search for the profile link in the row context
                        # We traverse up to find the common container, then look for the link
                        # The link text usually contains the username (or is the username)
                        
                        # Strategy: Look for 'a' tag in the parent's parent (common row structure)
                        container = btn.find_element(By.XPATH, "./../..") 
                        links = container.find_elements(By.TAG_NAME, "a")
                        
                        for link in links:
                            href = link.get_attribute('href')
                            u_text = link.text.strip()
                            
                            if href and '/@' in href: # Strong signal it's a profile link
                                username = href.split('/@')[-1].split('/')[0].split('?')[0] # Extract 'zuck' from .../@zuck
                                break
                            elif u_text and len(u_text) > 1 and "Follow" not in u_text:
                                username = u_text.split('\n')[0]
                                break
                    except Exception:
                        pass

                    # Check Idempotency (Skip if already followed)
                    if username != "unknown" and self.db.is_user_followed(self.profile_id, username):
                        print(f"[SKIP] Already followed user: {username}")
                        continue

                    # Click
                    print(f"[ACTION] Clicking Follow on @{username}...")
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                    time.sleep(0.5)
                    btn.click()
                    
                    # Log to DB
                    self.db.log_action(
                        session_id=self.session_id,
                        profile_id=self.profile_id,
                        action_type="follow",
                        target_username=username,
                        status="success"
                    )
                    self.db.update_daily_stats(self.profile_id, "follow", 1)
                    
                    self.stats['follows'] += 1
                    processed_in_session += 1
                    
                    # Delay
                    delay = random.uniform(self.settings['delay_min'], self.settings['delay_max'])
                    print(f"[SUCCESS] Followed @{username}! Waiting {delay:.1f}s")
                    time.sleep(delay)
                    
                except Exception as e:
                    print(f"[ERROR] Failed to click button: {e}")
                    self.db.log_action(
                        session_id=self.session_id,
                        profile_id=self.profile_id,
                        action_type="follow",
                        target_username=username if 'username' in locals() else "unknown",
                        status="failed",
                        error=str(e)
                    )
            
            # Scroll after processing batch
            self._scroll_modal(driver, modal)
            time.sleep(self.settings['scroll_delay'])

    def _scroll_modal(self, driver, modal):
        # Try to find the scrollable div inside the modal
        try:
            # usually the first div with overflow-y: auto inside dialog
            # Heuristic: execute JS to find scrollable parent
            driver.execute_script("""
                var modal = arguments[0];
                var scrollable = modal.querySelector('div[style*="overflow"]');
                if (!scrollable) {
                    // Recursive search for scrollHeight > clientHeight
                    var allDivs = modal.getElementsByTagName('div');
                    for (var i=0; i<allDivs.length; i++) {
                        if (allDivs[i].scrollHeight > allDivs[i].clientHeight && allDivs[i].clientHeight > 0) {
                            scrollable = allDivs[i];
                            break;
                        }
                    }
                }
                if (scrollable) {
                    scrollable.scrollTop = scrollable.scrollHeight;
                }
            """, modal)
        except Exception as e:
            print(f"[WARN] Scroll failed: {e}")

