import sys
import os
import time
import random
import logging
import uuid
import traceback
import json
from datetime import datetime, date
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from config import Config
from database import Database
from core.ai_generator import AICommentGenerator
from post_config import POST_SETTINGS

logger = logging.getLogger(__name__)

class ThreadsPostWorker:
    def __init__(self, profile_id, db=None):
        self.profile_id = profile_id
        self.settings = POST_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'posts'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "posts": 0,
            "errors": 0
        }

    def take_screenshot(self, driver, name):
        try:
            ts = datetime.now().strftime('%H%M%S')
            filename = f'{ts}_{name}.png'
            path = self.screenshot_dir / filename
            driver.save_screenshot(str(path))
            return str(path)
        except Exception as e:
            print(f"[ERROR] Screenshot failed: {e}")
            return None

    def start(self):
        print(f"\n{'='*80}")
        print(f"[POST SESSION] Profile: {self.profile_id}")
        print(f"Goal: 1 Post")
        print(f"{'='*80}\n")
        
        try:
            # Check limits
            daily_count = self.db.get_daily_post_count(self.profile_id)
            if daily_count >= self.settings['max_posts_per_day']:
                print(f"[LIMIT] Daily post limit reached ({daily_count}/{self.settings['max_posts_per_day']}). Stopping.")
                return

            # Select photo early to fail fast
            photo_path = self._select_photo()
            if not photo_path:
                print("[STOP] No unused photos found (or folder empty).")
                return
                
            print(f"[SETUP] Selected photo: {os.path.basename(photo_path)}")
            
            # Generate caption
            caption = self._generate_caption(photo_path)
            print(f"[SETUP] Generated caption: {caption}")

            print("[1/3] Launching browser...")
            
            # Create session
            self.db.create_session(self.session_id, self.profile_id, "Poster")

            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                
                # 1. Navigate to Home
                driver.get("https://www.threads.net/")
                time.sleep(5)
                
                # 2. Create Post
                success = self._create_single_post(driver, photo_path, caption)
                
                if success:
                    self.stats['posts'] = 1
                    print("[SUCCESS] Post created successfully.")
                    
                    # Log to DB
                    self.db.log_action(
                        self.session_id, 
                        self.profile_id, 
                        "post", 
                        status="success", 
                        metadata={
                            "photo_filename": os.path.basename(photo_path),
                            "text": caption
                        }
                    )
                    
                    # Update daily stats
                    self.db.update_daily_stats(self.profile_id, "post", 1)
                    
                else:
                    self.stats['errors'] += 1
                    print("[FAIL] Failed to create post.")
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            self.stats['errors'] += 1
            traceback.print_exc()
        finally:
            print(f"\n[COMPLETE] Posts: {self.stats['posts']}")
            self.db.complete_session(self.session_id, self.stats)

    def _select_photo(self):
        folder = Path(self.settings['photos_folder'])
        if not folder.exists():
            print(f"[ERROR] Photo folder not found: {folder}")
            return None
            
        allowed = set(self.settings['allowed_extensions'])
        all_photos = [
            f for f in folder.iterdir() 
            if f.is_file() and f.suffix.lower() in allowed
        ]
        
        if not all_photos:
            print(f"[ERROR] No photos found in {folder}")
            return None
            
        used_photos = self.db.get_used_photos(self.profile_id)
        available = [f for f in all_photos if f.name not in used_photos]
        
        if not available:
            print("[WARN] All photos used! Stopping.")
            return None
            
        return str(random.choice(available))

    def _generate_caption(self, photo_path):
        filename = os.path.basename(photo_path)
        # Simple topic extraction: "sunset_beach.jpg" -> "sunset beach"
        topic = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
        
        prompt = self.settings['ai_prompt'].replace('{TOPIC}', topic)
        
        return self.ai.generate_comment(
            topic, # context
            provider_name=self.settings['ai_provider'],
            prompt_template=prompt
        )

    def _create_single_post(self, driver, photo_path, caption):
        print("[ACTION] Starting post creation flow...")
        
        try:
            # 1. CLICK "START A THREAD" PLACEHOLDER
            print("[ACTION] Looking for 'Start a thread' placeholder...")
            try:
                # Based on user provided HTML: <div aria-label="Empty text field... " role="button">
                start_placeholder = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'div[aria-label*="Empty text field"][role="button"]'))
                )
                start_placeholder.click()
                print("[SUCCESS] Clicked placeholder.")
                time.sleep(2)
            except TimeoutException:
                print("[ERROR] Could not find 'Start a thread' placeholder.")
                return False

            # 2. UPLOAD PHOTO
            # We need to find the file input. 
            # Strategy: Find "Attach media" button to confirm we are in the right place, then find the hidden input.
            print("[ACTION] Uploading photo...")
            
            # Find the input directly if possible
            file_input = None
            try:
                # IMPORTANT: In modal, the input might be present but we need to ensure we target the right one
                # or wait for it to be ready.
                file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            except:
                pass
            
            if not file_input:
                # Try clicking the Attach Media button (User provided div class) to ensure input is rendered
                try:
                    # Look for the SVG inside the button usually, or the button itself
                    # We scope this to the modal if possible, but global search works if modal is top
                    modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                    attach_btn = modal.find_element(By.CSS_SELECTOR, 'svg[aria-label="Attach media"]')
                    
                    attach_container = attach_btn.find_element(By.XPATH, "./ancestor::div[@role='button'][1]")
                    attach_container.click()
                    time.sleep(1)
                    file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                except Exception as e:
                    print(f"[WARN] Could not find/click attach button: {e}")
            
            if file_input:
                file_input.send_keys(photo_path)
                print(f"[SUCCESS] Sent file path to input: {os.path.basename(photo_path)}")
            else:
                print("[ERROR] File input not found. Cannot upload.")
                return False

            # 3. WAIT FOR PREVIEW
            print("[WAIT] Waiting for image preview...")
            try:
                WebDriverWait(driver, 15).until(
                    lambda d: len(d.find_elements(By.CSS_SELECTOR, 'div[data-pressable-container="true"] img')) > 0
                    or len(d.find_elements(By.TAG_NAME, "img")) > 2 
                )
                time.sleep(3)
            except:
                print("[WARN] Timeout waiting for preview (might still be ok).")

            # 4. TYPE CAPTION
            print("[ACTION] Typing caption...")
            try:
                # After clicking placeholder, focus should be in the editable div
                # We can try to use active element
                active = driver.switch_to.active_element
                if active and active.get_attribute('contenteditable') == 'true':
                    input_el = active
                else:
                    # Fallback to finding it
                    input_el = driver.find_element(By.CSS_SELECTOR, 'div[contenteditable="true"]')
                
                input_el.click()
                time.sleep(0.5)
                self._human_type(input_el, caption)
                print("[SUCCESS] Caption typed.")
                
            except Exception as e:
                print(f"[ERROR] Could not type caption: {e}")
                return False

            # 5. CLICK POST
            print("[ACTION] Clicking Post...")
            time.sleep(2)
            try:
                # Find the "Post" button
                # Scope to modal for better accuracy
                modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                
                # Find 'Post' text inside modal
                # Using XPath relative to modal is tricky with Selenium element search, 
                # so we get all elements in modal and filter.
                
                # Option 1: Find by text inside modal
                post_btns = modal.find_elements(By.XPATH, ".//div[text()='Post']")
                
                valid_post_btn = None
                for btn in reversed(post_btns):
                    # Check if it has button role or is inside one
                    parent = btn.find_element(By.XPATH, "./..") # parent
                    if btn.get_attribute("role") == "button" or parent.get_attribute("role") == "button":
                         if btn.is_displayed():
                            valid_post_btn = btn
                            break
                
                if not valid_post_btn:
                     # Fallback to the specific class structure if text search fails (less robust but specific)
                     try:
                         valid_post_btn = modal.find_element(By.XPATH, ".//div[text()='Post']/ancestor::div[@role='button'][1]")
                     except:
                         pass

                if valid_post_btn:
                    valid_post_btn.click()
                    print("[SUCCESS] Clicked Post.")
                    
                    # Wait for completion (modal close or progress)
                    time.sleep(5) 
                    return True
                else:
                    print("[ERROR] Post button not found.")
                    return False

            except Exception as e:
                print(f"[ERROR] Failed to click Post: {e}")
                return False

        except Exception as e:
            print(f"[ERROR] Post creation flow failed: {e}")
            self.take_screenshot(driver, 'post_error')
            return False

    def _human_type(self, element, text):
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pid = sys.argv[1]
        worker = ThreadsPostWorker(pid)
        worker.start()
    else:
        print("Usage: python threads_post_worker.py <profile_id>")

