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
from shared.browser_automation.browser_profiles import BrowserProfileManager
from config import Config
from database import Database
from core.ai_generator import AICommentGenerator
from post_config import POST_SETTINGS

logger = logging.getLogger(__name__)

class ThreadsPostWorker:
    def __init__(self, profile_id, db=None, specific_photo=None, topic_hint=""):
        self.profile_id = profile_id
        self.settings = POST_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        self.specific_photo = specific_photo  # Optional: specific photo filename to post
        self.topic_hint = topic_hint  # Optional: topic hint for AI caption
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'posts'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.profile_name = self._get_profile_name()
        
        self.stats = {
            "posts": 0,
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
        print(f"[POST SESSION] Profile: {self.profile_name}")
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
            self.db.create_session(self.session_id, self.profile_id, self.profile_name)

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
        """Select photo to post - either specific one or random unused"""
        folder = Path(self.settings['photos_folder'])
        if not folder.exists():
            print(f"[ERROR] Photo folder not found: {folder}")
            return None
        
        # If specific photo requested, use that
        if self.specific_photo:
            specific_path = folder / self.specific_photo
            if specific_path.exists():
                print(f"[INFO] Using specific photo: {self.specific_photo}")
                return str(specific_path)
            else:
                print(f"[WARN] Specific photo not found: {self.specific_photo}, selecting random...")
        
        # Otherwise, select random unused photo
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
        """Generate AI caption with topic hint"""
        # Use provided topic hint, or extract from filename
        if self.topic_hint:
            topic = self.topic_hint
            print(f"[AI] Using provided topic: {topic}")
        else:
            filename = os.path.basename(photo_path)
            # Simple topic extraction: "sunset_beach.jpg" -> "sunset beach"
            # Remove timestamp prefix if present
            topic = os.path.splitext(filename)[0]
            # Remove timestamp pattern like 20251211_115115_
            import re
            topic = re.sub(r'^\d{8}_\d{6}_', '', topic)
            topic = topic.replace('_', ' ').replace('-', ' ')
            print(f"[AI] Extracted topic from filename: {topic}")
        
        prompt = self.settings['ai_prompt'].replace('{TOPIC}', topic)
        
        return self.ai.generate_comment(
            topic, # context
            provider_name=self.settings['ai_provider'],
            model=self.settings['ai_model'],
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
            print("[ACTION] Uploading photo...")
            
            file_input = None
            try:
                file_input = driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            except:
                pass
            
            if not file_input:
                # Try clicking the Attach Media button
                try:
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
                modal = driver.find_element(By.CSS_SELECTOR, '[role="dialog"]')
                
                # Find 'Post' text inside modal
                post_btns = modal.find_elements(By.XPATH, ".//div[text()='Post']")
                
                valid_post_btn = None
                for btn in reversed(post_btns):
                    parent = btn.find_element(By.XPATH, "./..") # parent
                    if btn.get_attribute("role") == "button" or parent.get_attribute("role") == "button":
                         if btn.is_displayed():
                            valid_post_btn = btn
                            break
                
                if not valid_post_btn:
                     try:
                         valid_post_btn = modal.find_element(By.XPATH, ".//div[text()='Post']/ancestor::div[@role='button'][1]")
                     except:
                         pass

                if valid_post_btn:
                    valid_post_btn.click()
                    print("[SUCCESS] Clicked Post.")
                    
                    # Wait for completion
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
        """Type text character by character with human delays"""
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
