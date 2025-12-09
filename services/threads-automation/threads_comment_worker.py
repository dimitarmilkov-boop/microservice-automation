import sys
import os
import time
import random
import logging
import uuid
import traceback
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
from shared.browser_automation.browser_profiles import BrowserProfileManager
from config import Config
from database import Database
from core.ai_generator import AICommentGenerator
from core.selectors import SELECTORS
from comment_config import COMMENT_SETTINGS

logger = logging.getLogger(__name__)

class ThreadsCommentWorker:
    def __init__(self, profile_id, db=None):
        self.profile_id = profile_id
        self.settings = COMMENT_SETTINGS
        self.db = db or Database(Config.DB_PATH)
        self.gologin = GoLoginManager(gologin_token=Config.GOLOGIN_TOKEN)
        self.ai = AICommentGenerator()
        self.session_id = str(uuid.uuid4())
        
        # Get profile name for logging
        self.profile_name = self._get_profile_name()
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'comments'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "likes": 0,
            "comments": 0,
            "follows": 0,
            "processed": 0,
            "errors": 0
        }
    
    def _get_profile_name(self):
        """Get the GoLogin profile name from profile_id"""
        try:
            profile_manager = BrowserProfileManager()
            for name in profile_manager.list_profile_names():
                pid = profile_manager.get_profile_id_by_name(name)
                if pid == self.profile_id:
                    return name
            return self.profile_id[:8]
        except:
            return self.profile_id[:8]

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
        print(f"[COMMENT SESSION] Profile: {self.profile_name} ({self.profile_id[:8]})")
        print(f"Goal: {self.settings['max_comments_per_session']} comments")
        print(f"Provider: {self.settings['ai_provider']}")
        print(f"{'='*80}\n")
        
        # Create session in DB at the start
        self.db.create_session(self.session_id, self.profile_id, self.profile_name)
        
        try:
            # Check limits
            if self.db.is_daily_limit_reached(self.profile_id, 'comment', 100):
                print("[LIMIT] Daily comment limit reached. Stopping.")
                self.db.update_session(self.session_id, status='completed', log_summary='Daily limit reached')
                return

            print("[1/4] Launching browser...")
            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                
                # 1. Navigate to Feed
                self._navigate_to_feed(driver)
                
                # 2. Process Feed
                self._process_feed(driver)
                
        except Exception as e:
            print(f"[ERROR] Session failed: {e}")
            traceback.print_exc()
            self.stats['errors'] += 1
            self.db.update_session(self.session_id, status='failed', errors_count=self.stats['errors'])
        finally:
            print(f"\n[COMPLETE] Comments: {self.stats['comments']} | Likes: {self.stats['likes']} | Processed: {self.stats['processed']}")
            # Log final stats to DB
            self.db.complete_session(self.session_id, self.stats)

    def _navigate_to_feed(self, driver):
        url = "https://www.threads.net/"
        if self.settings['feed_type'] == 'following':
            url += "following"
        
        print(f"[2/4] Navigating to {url}...")
        driver.get(url)
        time.sleep(5) # Wait for initial load
        self.take_screenshot(driver, 'feed_loaded')

    def _process_feed(self, driver):
        print("[3/4] Processing Feed...")
        processed_urls = set()
        scrolls = 0
        
        while self.stats['comments'] < self.settings['max_comments_per_session'] and scrolls < self.settings['max_scrolls']:
            # SIMPLE APPROACH: Find Reply buttons directly, then get parent post
            reply_buttons = driver.find_elements(By.CSS_SELECTOR, 'svg[aria-label="Reply"]')
            print(f"[LOOP] Found {len(reply_buttons)} Reply buttons in view.")
            
            for reply_svg in reply_buttons:
                if self.stats['comments'] >= self.settings['max_comments_per_session']:
                    break
                    
                try:
                    # Get the clickable reply button container
                    reply_btn = reply_svg.find_element(By.XPATH, "./ancestor::div[@role='button'][1]")
                    
                    # Find the post container (go up from reply button)
                    # Try data-pressable-container first, then general parent
                    try:
                        post = reply_btn.find_element(By.XPATH, "./ancestor::div[@data-pressable-container='true'][1]")
                    except:
                        # Fallback: go up several levels
                        post = reply_btn.find_element(By.XPATH, "./ancestor::div[contains(@class, 'x1a2a7pz')][1]")
                    
                    # Get post URL for deduplication
                    try:
                        link_el = post.find_element(By.CSS_SELECTOR, 'a[href*="/post/"]')
                        post_url = link_el.get_attribute('href')
                    except:
                        post_url = f"post_{id(post)}"  # Fallback ID
                        
                    if post_url in processed_urls:
                        continue
                        
                    processed_urls.add(post_url)
                    self.stats['processed'] += 1
                    
                    # Process this post
                    if self._should_process_post(post, post_url):
                        success = self._comment_on_post(driver, post, reply_btn, post_url)
                        if success:
                            delay = random.uniform(self.settings['comments_delay_min'], self.settings['comments_delay_max'])
                            print(f"[WAIT] Sleeping {delay:.1f}s before next comment...")
                            time.sleep(delay)
                            
                except StaleElementReferenceException:
                    continue
                except Exception as e:
                    print(f"[WARN] Failed to process post: {e}")
            
            # Scroll down
            print("[SCROLL] Loading more posts...")
            driver.execute_script("window.scrollBy(0, 800);")
            time.sleep(self.settings['scroll_delay'])
            scrolls += 1

    def _should_process_post(self, post, url):
        # 1. Check DB if already processed (commented)
        if self.db.is_url_commented(self.profile_id, url):
            print(f"[SKIP] Already commented on: {url}")
            return False
        
        # 2. Filter content
        try:
            text = post.text.lower()
            
            # Skip short/long posts
            if len(text) < self.settings['min_post_length']: return False
            if len(text) > self.settings['max_post_length']: return False
            
            # Skip keywords
            for kw in self.settings['skip_keywords']:
                if kw in text:
                    print(f"[SKIP] Keyword '{kw}' found in post.")
                    return False
            
            return True
        except:
            return False

    def _comment_on_post(self, driver, post, reply_btn, url):
        """
        Simple flow:
        1. Extract text from post
        2. Click Like
        3. Click Reply (already have the button)
        4. Type comment in modal
        5. Click Post
        """
        print(f"\n[ACTION] Processing post: {url}")
        
        try:
            # 1. EXTRACT TEXT (using [dir="auto"] - proven to work)
            text_elements = post.find_elements(By.CSS_SELECTOR, 'span[dir="auto"], div[dir="auto"]')
            clean_text = ""
            max_len = 0
            
            for el in text_elements:
                text = el.text.strip()
                # Filter UI noise
                if text in ["Like", "Reply", "Share", "Translate", "followers"]: 
                    continue
                if len(text) > max_len:
                    max_len = len(text)
                    clean_text = text
            
            # Remove "Translate" suffix if present
            if clean_text.endswith("Translate"):
                clean_text = clean_text[:-9].strip()
            
            if not clean_text or len(clean_text) < 5:
                print(f"[SKIP] No text found or too short")
                return False
            
            # Skip spam/link posts
            if any(x in clean_text.lower() for x in ["http", ".com", "pin.it", "vk.ru", "google.com"]):
                print(f"[SKIP] Link/spam post")
                return False
                
            print(f"[TEXT] '{clean_text[:80]}...'")
            
            # 2. CLICK LIKE (if enabled and not already liked)
            if self.settings.get('enable_like', True):
                try:
                    # Check if already liked
                    unlike_btns = post.find_elements(By.CSS_SELECTOR, 'svg[aria-label="Unlike"]')
                    if unlike_btns:
                        print("[LIKE] Already liked")
                    else:
                        like_svg = post.find_element(By.CSS_SELECTOR, 'svg[aria-label="Like"]')
                        like_btn = like_svg.find_element(By.XPATH, "./ancestor::div[@role='button'][1]")
                        
                        print("[LIKE] Clicking...")
                        driver.execute_script("arguments[0].click();", like_btn)
                        self.stats['likes'] += 1
                        self.db.log_action(self.session_id, self.profile_id, "like", target_url=url, status="success")
                        time.sleep(random.uniform(0.5, 1.5))
                except Exception as e:
                    print(f"[LIKE] Failed: {e}")
            
            # 3. CLICK REPLY (we already have the button from _process_feed)
            print("[REPLY] Clicking...")
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", reply_btn)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", reply_btn)
            time.sleep(2)  # Wait for modal
            
            # 4. FIND INPUT (NO MODAL - it's inline with role="textbox")
            input_el = None
            
            for attempt in range(3):
                try:
                    # Primary: div[role="textbox"][contenteditable="true"]
                    input_el = driver.find_element(By.CSS_SELECTOR, 'div[role="textbox"][contenteditable="true"]')
                    if input_el:
                        print(f"[INPUT] Found textbox (attempt {attempt + 1})")
                        break
                except:
                    pass
                
                try:
                    # Fallback: aria-label contains "Empty text field"
                    input_el = driver.find_element(By.CSS_SELECTOR, 'div[aria-label*="Empty text field"]')
                    if input_el:
                        print(f"[INPUT] Found via aria-label (attempt {attempt + 1})")
                        break
                except:
                    pass
                
                time.sleep(1)
            
            if not input_el:
                raise Exception("Input field not found")
            
            # 5. GENERATE AI COMMENT
            print("[AI] Generating...")
            comment = self.ai.generate_comment(
                clean_text,
                provider_name=self.settings['ai_provider'],
                prompt_template=self.settings['ai_prompt']
            )
            print(f"[AI] '{comment}'")
            
            # 6. TYPE COMMENT (pure Selenium - no JS innerHTML)
            print("[TYPE] Typing comment...")
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", input_el)
            time.sleep(0.3)
            
            # Click to focus
            driver.execute_script("arguments[0].click();", input_el)
            time.sleep(0.3)
            
            # Clear any existing content
            ActionChains(driver).key_down(Keys.CONTROL).send_keys('a').key_up(Keys.CONTROL).perform()
            input_el.send_keys(Keys.DELETE)
            time.sleep(0.2)
            
            # Type character by character
            self._human_type(input_el, comment)
            time.sleep(1)
            
            # 7. CLICK POST BUTTON (search globally, not in modal)
            post_btn = None
            for attempt in range(3):
                try:
                    # Find Post button globally
                    btns = driver.find_elements(By.XPATH, "//div[@role='button']")
                    for btn in btns:
                        if btn.text.strip() == "Post":
                            post_btn = btn
                            break
                    if post_btn:
                        print(f"[POST] Found button (attempt {attempt + 1})")
                        break
                except:
                    pass
                time.sleep(0.5)
            
            if post_btn:
                print("[POST] Clicking Post button...")
                driver.execute_script("arguments[0].click();", post_btn)
            else:
                print("[POST] Button not found, using Ctrl+Enter...")
                ActionChains(driver).key_down(Keys.CONTROL).send_keys(Keys.RETURN).key_up(Keys.CONTROL).perform()
            
            time.sleep(3)
            
            # Log success
            self.db.log_action(self.session_id, self.profile_id, "comment", target_url=url, status="success", metadata={"text": comment})
            self.db.update_daily_stats(self.profile_id, "comment", 1)
            self.stats['comments'] += 1
            print(f"[SUCCESS] Comment posted!")
            return True
            
        except Exception as e:
            print(f"[ERROR] {e}")
            self.take_screenshot(driver, 'error_comment')
            return False

    def _human_type(self, element, text):
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))