import time
import random
import logging
import uuid
import traceback
import json
from datetime import datetime, date
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from config import Config
from database import Database
from core.ai_generator import AICommentGenerator
from post_config import POST_SETTINGS

logger = logging.getLogger(__name__)

class ThreadsPostWorker:
    def __init__(self, profile_id, db=None):
        self.profile_id = profile_id
        self.settings = POST_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'posts'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "posts": 0,
            "errors": 0
        }

    def take_screenshot(self, driver, name):
        try:
            ts = datetime.now().strftime('%H%M%S')
            filename = f'{ts}_{name}.png'
            path = self.screenshot_dir / filename
            driver.save_screenshot(str(path))
            return str(path)
        except Exception as e:
            print(f"[ERROR] Screenshot failed: {e}")
            return None

    def start(self):
        print(f"\n{'='*80}")
        print(f"[POST SESSION] Profile: {self.profile_id}")
        print(f"Goal: 1 Post")
        print(f"{'='*80}\n")
        
        try:
            # Check limits
            daily_count = self.db.get_daily_post_count(self.profile_id)
            if daily_count >= self.settings['max_posts_per_day']:
                print(f"[LIMIT] Daily post limit reached ({daily_count}/{self.settings['max_posts_per_day']}). Stopping.")
                return

            # Select photo early to fail fast
            photo_path = self._select_photo()
            if not photo_path:
                print("[STOP] No unused photos found (or folder empty).")
                return
                
            print(f"[SETUP] Selected photo: {os.path.basename(photo_path)}")
            
            # Generate caption
            caption = self._generate_caption(photo_path)
            print(f"[SETUP] Generated caption: {caption}")

            print("[1/3] Launching browser...")
            
            # Create session
            self.db.create_session(self.session_id, self.profile_id, "Poster")

            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                
                # 1. Navigate to Home
                driver.get("https://www.threads.net/")
                time.sleep(5)
                
                # 2. Create Post
                success = self._create_single_post(driver, photo_path, caption)
                
                if success:
                    self.stats['posts'] = 1
                    print("[SUCCESS] Post created successfully.")
                    
                    # Log to DB
                    self.db.log_action(
                        self.session_id, 
                        self.profile_id, 
                        "post", 
                        status="success", 
                        metadata={
                            "photo_filename": os.path.basename(photo_path),
                            "text": caption
                        }
                    )
                    
                    # Update daily stats
                    self.db.update_daily_stats(self.profile_id, "post", 1)
                    
                else:
                    self.stats['errors'] += 1
                    print("[FAIL] Failed to create post.")
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            self.stats['errors'] += 1
            traceback.print_exc()
        finally:
            print(f"\n[COMPLETE] Posts: {self.stats['posts']}")
            self.db.complete_session(self.session_id, self.stats)

    def _select_photo(self):
        folder = Path(self.settings['photos_folder'])
        if not folder.exists():
            print(f"[ERROR] Photo folder not found: {folder}")
            return None
            
        allowed = set(self.settings['allowed_extensions'])
        all_photos = [
            f for f in folder.iterdir() 
            if f.is_file() and f.suffix.lower() in allowed
        ]
        
        if not all_photos:
            print(f"[ERROR] No photos found in {folder}")
            return None
            
        used_photos = self.db.get_used_photos(self.profile_id)
        available = [f for f in all_photos if f.name not in used_photos]
        
        if not available:
            print("[WARN] All photos used! Stopping.")
            return None
            
        return str(random.choice(available))

    def _generate_caption(self, photo_path):
        filename = os.path.basename(photo_path)
        # Simple topic extraction: "sunset_beach.jpg" -> "sunset beach"
        topic = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
        
        prompt = self.settings['ai_prompt'].replace('{TOPIC}', topic)
        
        return self.ai.generate_comment(
            topic, # context
            provider_name=self.settings['ai_provider'],
            prompt_template=prompt
        )

    def _create_single_post(self, driver, photo_path, caption):
        print("[ACTION] Starting post creation flow...")
        
        try:
            # 1. CLICK "START A THREAD" PLACEHOLDER
            print("[ACTION] Looking for 'Start a thread' placeholder...")
            try:
                # Based on user provided HTML: <div aria-label="Empty text field... " role="button">
                start_placeholder = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'div[aria-label*="Empty text field"][role="button"]'))
                )
                start_placeholder.click()
                print("[SUCCESS] Clicked placeholder.")
                time.sleep(2)
            except TimeoutException:
                print("[ERROR] Could not find 'Start a thread' placeholder.")
                return False

            # 2. UPLOAD PHOTO
            # We need to find the file input. 
            # Strategy: Find "Attach media" button to confirm we are in the right place, then find the hidden input.
            print("[ACTION] Uploading photo...")
            
            # Find the input directly if possible
            file_input = None
            try:
                # IMPORTANT: In modal, the input might be present but we need to ensure we target the right one
                # or wait for it to be ready.
                file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            except:
                pass
            
            if not file_input:
                # Try clicking the Attach Media button (User provided div class) to ensure input is rendered
                try:
                    # Look for the SVG inside the button usually, or the button itself
                    # We scope this to the modal if possible, but global search works if modal is top
                    modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                    attach_btn = modal.find_element(By.CSS_SELECTOR, 'svg[aria-label="Attach media"]')
                    
                    attach_container = attach_btn.find_element(By.XPATH, "./ancestor::div[@role='button'][1]")
                    attach_container.click()
                    time.sleep(1)
                    file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                except Exception as e:
                    print(f"[WARN] Could not find/click attach button: {e}")
            
            if file_input:
                file_input.send_keys(photo_path)
                print(f"[SUCCESS] Sent file path to input: {os.path.basename(photo_path)}")
            else:
                print("[ERROR] File input not found. Cannot upload.")
                return False

            # 3. WAIT FOR PREVIEW
            print("[WAIT] Waiting for image preview...")
            try:
                WebDriverWait(driver, 15).until(
                    lambda d: len(d.find_elements(By.CSS_SELECTOR, 'div[data-pressable-container="true"] img')) > 0
                    or len(d.find_elements(By.TAG_NAME, "img")) > 2 
                )
                time.sleep(3)
            except:
                print("[WARN] Timeout waiting for preview (might still be ok).")

            # 4. TYPE CAPTION
            print("[ACTION] Typing caption...")
            try:
                # After clicking placeholder, focus should be in the editable div
                # We can try to use active element
                active = driver.switch_to.active_element
                if active and active.get_attribute('contenteditable') == 'true':
                    input_el = active
                else:
                    # Fallback to finding it
                    input_el = driver.find_element(By.CSS_SELECTOR, 'div[contenteditable="true"]')
                
                input_el.click()
                time.sleep(0.5)
                self._human_type(input_el, caption)
                print("[SUCCESS] Caption typed.")
                
            except Exception as e:
                print(f"[ERROR] Could not type caption: {e}")
                return False

            # 5. CLICK POST
            print("[ACTION] Clicking Post...")
            time.sleep(2)
            try:
                # Find the "Post" button
                # Scope to modal for better accuracy
                modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                
                # Find 'Post' text inside modal
                # Using XPath relative to modal is tricky with Selenium element search, 
                # so we get all elements in modal and filter.
                
                # Option 1: Find by text inside modal
                post_btns = modal.find_elements(By.XPATH, ".//div[text()='Post']")
                
                valid_post_btn = None
                for btn in reversed(post_btns):
                    # Check if it has button role or is inside one
                    parent = btn.find_element(By.XPATH, "./..") # parent
                    if btn.get_attribute("role") == "button" or parent.get_attribute("role") == "button":
                         if btn.is_displayed():
                            valid_post_btn = btn
                            break
                
                if not valid_post_btn:
                     # Fallback to the specific class structure if text search fails (less robust but specific)
                     try:
                         valid_post_btn = modal.find_element(By.XPATH, ".//div[text()='Post']/ancestor::div[@role='button'][1]")
                     except:
                         pass

                if valid_post_btn:
                    valid_post_btn.click()
                    print("[SUCCESS] Clicked Post.")
                    
                    # Wait for completion (modal close or progress)
                    time.sleep(5) 
                    return True
                else:
                    print("[ERROR] Post button not found.")
                    return False

            except Exception as e:
                print(f"[ERROR] Failed to click Post: {e}")
                return False

        except Exception as e:
            print(f"[ERROR] Post creation flow failed: {e}")
            self.take_screenshot(driver, 'post_error')
            return False

    def _human_type(self, element, text):
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pid = sys.argv[1]
        worker = ThreadsPostWorker(pid)
        worker.start()
    else:
        print("Usage: python threads_post_worker.py <profile_id>")

