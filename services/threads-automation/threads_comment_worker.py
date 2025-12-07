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
from selenium.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException

from shared.browser_automation.gologin_manager import GoLoginManager, GoLoginSession
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
        
        self.screenshot_dir = Path(__file__).parent / 'screenshots' / 'comments'
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        
        self.stats = {
            "comments": 0,
            "processed": 0,
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
        print(f"[COMMENT SESSION] Profile: {self.profile_id}")
        print(f"Goal: {self.settings['max_comments_per_session']} comments")
        print(f"Provider: {self.settings['ai_provider']}")
        print(f"{'='*80}\n")
        
        try:
            # Check limits
            if self.db.is_daily_limit_reached(self.profile_id, 'comment', 100):
                print("[LIMIT] Daily comment limit reached. Stopping.")
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
        finally:
            print(f"\n[COMPLETE] Comments: {self.stats['comments']} | Processed: {self.stats['processed']}")
            # Log final stats to DB
            self.db.complete_session(self.session_id, self.stats)

    def _navigate_to_feed(self, driver):
        url = "https://www.threads.net/"
        if self.settings['feed_type'] == 'following':
            url += "following"
        
        print(f"[2/4] Navigating to {url}...")
        driver.get(url)
        time.sleep(10) # Wait for initial load
        self.take_screenshot(driver, 'feed_loaded')
        
        # Create session in DB
        self.db.create_session(self.session_id, self.profile_id, "Commenter")

    def _process_feed(self, driver):
        print("[3/4] Processing Feed...")
        processed_urls = set()
        scrolls = 0
        
        while self.stats['comments'] < self.settings['max_comments_per_session'] and scrolls < self.settings['max_scrolls']:
            # Find all posts currently visible
            posts = driver.find_elements(By.CSS_SELECTOR, '[role="article"]')
            print(f"[LOOP] Found {len(posts)} posts in view.")
            
            for post in posts:
                if self.stats['comments'] >= self.settings['max_comments_per_session']:
                    break
                    
                try:
                    # Get unique ID for post (link is best)
                    try:
                        # Find timestamp link usually serves as permalink
                        link_el = post.find_element(By.CSS_SELECTOR, 'a[href*="/post/"]')
                        post_url = link_el.get_attribute('href')
                    except:
                        continue # Skip posts without links (ads/weird layouts)
                        
                    if post_url in processed_urls:
                        continue
                        
                    processed_urls.add(post_url)
                    self.stats['processed'] += 1
                    
                    # Process this post
                    if self._should_process_post(post, post_url):
                        success = self._comment_on_post(driver, post, post_url)
                        if success:
                            # Wait random delay
                            delay = random.uniform(self.settings['comments_delay_min'], self.settings['comments_delay_max'])
                            print(f"[WAIT] Sleeping {delay:.1f}s before next comment...")
                            time.sleep(delay)
                            
                except StaleElementReferenceException:
                    continue # DOM updated, move on
                except Exception as e:
                    print(f"[WARN] Failed to process post: {e}")
            
            # Scroll down
            print("[SCROLL] Loading more posts...")
            driver.execute_script("window.scrollBy(0, 800);")
            time.sleep(self.settings['scroll_delay'])
            scrolls += 1

    def _should_process_post(self, post, url):
        # 1. Check DB if already processed (commented)
        # We need a method to check if we commented on this URL
        # For now, simplistic check:
        # TODO: Add is_url_commented to DB
        
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

    def _comment_on_post(self, driver, post, url):
        print(f"[ACTION] Processing post: {url}")
        
        try:
            # 1. Extract Text
            post_text = post.text
            # Basic cleanup to remove user handle, timestamps from start
            # Heuristic: split by newlines, join meaningful parts
            lines = [l for l in post_text.split('\n') if len(l) > 2]
            clean_text = " ".join(lines[:3]) # First 3 lines usually contain the meat
            
            # 1.5 Like Post (if enabled)
            if self.settings.get('enable_like', True):
                try:
                    # Check if already liked
                    try:
                        post.find_element(By.CSS_SELECTOR, 'svg[aria-label="Unlike"]')
                        print("[DEBUG] Post already liked.")
                    except NoSuchElementException:
                        # Not liked yet, find Like button
                        like_btn = post.find_element(By.CSS_SELECTOR, 'svg[aria-label="Like"]')
                        like_container = like_btn.find_element(By.XPATH, "./ancestor::div[@role='button' or contains(@class, 'x1i10hfl')][1]")
                        
                        print("[ACTION] Clicking Like...")
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", like_container)
                        time.sleep(0.5)
                        like_container.click()
                        
                        # Log Like
                        self.db.log_action(
                            self.session_id, self.profile_id, "like", 
                            target_url=url, status="success"
                        )
                        self.db.update_daily_stats(self.profile_id, "like", 1)
                        time.sleep(random.uniform(1, 2))
                except Exception as e:
                    print(f"[WARN] Failed to like post: {e}")

            # 2. Find Reply Button
            reply_btn = post.find_element(By.CSS_SELECTOR, 'svg[aria-label="Reply"]')
            # Usually needs clicking the parent button/div
            reply_container = reply_btn.find_element(By.XPATH, "./ancestor::div[@role='button' or contains(@class, 'x1i10hfl')][1]")
            
            print("[ACTION] Clicking Reply...")
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", reply_container)
            time.sleep(1)
            reply_container.click()
            
            # 3. Wait for Modal or Input
            # Extension logic: Wait for modal
            time.sleep(2)
            
            # Find input
            # Try finding textarea or contenteditable
            # Logic from extension: 'div[contenteditable="true"][aria-label*="Reply"]'
            try:
                input_el = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true" and @aria-label="Reply to thread"]'))
                )
            except:
                # Fallback
                input_el = driver.find_element(By.XPATH, '//div[@contenteditable="true"]')
                
            print("[DEBUG] Input found.")
            
            # 4. Generate Comment
            print("[AI] Generating comment...")
            comment = self.ai.generate_comment(
                clean_text, 
                provider_name=self.settings['ai_provider'],
                prompt_template=self.settings['ai_prompt']
            )
            print(f"[AI] Generated: {comment}")
            
            # 5. Type Comment (Human-like)
            input_el.click()
            time.sleep(0.5)
            self._human_type(input_el, comment)
            
            # 6. Click Post
            time.sleep(1)
            post_btn = driver.find_element(By.XPATH, "//div[text()='Post' and @role='button']")
            if post_btn:
                print("[ACTION] Clicking Post...")
                post_btn.click()
                time.sleep(3) # Wait for submission
                
                # Log Success
                self.db.log_action(
                    self.session_id, self.profile_id, "comment", 
                    target_url=url, status="success", metadata={"text": comment}
                )
                self.stats['comments'] += 1
                return True
                
        except Exception as e:
            print(f"[ERROR] Failed to comment: {e}")
            self.take_screenshot(driver, 'error_comment')
            return False
            
        return False

    def _human_type(self, element, text):
        for char in text:
            element.send_keys(char)
            time.sleep(random.uniform(0.05, 0.2))


