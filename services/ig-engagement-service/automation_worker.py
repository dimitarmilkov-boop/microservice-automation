"""
Instagram Engagement Service - Automation Worker
Core automation logic for liking comments on Instagram posts
"""

import random
import time
import logging
from typing import List, Optional
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from config import Settings
from database import DatabaseManager
from ig_selectors import SELECTORS
from shared.browser_automation import gologin_manager, selenium_base

logger = logging.getLogger(__name__)


class AutomationWorker:
    """
    Handles Instagram comment liking automation for a single session
    """
    
    def __init__(self, profile_id: str, profile_name: str, session_id: str,
                 db_manager: DatabaseManager, settings: Settings):
        self.profile_id = profile_id
        self.profile_name = profile_name
        self.session_id = session_id
        self.db = db_manager
        self.settings = settings
        
        self.driver: Optional[webdriver.Chrome] = None
        self.debugger_address: Optional[str] = None
        
        # Statistics
        self.posts_processed = 0
        self.likes_performed = 0
        self.errors_count = 0
    
    def run_session(self, posts_target: int) -> bool:
        """
        Main session execution
        
        Args:
            posts_target: Number of posts to process in this session
            
        Returns:
            True if session completed successfully
        """
        logger.info(f"Starting automation session for {self.profile_name}")
        logger.info(f"Target: {posts_target} posts, {self.settings.ig_comments_to_like} comments each")
        
        try:
            # Step 1: Start GoLogin session
            self._start_gologin()
            
            # Step 2: Connect Selenium
            self._connect_selenium()
            
            # Step 3: Verify Instagram login
            if not self._verify_instagram_login():
                raise Exception("Not logged into Instagram!")
            
            # Step 4: Load target accounts
            target_accounts = self._load_target_accounts()
            if not target_accounts:
                raise Exception("No target accounts found!")
            
            # Step 5: Process posts
            for _ in range(posts_target):
                if self._is_daily_limit_reached():
                    logger.warning("Daily limit reached, stopping session")
                    break
                
                success = self._process_one_post(target_accounts)
                if success:
                    self.posts_processed += 1
            
            # Step 6: Update session statistics
            self.db.update_session(
                self.session_id,
                posts_processed=self.posts_processed,
                likes_performed=self.likes_performed,
                errors_count=self.errors_count
            )
            
            logger.info(f"Session complete: {self.posts_processed} posts, {self.likes_performed} likes")
            return True
        
        except Exception as e:
            logger.error(f"Session failed: {e}", exc_info=True)
            self.db.log_action(
                profile_id=self.profile_id,
                action='session_error',
                session_id=self.session_id,
                success=False,
                error_message=str(e)
            )
            return False
        
        finally:
            self._cleanup()
    
    def _start_gologin(self):
        """Launch GoLogin profile"""
        logger.info(f"Launching GoLogin profile: {self.profile_name}")
        
        try:
            self.debugger_address = gologin_manager.start_session(self.profile_id)
            logger.info(f"GoLogin started: {self.debugger_address}")
            
            self.db.log_action(
                profile_id=self.profile_id,
                action='gologin_started',
                session_id=self.session_id,
                metadata={'debugger_address': self.debugger_address}
            )
        
        except Exception as e:
            logger.error(f"Failed to start GoLogin: {e}")
            raise
    
    def _connect_selenium(self):
        """Connect Selenium to GoLogin browser"""
        logger.info("Connecting Selenium to browser...")
        
        try:
            self.driver = selenium_base.connect_to_browser(self.debugger_address)
            logger.info("Selenium connected successfully")
            
            self.db.log_action(
                profile_id=self.profile_id,
                action='selenium_connected',
                session_id=self.session_id
            )
        
        except Exception as e:
            logger.error(f"Failed to connect Selenium: {e}")
            raise
    
    def _verify_instagram_login(self) -> bool:
        """Verify user is logged into Instagram"""
        logger.info("Verifying Instagram login...")
        
        try:
            self.driver.get("https://www.instagram.com/")
            time.sleep(3)  # Wait for page load
            
            # Check if login button is visible (not logged in)
            try:
                self.driver.find_element(By.CSS_SELECTOR, SELECTORS.LOGIN_BUTTON)
                logger.error("Instagram login button found - not logged in!")
                return False
            except NoSuchElementException:
                # Login button not found = logged in
                logger.info("Instagram login verified")
                return True
        
        except Exception as e:
            logger.error(f"Failed to verify login: {e}")
            return False
    
    def _load_target_accounts(self) -> List[str]:
        """Load target Instagram accounts from file"""
        target_file = self.settings.get_target_accounts_path()
        
        if not target_file.exists():
            logger.error(f"Target accounts file not found: {target_file}")
            return []
        
        accounts = []
        with open(target_file, 'r', encoding='utf-8') as f:
            for line in f:
                username = line.strip()
                if username and not username.startswith('#'):
                    accounts.append(username)
                    # Add to database if not already there
                    self.db.add_target_account(username)
        
        logger.info(f"Loaded {len(accounts)} target accounts")
        return accounts
    
    def _is_daily_limit_reached(self) -> bool:
        """Check if daily like limit has been reached"""
        current_likes = self.db.get_daily_likes(self.profile_id)
        return current_likes >= self.settings.ig_daily_like_limit
    
    def _process_one_post(self, target_accounts: List[str]) -> bool:
        """
        Process one random post from a random target account
        
        Returns:
            True if post was processed successfully
        """
        max_retries = 5
        
        for attempt in range(max_retries):
            try:
                # Pick random account
                username = random.choice(target_accounts)
                logger.info(f"Selected target: @{username}")
                
                # Navigate to profile
                profile_url = f"https://www.instagram.com/{username}/"
                self.driver.get(profile_url)
                self._random_delay(2, 4)
                
                # Find recent posts
                post_links = self._get_recent_posts()
                if not post_links:
                    logger.warning(f"No posts found for @{username}")
                    continue
                
                # Pick random post
                post_url = random.choice(post_links)
                
                # Check if already processed
                if self.db.is_post_processed(post_url):
                    logger.info(f"Post already processed: {post_url}")
                    continue  # Try another post
                
                # Process this post
                success = self._like_post_comments(post_url, username)
                if success:
                    self.db.update_target_account_processed(username)
                    return True
            
            except Exception as e:
                logger.error(f"Error processing post (attempt {attempt+1}): {e}")
                self.errors_count += 1
                self._random_delay(3, 5)
        
        logger.warning(f"Failed to process post after {max_retries} attempts")
        return False
    
    def _get_recent_posts(self) -> List[str]:
        """Get URLs of recent posts from current profile page"""
        try:
            # Wait for posts to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, SELECTORS.POSTS_GRID))
            )
            
            # Find all post links
            post_elements = self.driver.find_elements(By.CSS_SELECTOR, SELECTORS.POST_LINK)
            
            # Extract hrefs (only posts, not reels or other content)
            post_urls = []
            for elem in post_elements[:12]:  # Get first 12 posts
                href = elem.get_attribute('href')
                if href and '/p/' in href:
                    post_urls.append(href)
            
            logger.info(f"Found {len(post_urls)} recent posts")
            return post_urls
        
        except TimeoutException:
            logger.warning("Timeout waiting for posts to load")
            return []
        except Exception as e:
            logger.error(f"Error getting posts: {e}")
            return []
    
    def _like_post_comments(self, post_url: str, username: str) -> bool:
        """
        Open post and like top comments
        
        Args:
            post_url: Full URL of the Instagram post
            username: Instagram username of the post owner
            
        Returns:
            True if comments were liked successfully
        """
        logger.info(f"Opening post: {post_url}")
        
        try:
            # Navigate to post
            self.driver.get(post_url)
            self._random_delay(3, 5)
            
            # Find comment like buttons using XPath (more reliable)
            like_buttons = self._find_comment_like_buttons()
            
            if not like_buttons:
                logger.warning("No comment like buttons found")
                return False
            
            # Like top N comments
            num_to_like = min(self.settings.ig_comments_to_like, len(like_buttons))
            logger.info(f"Liking {num_to_like} comments...")
            
            comments_liked = 0
            for i in range(num_to_like):
                try:
                    button = like_buttons[i]
                    
                    # Check if already liked (aria-label contains "Unlike")
                    aria_label = button.get_attribute('aria-label')
                    if 'unlike' in aria_label.lower():
                        logger.debug(f"Comment {i+1} already liked, skipping")
                        continue
                    
                    # Click like button
                    button.click()
                    comments_liked += 1
                    self.likes_performed += 1
                    logger.debug(f"Liked comment {i+1}/{num_to_like}")
                    
                    # Log action
                    self.db.log_action(
                        profile_id=self.profile_id,
                        action='like_comment',
                        session_id=self.session_id,
                        target_url=post_url,
                        instagram_username=username,
                        metadata={'comment_index': i+1}
                    )
                    
                    # Increment daily likes counter
                    self.db.increment_daily_likes(self.profile_id)
                    
                    # Random delay between likes
                    self._random_delay()
                
                except Exception as e:
                    logger.error(f"Failed to like comment {i+1}: {e}")
                    self.errors_count += 1
            
            # Record processed post
            self.db.add_processed_post(
                post_url=post_url,
                instagram_username=username,
                profile_id=self.profile_id,
                comments_liked=comments_liked,
                status='completed'
            )
            
            logger.info(f"Successfully liked {comments_liked} comments on post")
            return comments_liked > 0
        
        except Exception as e:
            logger.error(f"Error liking post comments: {e}")
            self.errors_count += 1
            
            # Record failed post
            self.db.add_processed_post(
                post_url=post_url,
                instagram_username=username,
                profile_id=self.profile_id,
                comments_liked=0,
                status='failed',
                notes=str(e)
            )
            return False
    
    def _find_comment_like_buttons(self) -> List:
        """Find like buttons for comments using multiple strategies"""
        try:
            # Strategy 1: XPath for comment like buttons
            wait = WebDriverWait(self.driver, 10)
            wait.until(
                EC.presence_of_element_located((By.XPATH, SELECTORS.xpath_all_comment_like_buttons()))
            )
            
            buttons = self.driver.find_elements(By.XPATH, SELECTORS.xpath_all_comment_like_buttons())
            if buttons:
                logger.debug(f"Found {len(buttons)} like buttons via XPath")
                return buttons
        
        except TimeoutException:
            logger.warning("Timeout finding comment like buttons")
        except Exception as e:
            logger.error(f"Error finding like buttons: {e}")
        
        return []
    
    def _random_delay(self, min_seconds: Optional[float] = None, 
                     max_seconds: Optional[float] = None):
        """Sleep for a random duration to mimic human behavior"""
        if min_seconds is None:
            min_seconds = self.settings.ig_action_delay_min
        if max_seconds is None:
            max_seconds = self.settings.ig_action_delay_max
        
        delay = random.uniform(min_seconds, max_seconds)
        time.sleep(delay)
    
    def _cleanup(self):
        """Clean up resources"""
        logger.info("Cleaning up automation session...")
        
        try:
            if self.driver:
                self.driver.quit()
                logger.debug("Selenium driver closed")
        except Exception as e:
            logger.error(f"Error closing Selenium: {e}")
        
        try:
            if self.profile_id:
                gologin_manager.cleanup_session(self.profile_id)
                logger.debug("GoLogin session closed")
        except Exception as e:
            logger.error(f"Error closing GoLogin: {e}")
        
        self.db.complete_session(self.session_id)
        logger.info("Session cleanup complete")

