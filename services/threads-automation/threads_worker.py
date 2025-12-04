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
from datetime import datetime, date

# Add project root to path to allow imports from shared module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

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
        self.stats = {
            "follows": 0,
            "likes": 0,
            "comments": 0,
            "errors": 0
        }

    def start(self):
        """Main automation entry point"""
        logger.info(f"Starting session {self.session_id} for profile {self.profile_id}")
        
        # 1. Create Session Record
        self._record_session_start()
        
        try:
            # 2. Check Daily Limits
            if not self._check_limits():
                logger.warning("Daily limits reached. Stopping.")
                return

            # 3. Launch Browser
            with GoLoginSession(self.gologin, self.profile_id) as session:
                driver = session['driver']
                actions = ThreadsActions(driver)
                
                # 4. Automation Loop
                self._run_automation_loop(driver, actions)
                
        except Exception as e:
            logger.error(f"Session failed: {e}")
            self.stats["errors"] += 1
            self.db.log_action(self.session_id, self.profile_id, "session_error", None, "failed", str(e))
        finally:
            self._record_session_end()

    def _run_automation_loop(self, driver, actions):
        """Core logic: Scroll feed, filter users/posts, execute actions"""
        driver.get("https://www.threads.com/")
        time.sleep(5) # Wait for load
        
        # Find Follow Buttons (Modal or Feed)
        # For simplicity, we assume we are on a feed or following list
        # Future improvement: navigate to specific target URLs
        
        processed_count = 0
        max_actions = 20 # Safety cap per session
        
        while processed_count < max_actions:
            # 1. Find potential targets (posts or users)
            # This is a simplified logic looking for visible follow buttons
            # In a real scenario, we'd look for Post containers to do Like/Comment too
            
            # --- Auto-Follow Logic ---
            buttons = actions.find_follow_buttons(driver)
            for btn in buttons:
                if processed_count >= max_actions: break
                
                username = actions.extract_username(btn)
                
                # Filter User
                if not ThreadsFilters.filter_user(username, "", self.settings):
                    logger.info(f"Skipping user {username} (filtered)")
                    continue
                
                # Execute Follow
                if actions.safe_click(btn):
                    self.stats["follows"] += 1
                    self.db.log_action(self.session_id, self.profile_id, "follow", username, "success")
                    self.db.update_daily_stats(self.profile_id, "follow")
                    processed_count += 1
                    actions.random_delay()
            
            # --- Auto-Like / Comment Logic (Placeholder structure) ---
            # To implement this, we need to iterate over Post Articles
            # posts = driver.find_elements(By.CSS_SELECTOR, SELECTORS["post_article"])
            # for post in posts:
            #    ... extract text, generate AI comment, click like ...
            
            # Scroll to load more
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(3)
            
            # Break if no new actions found (simple exit condition)
            if len(buttons) == 0:
                logger.info("No targets found, stopping.")
                break

    def _check_limits(self):
        """Check against daily limits in DB"""
        # TODO: Query daily_limits table
        # For MVP, return True
        return True

    def _record_session_start(self):
        conn = self.db.get_connection()
        c = conn.cursor()
        c.execute("INSERT INTO sessions (id, profile_id, started_at, status) VALUES (?, ?, ?, ?)",
                  (self.session_id, self.profile_id, datetime.now(), "running"))
        conn.commit()
        conn.close()

    def _record_session_end(self):
        conn = self.db.get_connection()
        c = conn.cursor()
        c.execute("""
            UPDATE sessions 
            SET ended_at = ?, status = ?, actions_performed = ?, errors_count = ? 
            WHERE id = ?
        """, (datetime.now(), "completed", sum(self.stats.values()), self.stats["errors"], self.session_id))
        conn.commit()
        conn.close()




