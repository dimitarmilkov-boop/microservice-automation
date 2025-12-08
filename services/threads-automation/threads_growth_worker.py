"""
Threads Growth Worker
Implements the "Targeted Follow" logic with "Human Protocol".
"""
import sys
import os
import time
import random
import logging
import uuid
from datetime import datetime
from pathlib import Path

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.common.action_chains import ActionChains

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from shared.browser_automation.browser_profiles import BrowserProfileManager
from config import Config
from database import Database
from core.selectors import SELECTORS
from growth_config import GROWTH_SETTINGS, TARGETS

logger = logging.getLogger(__name__)

class ThreadsGrowthWorker:
    def __init__(self, profile_id, target_username=None, db=None):
        self.profile_id = profile_id
        self.target_username = target_username or TARGETS[0]
        self.settings = GROWTH_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.session_id = str(uuid.uuid4())
        self.profile_name = self._get_profile_name()
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'growth'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "follows": 0,
            "rejected": 0,
            "errors": 0
        }

    def _get_profile_name(self):
        try:
            pm = BrowserProfileManager()
            for name in pm.list_profile_names():
                if pm.get_profile_id_by_name(name) == self.profile_id:
                    return name
            return self.profile_id[:8]
        except: return self.profile_id[:8]

    def take_screenshot(self, driver, name):
        try:
            filename = f"{datetime.now().strftime('%H%M%S')}_{name}.png"
            path = self.screenshot_dir / filename
            driver.save_screenshot(str(path))
            print(f"[SCREENSHOT] {filename}")
        except: pass

    def start(self):
        print(f"\n{'='*60}")
        print(f"[GROWTH] Profile: {self.profile_name}")
        print(f"Target: @{self.target_username}")
        print(f"Protocol: Human (Max {self.settings['max_follows_per_session']} follows)")
        print(f"{'='*60}\n")
        
        self.db.create_session(self.session_id, self.profile_id, self.profile_name)
        
        try:
            if self.db.is_daily_limit_reached(self.profile_id, 'follow', 100):
                print("[LIMIT] Daily limit reached.")
                return

            print("[1/4] Launching browser...")
            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                self._navigate_to_target(driver)
                if self._open_followers_modal(driver):
                    self._process_list(driver)
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            self.stats['errors'] += 1
            self.db.update_session(self.session_id, status='failed', errors_count=1)
        finally:
            print(f"\n[DONE] Follows: {self.stats['follows']} | Rejected: {self.stats['rejected']}")
            self.db.complete_session(self.session_id, self.stats)

    def _navigate_to_target(self, driver):
        url = f"https://www.threads.net/@{self.target_username}"
        print(f"[2/4] Navigating to {url}...")
        driver.get(url)
        time.sleep(random.uniform(4, 7))

    def _open_followers_modal(self, driver):
        print("[3/4] Opening followers list...")
        try:
            # Find "Followers" text/link
            candidates = driver.find_elements(By.XPATH, "//*[contains(text(), 'followers') or contains(text(), 'подписчиков')]")
            btn = None
            for c in candidates:
                if c.is_displayed() and len(c.text) < 30:
                    btn = c
                    break
            
            # Fallback
            if not btn:
                btn = driver.find_element(By.CSS_SELECTOR, 'div[data-pressable-container="true"]')

            if btn:
                driver.execute_script("arguments[0].click();", btn)
                time.sleep(4)
                return True
            return False
        except:
            print("[ERROR] Could not open modal.")
            return False

    def _switch_to_following_tab(self, driver, modal):
        print("[3.5/4] Switching to 'Following' tab...")
        try:
            # 1. Try finding by Text directly
            xpath = ".//*[contains(text(), 'Following') or contains(text(), 'Подписки')]"
            candidates = modal.find_elements(By.XPATH, xpath)
            
            target = None
            for c in candidates:
                # Check if it's clickable/visible and reasonable length
                if c.is_displayed() and len(c.text) < 20:
                    # Verify it's not the "Follow" button text
                    if "Follow" not in c.text or c.text == "Following": 
                        target = c
                        break
            
            if target:
                print(f"[DEBUG] Found tab text: '{target.text}'")
                
                # Check if already selected (sometimes parent has aria-selected)
                try:
                    parent = target.find_element(By.XPATH, "./..")
                    if parent.get_attribute("aria-selected") == "true":
                        print("[DEBUG] Already on Following tab.")
                        return True
                except: pass

                # Click it
                ActionChains(driver).move_to_element(target).click().perform()
                time.sleep(3)
                return True
            
            print("[WARN] Could not find 'Following' tab.")
            return False
        except Exception as e:
            print(f"[WARN] Tab switch error: {e}")
            return False

    def _process_list(self, driver):
        print("[4/4] Starting Human Follow Loop...")
        try:
            modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
        except: return

        # Switch Tab
        self._switch_to_following_tab(driver, modal)

        count = 0
        break_counter = 0
        next_break_at = random.randint(self.settings['break_every_min'], self.settings['break_every_max'])
        
        # Track users to avoid processing same button repeatedly if it fails
        processed_users = set()

        while count < self.settings['max_follows_per_session']:
            try:
                # Re-find modal to avoid stale element
                modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                
                # Find a candidate button
                btn, username = self._find_button(modal, processed_users)
                
                if not btn:
                    print("[LOOP] Scrolling...")
                    self._scroll(driver, modal)
                    time.sleep(2)
                    continue

                processed_users.add(username)

                # Check DB
                if self.db.is_user_followed(self.profile_id, username):
                    print(f"[SKIP] Already followed @{username}")
                    continue

                # HUMAN ACTION
                print(f"[ACTION] Following @{username}...")
                
                # 1. Hover
                if self.settings['hover_before_click']:
                    ActionChains(driver).move_to_element(btn).perform()
                    time.sleep(random.uniform(0.5, 1.5))
                
                # 2. Click
                btn.click()
                
                # 3. Verify (The Safety Valve)
                if self._verify_follow(btn):
                    # Success
                    self.db.log_action(self.session_id, self.profile_id, "follow", username, "success")
                    self.db.update_daily_stats(self.profile_id, "follow", 1)
                    count += 1
                    break_counter += 1
                    self.stats['follows'] += 1
                    print(f"[SUCCESS] Followed @{username} ({count}/{self.settings['max_follows_per_session']})")
                    
                    # 4. Imperfect Timing
                    delay = random.uniform(self.settings['delay_min'], self.settings['delay_max'])
                    print(f"[WAIT] Sleeping {delay:.1f}s...")
                    time.sleep(delay)
                    
                    # 5. Coffee Break?
                    if self.settings['enable_breaks'] and break_counter >= next_break_at:
                        duration = random.randint(self.settings['break_duration_min'], self.settings['break_duration_max'])
                        print(f"\n[COFFEE BREAK] Taking a {duration}s break to act human...\n")
                        time.sleep(duration)
                        break_counter = 0
                        next_break_at = random.randint(self.settings['break_every_min'], self.settings['break_every_max'])
                
                else:
                    # REJECTED
                    print(f"\n{'!'*40}")
                    print(f"[REJECTED] Button reverted for @{username}!")
                    print(f"[SAFETY VALVE] Stopping session immediately.")
                    print(f"{'!'*40}\n")
                    self.stats['rejected'] += 1
                    self.db.log_action(self.session_id, self.profile_id, "follow", username, "rejected", "Button reverted")
                    return # STOP SESSION

            except Exception as e:
                print(f"[ERROR] Loop error: {e}")
                time.sleep(1)

    def _find_button(self, modal, processed):
        # Find "Follow" buttons
        buttons = modal.find_elements(By.TAG_NAME, "button")
        # Also check divs that act as buttons
        buttons.extend(modal.find_elements(By.CSS_SELECTOR, "div[role='button']"))
        
        for btn in buttons:
            try:
                if not btn.is_displayed(): continue
                txt = btn.text.strip()
                
                # Strict check: Text must be "Follow" (or localized)
                # Exclude "Following", "Requested", "Followers"
                if txt in ["Follow", "Подписаться"] or (txt == "Follow" and "ing" not in txt):
                    
                    # Get username from row
                    username = "unknown"
                    try:
                        row = btn.find_element(By.XPATH, "./../..")
                        links = row.find_elements(By.TAG_NAME, "a")
                        for l in links:
                            href = l.get_attribute('href')
                            if href and '/@' in href:
                                username = href.split('/@')[-1].split('/')[0]
                                break
                    except: pass
                    
                    if username not in processed:
                        return btn, username
            except: continue
        return None, None

    def _verify_follow(self, btn):
        """Check if button text changes from Follow -> Following"""
        time.sleep(random.uniform(2, 4)) # Wait for network
        try:
            txt = btn.text.strip()
            if txt in ["Following", "Requested", "Подписки"]:
                return True
            if txt in ["Follow", "Подписаться"]:
                return False # Reverted
            return True # Changed to something else? Assume success.
        except:
            # If element is stale/gone, assume success (moved in list)
            return True

    def _scroll(self, driver, modal):
        try:
            driver.execute_script("arguments[0].querySelector('div[style*=\"overflow\"]').scrollBy(0, 300)", modal)
        except:
            # Fallback
            ActionChains(driver).send_keys(u'\ue00f').perform() # PageDown