import time
import random
import logging
import uuid
import traceback
import json
from datetime import datetime, date
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from config import Config
from database import Database
from core.ai_generator import AICommentGenerator
from post_config import POST_SETTINGS

logger = logging.getLogger(__name__)

class ThreadsPostWorker:
    def __init__(self, profile_id, db=None):
        self.profile_id = profile_id
        self.settings = POST_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'posts'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "posts": 0,
            "errors": 0
        }

    def take_screenshot(self, driver, name):
        try:
            ts = datetime.now().strftime('%H%M%S')
            filename = f'{ts}_{name}.png'
            path = self.screenshot_dir / filename
            driver.save_screenshot(str(path))
            return str(path)
        except Exception as e:
            print(f"[ERROR] Screenshot failed: {e}")
            return None

    def start(self):
        print(f"\n{'='*80}")
        print(f"[POST SESSION] Profile: {self.profile_id}")
        print(f"Goal: 1 Post")
        print(f"{'='*80}\n")
        
        try:
            # Check limits
            daily_count = self.db.get_daily_post_count(self.profile_id)
            if daily_count >= self.settings['max_posts_per_day']:
                print(f"[LIMIT] Daily post limit reached ({daily_count}/{self.settings['max_posts_per_day']}). Stopping.")
                return

            # Select photo early to fail fast
            photo_path = self._select_photo()
            if not photo_path:
                print("[STOP] No unused photos found (or folder empty).")
                return
                
            print(f"[SETUP] Selected photo: {os.path.basename(photo_path)}")
            
            # Generate caption
            caption = self._generate_caption(photo_path)
            print(f"[SETUP] Generated caption: {caption}")

            print("[1/3] Launching browser...")
            
            # Create session
            self.db.create_session(self.session_id, self.profile_id, "Poster")

            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                
                # 1. Navigate to Home
                driver.get("https://www.threads.net/")
                time.sleep(5)
                
                # 2. Create Post
                success = self._create_single_post(driver, photo_path, caption)
                
                if success:
                    self.stats['posts'] = 1
                    print("[SUCCESS] Post created successfully.")
                    
                    # Log to DB
                    self.db.log_action(
                        self.session_id, 
                        self.profile_id, 
                        "post", 
                        status="success", 
                        metadata={
                            "photo_filename": os.path.basename(photo_path),
                            "text": caption
                        }
                    )
                    
                    # Update daily stats
                    self.db.update_daily_stats(self.profile_id, "post", 1)
                    
                else:
                    self.stats['errors'] += 1
                    print("[FAIL] Failed to create post.")
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            self.stats['errors'] += 1
            traceback.print_exc()
        finally:
            print(f"\n[COMPLETE] Posts: {self.stats['posts']}")
            self.db.complete_session(self.session_id, self.stats)

    def _select_photo(self):
        folder = Path(self.settings['photos_folder'])
        if not folder.exists():
            print(f"[ERROR] Photo folder not found: {folder}")
            return None
            
        allowed = set(self.settings['allowed_extensions'])
        all_photos = [
            f for f in folder.iterdir() 
            if f.is_file() and f.suffix.lower() in allowed
        ]
        
        if not all_photos:
            print(f"[ERROR] No photos found in {folder}")
            return None
            
        used_photos = self.db.get_used_photos(self.profile_id)
        available = [f for f in all_photos if f.name not in used_photos]
        
        if not available:
            print("[WARN] All photos used! Stopping.")
            return None
            
        return str(random.choice(available))

    def _generate_caption(self, photo_path):
        filename = os.path.basename(photo_path)
        # Simple topic extraction: "sunset_beach.jpg" -> "sunset beach"
        topic = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
        
        prompt = self.settings['ai_prompt'].replace('{TOPIC}', topic)
        
        return self.ai.generate_comment(
            topic, # context
            provider_name=self.settings['ai_provider'],
            prompt_template=prompt
        )

    def _create_single_post(self, driver, photo_path, caption):
        print("[ACTION] Starting post creation flow...")
        
        try:
            # 1. CLICK "START A THREAD" PLACEHOLDER
            print("[ACTION] Looking for 'Start a thread' placeholder...")
            try:
                # Based on user provided HTML: <div aria-label="Empty text field... " role="button">
                start_placeholder = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'div[aria-label*="Empty text field"][role="button"]'))
                )
                start_placeholder.click()
                print("[SUCCESS] Clicked placeholder.")
                time.sleep(2)
            except TimeoutException:
                print("[ERROR] Could not find 'Start a thread' placeholder.")
                return False

            # 2. UPLOAD PHOTO
            # We need to find the file input. 
            # Strategy: Find "Attach media" button to confirm we are in the right place, then find the hidden input.
            print("[ACTION] Uploading photo...")
            
            # Find the input directly if possible
            file_input = None
            try:
                # IMPORTANT: In modal, the input might be present but we need to ensure we target the right one
                # or wait for it to be ready.
                file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            except:
                pass
            
            if not file_input:
                # Try clicking the Attach Media button (User provided div class) to ensure input is rendered
                try:
                    # Look for the SVG inside the button usually, or the button itself
                    # We scope this to the modal if possible, but global search works if modal is top
                    modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                    attach_btn = modal.find_element(By.CSS_SELECTOR, 'svg[aria-label="Attach media"]')
                    
                    attach_container = attach_btn.find_element(By.XPATH, "./ancestor::div[@role='button'][1]")
                    attach_container.click()
                    time.sleep(1)
                    file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                except Exception as e:
                    print(f"[WARN] Could not find/click attach button: {e}")
            
            if file_input:
                file_input.send_keys(photo_path)
                print(f"[SUCCESS] Sent file path to input: {os.path.basename(photo_path)}")
            else:
                print("[ERROR] File input not found. Cannot upload.")
                return False

            # 3. WAIT FOR PREVIEW
            print("[WAIT] Waiting for image preview...")
            try:
                WebDriverWait(driver, 15).until(
                    lambda d: len(d.find_elements(By.CSS_SELECTOR, 'div[data-pressable-container="true"] img')) > 0
                    or len(d.find_elements(By.TAG_NAME, "img")) > 2 
                )
                time.sleep(3)
            except:
                print("[WARN] Timeout waiting for preview (might still be ok).")

            # 4. TYPE CAPTION
            print("[ACTION] Typing caption...")
            try:
                # After clicking placeholder, focus should be in the editable div
                # We can try to use active element
                active = driver.switch_to.active_element
                if active and active.get_attribute('contenteditable') == 'true':
                    input_el = active
                else:
                    # Fallback to finding it
                    input_el = driver.find_element(By.CSS_SELECTOR, 'div[contenteditable="true"]')
                
                input_el.click()
                time.sleep(0.5)
                self._human_type(input_el, caption)
                print("[SUCCESS] Caption typed.")
                
            except Exception as e:
                print(f"[ERROR] Could not type caption: {e}")
                return False

            # 5. CLICK POST
            print("[ACTION] Clicking Post...")
            time.sleep(2)
            try:
                # Find the "Post" button
                # Scope to modal for better accuracy
                modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                
                # Find 'Post' text inside modal
                # Using XPath relative to modal is tricky with Selenium element search, 
                # so we get all elements in modal and filter.
                
                # Option 1: Find by text inside modal
                post_btns = modal.find_elements(By.XPATH, ".//div[text()='Post']")
                
                valid_post_btn = None
                for btn in reversed(post_btns):
                    # Check if it has button role or is inside one
                    parent = btn.find_element(By.XPATH, "./..") # parent
                    if btn.get_attribute("role") == "button" or parent.get_attribute("role") == "button":
                         if btn.is_displayed():
                            valid_post_btn = btn
                            break
                
                if not valid_post_btn:
                     # Fallback to the specific class structure if text search fails (less robust but specific)
                     try:
                         valid_post_btn = modal.find_element(By.XPATH, ".//div[text()='Post']/ancestor::div[@role='button'][1]")
                     except:
                         pass

                if valid_post_btn:
                    valid_post_btn.click()
                    print("[SUCCESS] Clicked Post.")
                    
                    # Wait for completion (modal close or progress)
                    time.sleep(5) 
                    return True
                else:
                    print("[ERROR] Post button not found.")
                    return False

            except Exception as e:
                print(f"[ERROR] Failed to click Post: {e}")
                return False

        except Exception as e:
            print(f"[ERROR] Post creation flow failed: {e}")
            self.take_screenshot(driver, 'post_error')
            return False

    def _human_type(self, element, text):
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pid = sys.argv[1]
        worker = ThreadsPostWorker(pid)
        worker.start()
    else:
        print("Usage: python threads_post_worker.py <profile_id>")

import time
import random
import logging
import uuid
import traceback
import json
from datetime import datetime, date
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from config import Config
from database import Database
from core.ai_generator import AICommentGenerator
from post_config import POST_SETTINGS

logger = logging.getLogger(__name__)

class ThreadsPostWorker:
    def __init__(self, profile_id, db=None):
        self.profile_id = profile_id
        self.settings = POST_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'posts'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "posts": 0,
            "errors": 0
        }

    def take_screenshot(self, driver, name):
        try:
            ts = datetime.now().strftime('%H%M%S')
            filename = f'{ts}_{name}.png'
            path = self.screenshot_dir / filename
            driver.save_screenshot(str(path))
            return str(path)
        except Exception as e:
            print(f"[ERROR] Screenshot failed: {e}")
            return None

    def start(self):
        print(f"\n{'='*80}")
        print(f"[POST SESSION] Profile: {self.profile_id}")
        print(f"Goal: 1 Post")
        print(f"{'='*80}\n")
        
        try:
            # Check limits
            daily_count = self.db.get_daily_post_count(self.profile_id)
            if daily_count >= self.settings['max_posts_per_day']:
                print(f"[LIMIT] Daily post limit reached ({daily_count}/{self.settings['max_posts_per_day']}). Stopping.")
                return

            # Select photo early to fail fast
            photo_path = self._select_photo()
            if not photo_path:
                print("[STOP] No unused photos found (or folder empty).")
                return
                
            print(f"[SETUP] Selected photo: {os.path.basename(photo_path)}")
            
            # Generate caption
            caption = self._generate_caption(photo_path)
            print(f"[SETUP] Generated caption: {caption}")

            print("[1/3] Launching browser...")
            
            # Create session
            self.db.create_session(self.session_id, self.profile_id, "Poster")

            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                
                # 1. Navigate to Home
                driver.get("https://www.threads.net/")
                time.sleep(5)
                
                # 2. Create Post
                success = self._create_single_post(driver, photo_path, caption)
                
                if success:
                    self.stats['posts'] = 1
                    print("[SUCCESS] Post created successfully.")
                    
                    # Log to DB
                    self.db.log_action(
                        self.session_id, 
                        self.profile_id, 
                        "post", 
                        status="success", 
                        metadata={
                            "photo_filename": os.path.basename(photo_path),
                            "text": caption
                        }
                    )
                    
                    # Update daily stats
                    self.db.update_daily_stats(self.profile_id, "post", 1)
                    
                else:
                    self.stats['errors'] += 1
                    print("[FAIL] Failed to create post.")
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            self.stats['errors'] += 1
            traceback.print_exc()
        finally:
            print(f"\n[COMPLETE] Posts: {self.stats['posts']}")
            self.db.complete_session(self.session_id, self.stats)

    def _select_photo(self):
        folder = Path(self.settings['photos_folder'])
        if not folder.exists():
            print(f"[ERROR] Photo folder not found: {folder}")
            return None
            
        allowed = set(self.settings['allowed_extensions'])
        all_photos = [
            f for f in folder.iterdir() 
            if f.is_file() and f.suffix.lower() in allowed
        ]
        
        if not all_photos:
            print(f"[ERROR] No photos found in {folder}")
            return None
            
        used_photos = self.db.get_used_photos(self.profile_id)
        available = [f for f in all_photos if f.name not in used_photos]
        
        if not available:
            print("[WARN] All photos used! Stopping.")
            return None
            
        return str(random.choice(available))

    def _generate_caption(self, photo_path):
        filename = os.path.basename(photo_path)
        # Simple topic extraction: "sunset_beach.jpg" -> "sunset beach"
        topic = os.path.splitext(filename)[0].replace('_', ' ').replace('-', ' ')
        
        prompt = self.settings['ai_prompt'].replace('{TOPIC}', topic)
        
        return self.ai.generate_comment(
            topic, # context
            provider_name=self.settings['ai_provider'],
            prompt_template=prompt
        )

    def _create_single_post(self, driver, photo_path, caption):
        print("[ACTION] Starting post creation flow...")
        
        try:
            # 1. CLICK "START A THREAD" PLACEHOLDER
            print("[ACTION] Looking for 'Start a thread' placeholder...")
            try:
                # Based on user provided HTML: <div aria-label="Empty text field... " role="button">
                start_placeholder = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, 'div[aria-label*="Empty text field"][role="button"]'))
                )
                start_placeholder.click()
                print("[SUCCESS] Clicked placeholder.")
                time.sleep(2)
            except TimeoutException:
                print("[ERROR] Could not find 'Start a thread' placeholder.")
                return False

            # 2. UPLOAD PHOTO
            # We need to find the file input. 
            # Strategy: Find "Attach media" button to confirm we are in the right place, then find the hidden input.
            print("[ACTION] Uploading photo...")
            
            # Find the input directly if possible
            file_input = None
            try:
                # IMPORTANT: In modal, the input might be present but we need to ensure we target the right one
                # or wait for it to be ready.
                file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            except:
                pass
            
            if not file_input:
                # Try clicking the Attach Media button (User provided div class) to ensure input is rendered
                try:
                    # Look for the SVG inside the button usually, or the button itself
                    # We scope this to the modal if possible, but global search works if modal is top
                    modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                    attach_btn = modal.find_element(By.CSS_SELECTOR, 'svg[aria-label="Attach media"]')
                    
                    attach_container = attach_btn.find_element(By.XPATH, "./ancestor::div[@role='button'][1]")
                    attach_container.click()
                    time.sleep(1)
                    file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                except Exception as e:
                    print(f"[WARN] Could not find/click attach button: {e}")
            
            if file_input:
                file_input.send_keys(photo_path)
                print(f"[SUCCESS] Sent file path to input: {os.path.basename(photo_path)}")
            else:
                print("[ERROR] File input not found. Cannot upload.")
                return False

            # 3. WAIT FOR PREVIEW
            print("[WAIT] Waiting for image preview...")
            try:
                WebDriverWait(driver, 15).until(
                    lambda d: len(d.find_elements(By.CSS_SELECTOR, 'div[data-pressable-container="true"] img')) > 0
                    or len(d.find_elements(By.TAG_NAME, "img")) > 2 
                )
                time.sleep(3)
            except:
                print("[WARN] Timeout waiting for preview (might still be ok).")

            # 4. TYPE CAPTION
            print("[ACTION] Typing caption...")
            try:
                # After clicking placeholder, focus should be in the editable div
                # We can try to use active element
                active = driver.switch_to.active_element
                if active and active.get_attribute('contenteditable') == 'true':
                    input_el = active
                else:
                    # Fallback to finding it
                    input_el = driver.find_element(By.CSS_SELECTOR, 'div[contenteditable="true"]')
                
                input_el.click()
                time.sleep(0.5)
                self._human_type(input_el, caption)
                print("[SUCCESS] Caption typed.")
                
            except Exception as e:
                print(f"[ERROR] Could not type caption: {e}")
                return False

            # 5. CLICK POST
            print("[ACTION] Clicking Post...")
            time.sleep(2)
            try:
                # Find the "Post" button
                # Scope to modal for better accuracy
                modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                
                # Find 'Post' text inside modal
                # Using XPath relative to modal is tricky with Selenium element search, 
                # so we get all elements in modal and filter.
                
                # Option 1: Find by text inside modal
                post_btns = modal.find_elements(By.XPATH, ".//div[text()='Post']")
                
                valid_post_btn = None
                for btn in reversed(post_btns):
                    # Check if it has button role or is inside one
                    parent = btn.find_element(By.XPATH, "./..") # parent
                    if btn.get_attribute("role") == "button" or parent.get_attribute("role") == "button":
                         if btn.is_displayed():
                            valid_post_btn = btn
                            break
                
                if not valid_post_btn:
                     # Fallback to the specific class structure if text search fails (less robust but specific)
                     try:
                         valid_post_btn = modal.find_element(By.XPATH, ".//div[text()='Post']/ancestor::div[@role='button'][1]")
                     except:
                         pass

                if valid_post_btn:
                    valid_post_btn.click()
                    print("[SUCCESS] Clicked Post.")
                    
                    # Wait for completion (modal close or progress)
                    time.sleep(5) 
                    return True
                else:
                    print("[ERROR] Post button not found.")
                    return False

            except Exception as e:
                print(f"[ERROR] Failed to click Post: {e}")
                return False

        except Exception as e:
            print(f"[ERROR] Post creation flow failed: {e}")
            self.take_screenshot(driver, 'post_error')
            return False

    def _human_type(self, element, text):
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        pid = sys.argv[1]
        worker = ThreadsPostWorker(pid)
        worker.start()
    else:
        print("Usage: python threads_post_worker.py <profile_id>")
