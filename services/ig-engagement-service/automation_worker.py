"""
Instagram Engagement Service - Automation Worker
Core automation logic for liking comments on Instagram posts

Based on working test_explore_liker.py with full database tracking,
error handling, and detailed logging for production use.
"""

import os
import sys
import time
import json
import random
import logging
import uuid
import sqlite3
from datetime import datetime, date
from pathlib import Path
from typing import List, Dict, Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from config import Settings
from shared.browser_automation import GoLoginManager, BrowserProfileManager

logger = logging.getLogger(__name__)


class InstagramWorker:
    """
    Instagram automation worker for ONE profile per session
    
    Handles:
    - GoLogin profile launch
    - Navigate to /explore
    - Find posts with 3+ comments
    - Like exactly 3 comments per post
    - Track in database (sessions, daily_likes, engagement_log, processed_posts)
    - Comprehensive error handling
    - Detailed logging
    """
    
    def __init__(self, profile_id: str, profile_name: str, settings: Settings):
        """
        Initialize worker for ONE profile
        
        Args:
            profile_id: GoLogin profile ID
            profile_name: GoLogin profile name (for logging)
            settings: Service settings from config.py
        """
        self.profile_id = profile_id
        self.profile_name = profile_name
        self.settings = settings
        
        # GoLogin / Selenium
        self.gologin_manager = GoLoginManager()
        self.gologin_session = None
        self.driver = None
        
        # Database
        self.db_path = settings.get_database_path()
        
        # Session tracking
        self.session_id = None
        self.session_start_time = None
        
        # Statistics
        self.posts_processed = 0
        self.likes_performed = 0
        self.errors_count = 0
        
        # Logs directory
        project_root = Path(__file__).parent.parent.parent.resolve()
        self.logs_dir = project_root / 'services' / 'ig-engagement-service' / 'logs'
        self.logs_dir.mkdir(exist_ok=True)
        
        logger.info(f"Worker initialized for profile: {profile_name} ({profile_id[:8]}...)")
    
    def run_session(self, posts_target: int = 5) -> Dict:
        """
        Run ONE automation session for ONE profile
        
        Flow:
        1. Check daily limit (skip if >= 30)
        2. Create session in database
        3. Launch GoLogin profile
        4. Navigate to /explore
        5. Process exactly N posts (skip if <3 comments)
        6. Like exactly 3 comments per post
        7. Update session stats
        8. Close browser
        
        Args:
            posts_target: Number of posts to process (default 5)
            
        Returns:
            dict with session_id, posts_processed, likes_performed, errors_count, duration
        """
        self.session_start_time = time.time()
        self.session_id = str(uuid.uuid4())
        
        # Terminal output
        print(f"\n{'='*80}")
        print(f"[SESSION START] {self.profile_name}")
        print(f"   Session ID: {self.session_id[:8]}...")
        print(f"   Target: {posts_target} posts x 3 likes = {posts_target * 3} likes")
        print(f"{'='*80}\n")
        
        logger.info(f"{'='*80}")
        logger.info(f"SESSION START: Profile {self.profile_name} ({self.profile_id[:8]}...)")
        logger.info(f"Session ID: {self.session_id}")
        logger.info(f"Target: {posts_target} posts, {posts_target * 3} likes")
        logger.info(f"{'='*80}")
        
        try:
            # Step 1: Check daily limit
            if self._check_daily_limit():
                logger.warning(f"Daily limit reached! Skipping session.")
                print(f"[WARNING] Daily limit reached for {self.profile_name}")
                return {
                    'session_id': self.session_id,
                    'posts_processed': 0,
                    'likes_performed': 0,
                    'errors_count': 0,
                    'duration': time.time() - self.session_start_time,
                    'skipped': True,
                    'skip_reason': 'daily_limit_reached'
                }
            
            # Step 2: Create session in database
            self._create_session_record()
            
            # Step 3: Launch GoLogin
            logger.info("\n[1/5] Launching GoLogin profile...")
            print("[1/5] Launching browser...")
            self._start_gologin()
            
            # Step 4: Navigate to /explore
            logger.info("\n[2/5] Navigating to /explore...")
            print("[2/5] Opening Instagram /explore...")
            self._navigate_to_explore()
            
            # Step 5: Process posts
            logger.info(f"\n[3/5] Processing {posts_target} posts...")
            print(f"[3/5] Looking for posts with 3+ comments...\n")
            self._process_posts(posts_target)
            
            # Step 6: Update session
            logger.info("\n[4/5] Updating session statistics...")
            self._complete_session_record('completed')
            
            # Step 7: Log summary
            duration = time.time() - self.session_start_time
            logger.info(f"\n{'='*80}")
            logger.info(f"SESSION COMPLETE: Profile {self.profile_name}")
            logger.info(f"  Posts processed: {self.posts_processed}/{posts_target}")
            logger.info(f"  Likes performed: {self.likes_performed}/{posts_target * 3}")
            logger.info(f"  Errors: {self.errors_count}")
            logger.info(f"  Duration: {duration:.1f} seconds")
            logger.info(f"{'='*80}\n")
            
            print(f"\n{'='*80}")
            print(f"[SESSION COMPLETE]")
            print(f"   Posts: {self.posts_processed}/{posts_target}")
            print(f"   Likes: {self.likes_performed}/{posts_target * 3}")
            print(f"   Duration: {duration:.1f}s")
            print(f"{'='*80}\n")
            
            return {
                'session_id': self.session_id,
                'posts_processed': self.posts_processed,
                'likes_performed': self.likes_performed,
                'errors_count': self.errors_count,
                'duration': duration
            }
        
        except Exception as e:
            logger.error(f"SESSION FAILED: {str(e)}", exc_info=True)
            print(f"[ERROR] Session failed: {e}")
            
            # Save error screenshot
            try:
                if self.driver:
                    timestamp = datetime.now().strftime('%H%M%S')
                    screenshot_path = self.logs_dir / f"error_session_{timestamp}.png"
                    self.driver.save_screenshot(str(screenshot_path))
                    logger.error(f"Error screenshot saved: {screenshot_path}")
            except:
                pass
            
            # Update session status
            self._complete_session_record('failed', error_message=str(e))
            
            # Log to engagement_log
            self._log_engagement_action('session_error', None, success=False, error_message=str(e))
            
            raise
        
        finally:
            # Always cleanup
            logger.info("\n[5/5] Cleaning up...")
            self.cleanup()
            logger.info("Browser cleanup complete")
    
    def _check_daily_limit(self) -> bool:
        """
        Check if daily like limit has been reached
        
        Returns:
            True if limit reached (>= 30), False otherwise
        """
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            today = date.today()
            cursor.execute("""
                SELECT like_count, limit_reached FROM daily_likes 
                WHERE profile_id = ? AND date = ?
            """, (self.profile_id, today))
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                current_count, limit_reached = result
                logger.info(f"Daily limit check: {current_count}/30 likes used today")
                print(f"[INFO] Today's likes: {current_count}/30")
                
                if limit_reached or current_count >= 30:
                    return True
            else:
                logger.info(f"Daily limit check: 0/30 likes used today (fresh start)")
                print(f"[INFO] Today's likes: 0/30 (fresh start)")
            
            return False
        
        except Exception as e:
            logger.error(f"Error checking daily limit: {e}")
            return False  # Allow session to continue on error
    
    def _create_session_record(self):
        """Create session record in database"""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO sessions (id, profile_id, started_at, status)
                VALUES (?, ?, ?, 'running')
            """, (self.session_id, self.profile_id, datetime.now()))
            
            conn.commit()
            conn.close()
            logger.info(f"Session record created in database")
        
        except Exception as e:
            logger.error(f"Error creating session record: {e}")
            # Don't raise - session can continue
    
    def _complete_session_record(self, status: str, error_message: str = None):
        """
        Update session record with final statistics
        
        Args:
            status: 'completed' or 'failed'
            error_message: Error message if failed
        """
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE sessions 
                SET ended_at = ?, status = ?, 
                    likes_performed = ?, posts_processed = ?, errors_count = ?
                WHERE id = ?
            """, (
                datetime.now(),
                status,
                self.likes_performed,
                self.posts_processed,
                self.errors_count,
                self.session_id
            ))
            
            # Update daily_likes if any likes were performed
            if self.likes_performed > 0:
                today = date.today()
                
                # Check if we've reached limit
                cursor.execute("""
                    SELECT like_count FROM daily_likes
                    WHERE profile_id = ? AND date = ?
                """, (self.profile_id, today))
                
                result = cursor.fetchone()
                new_count = (result[0] if result else 0) + self.likes_performed
                
                limit_reached = 1 if new_count >= 30 else 0
                
                cursor.execute("""
                    INSERT INTO daily_likes (profile_id, date, like_count, limit_reached)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(profile_id, date) 
                    DO UPDATE SET 
                        like_count = like_count + ?,
                        limit_reached = ?,
                        last_updated = CURRENT_TIMESTAMP
                """, (self.profile_id, today, self.likes_performed, limit_reached,
                      self.likes_performed, limit_reached))
                
                logger.info(f"Daily likes updated: {new_count}/30 (limit_reached={limit_reached})")
            
            conn.commit()
            conn.close()
            logger.info(f"Session record updated: status={status}")
        
        except Exception as e:
            logger.error(f"Error updating session record: {e}")
    
    def _start_gologin(self):
        """Launch GoLogin profile and connect Selenium"""
        try:
            # Start GoLogin session
            self.gologin_session = self.gologin_manager.start_session(self.profile_id)
            
            if not self.gologin_session or 'driver' not in self.gologin_session:
                raise Exception("GoLogin session failed to start")
            
            self.driver = self.gologin_session['driver']
            
            debugger_address = self.gologin_session.get('debugger_address', 'unknown')
            logger.info(f"GoLogin started successfully: {debugger_address}")
            print(f"[OK] Browser ready: {debugger_address}")
            
            # Verify Instagram login
            self._verify_instagram_login()
        
        except Exception as e:
            logger.error(f"Failed to start GoLogin: {e}")
            raise
    
    def _verify_instagram_login(self):
        """Verify user is logged into Instagram"""
        try:
            logger.info("Verifying Instagram login...")
            self.driver.get("https://www.instagram.com/")
            time.sleep(3)
            
            # Check if login button is visible (not logged in)
            try:
                self.driver.find_element(By.CSS_SELECTOR, "a[href*='/accounts/login']")
                logger.error("Login button found - NOT logged into Instagram")
                print("[ERROR] Not logged into Instagram!")
                raise Exception("Not logged into Instagram")
            except NoSuchElementException:
                logger.info("Instagram login verified")
                print("[OK] Instagram login verified")
        
        except Exception as e:
            if "Not logged into Instagram" in str(e):
                raise
            logger.error(f"Error verifying login: {e}")
            raise
    
    def _navigate_to_explore(self):
        """Navigate to Instagram /explore page"""
        try:
            self.driver.get("https://www.instagram.com/explore/")
            time.sleep(3)
            
            # Handle cookie popup
            self._handle_cookie_popup()
            
            logger.info(f"Loaded /explore page: {self.driver.current_url}")
            print(f"[OK] Loaded /explore feed")
        
        except Exception as e:
            logger.error(f"Error navigating to /explore: {e}")
            raise
    
    def _handle_cookie_popup(self):
        """Handle Instagram cookie consent popup (multilingual support)"""
        try:
            button_texts = [
                "Allow all cookies",
                "Allow essential and optional cookies",
                "Zezwól na wszystkie pliki cookie",  # Polish
                "Accept all",
                "Accept"
            ]
            
            for button_text in button_texts:
                try:
                    button = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{button_text}')]")
                    button.click()
                    logger.info(f"Dismissed cookie popup ('{button_text}')")
                    time.sleep(2)
                    return
                except NoSuchElementException:
                    continue
            
            # Alternative: find any button with cookie-related text
            try:
                buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
                for button in buttons:
                    button_text = button.text.lower()
                    if any(word in button_text for word in ['allow', 'accept', 'zezwól', 'cookie']):
                        button.click()
                        logger.info(f"Dismissed cookie popup (found: '{button.text}')")
                        time.sleep(2)
                        return
            except:
                pass
            
            logger.debug("No cookie popup found or already dismissed")
        
        except Exception as e:
            logger.warning(f"Error handling cookie popup: {e} (continuing anyway)")
    
    def _process_posts(self, posts_target: int):
        """
        Process multiple posts until target is reached
        
        CRITICAL: Each post MUST have 3+ comments
        If post has <3 comments, skip it and find another
        
        Args:
            posts_target: Number of posts to successfully process
        """
        posts_processed = 0
        attempts = 0
        max_attempts = posts_target * 3  # Try up to 3x posts to find enough good ones
        
        while posts_processed < posts_target and attempts < max_attempts:
            attempts += 1
            
            try:
                logger.info(f"\n[ATTEMPT {attempts}] Looking for post {posts_processed + 1}/{posts_target}...")
                print(f"[SEARCH] Attempt {attempts}: Looking for post with 3+ comments...")
                
                # CRITICAL: Ensure we're on /explore before finding posts
                current_url = self.driver.current_url
                if '/explore' not in current_url:
                    logger.info(f"  [RECOVERY] Not on /explore page, navigating back...")
                    self.driver.get("https://www.instagram.com/explore/")
                    time.sleep(3)
                
                # Find posts in /explore
                post_urls = self._find_explore_posts()
                if not post_urls:
                    logger.warning("No posts found in explore feed")
                    time.sleep(3)
                    continue
                
                # Pick random post
                post_url = random.choice(post_urls)
                
                # Check if already processed
                if self._is_post_processed(post_url):
                    logger.info(f"Post already processed, skipping: {post_url}")
                    self._log_engagement_action('skip_post', post_url, metadata={'reason': 'already_processed'})
                    continue
                
                # Process this post
                logger.info(f"\n[POST {posts_processed + 1}/{posts_target}] Opening: {post_url}")
                success = self._process_one_post(post_url)
                
                if success:
                    posts_processed += 1
                    self.posts_processed += 1
                    logger.info(f"[OK] Post processed successfully ({posts_processed}/{posts_target})")
                    print(f"[OK] Post {posts_processed}/{posts_target} complete! ({self.likes_performed} total likes today)")
                else:
                    logger.warning(f"[SKIP] Post skipped (not enough comments or error)")
            
            except Exception as e:
                logger.error(f"[ERROR] Error processing post (attempt {attempts}): {e}")
                print(f"[ERROR] Error on attempt {attempts}: {e}")
                self.errors_count += 1
                
                # Log error
                self._log_engagement_action('error', None, success=False, error_message=str(e))
                
                # Don't raise - try next post
                time.sleep(3)
        
        if posts_processed < posts_target:
            logger.warning(f"Only processed {posts_processed}/{posts_target} posts after {attempts} attempts")
            print(f"[WARNING] Only found {posts_processed}/{posts_target} suitable posts")
    
    def _find_explore_posts(self) -> List[str]:
        """
        Find post URLs in /explore feed
        
        Returns:
            List of post URLs
        """
        try:
            # Wait for posts to load
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/p/']")))
            
            # Find all post links
            post_elements = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/p/']")
            
            # Extract URLs
            post_urls = []
            for elem in post_elements[:20]:  # Get first 20 posts
                href = elem.get_attribute('href')
                if href and '/p/' in href:
                    post_urls.append(href)
            
            # Remove duplicates
            post_urls = list(set(post_urls))
            
            logger.info(f"Found {len(post_urls)} posts in explore feed")
            return post_urls
        
        except TimeoutException:
            logger.error("Timeout waiting for posts to load")
            return []
        except Exception as e:
            logger.error(f"Error finding posts: {e}")
            return []
    
    def _is_post_processed(self, post_url: str) -> bool:
        """
        Check if post has already been processed
        
        Args:
            post_url: Full Instagram post URL
            
        Returns:
            True if already processed
        """
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 1 FROM processed_posts WHERE post_url = ?
            """, (post_url,))
            
            result = cursor.fetchone()
            conn.close()
            
            return result is not None
        
        except Exception as e:
            logger.error(f"Error checking if post processed: {e}")
            return False  # If error, allow processing
    
    def _process_one_post(self, post_url: str) -> bool:
        """
        Open post and like exactly 3 comments
        
        CRITICAL: Post MUST have at least 3 comments
        If <3 comments, return False (skip this post)
        
        Args:
            post_url: Full Instagram post URL
            
        Returns:
            True if 3 comments were liked successfully, False otherwise
        """
        try:
            # Open post
            self.driver.get(post_url)
            time.sleep(3)
            
            # CRITICAL: Check if we're on the correct page (not liked_by, not error page)
            current_url = self.driver.current_url
            if '/liked_by' in current_url or '/likes' in current_url:
                logger.warning(f"  [ERROR] Navigated to wrong page (likes page): {current_url}")
                logger.info(f"  [RECOVERY] Returning to /explore...")
                self.driver.get("https://www.instagram.com/explore/")
                time.sleep(3)
                return False
            
            if '/p/' not in current_url:
                logger.warning(f"  [ERROR] Not on a post page: {current_url}")
                logger.info(f"  [RECOVERY] Returning to /explore...")
                self.driver.get("https://www.instagram.com/explore/")
                time.sleep(3)
                return False
            
            # Get post author
            post_author = "unknown"
            try:
                author_elem = self.driver.find_element(By.CSS_SELECTOR, "header a")
                post_author = author_elem.text
                logger.info(f"  Post by: @{post_author}")
            except:
                pass
            
            # CRITICAL: Check comment count (structure-based)
            comment_count = self._count_comments()
            logger.info(f"  Comments found: {comment_count}")
            
            if comment_count < 3:
                logger.warning(f"  [SKIP] Post has only {comment_count} comments, need at least 3")
                print(f"  [SKIP] Skipped: only {comment_count} comments")
                
                # Log skip action
                self._log_engagement_action(
                    'skip_post',
                    post_url,
                    instagram_username=post_author,
                    metadata={'reason': 'less_than_3_comments', 'comment_count': comment_count}
                )
                
                return False
            
            # Scroll comments container
            self._scroll_comments_container()
            
            # Find comment like buttons AFTER scrolling
            comment_buttons = self._find_comment_like_buttons()
            
            if len(comment_buttons) < 3:
                logger.warning(f"  [SKIP] Only found {len(comment_buttons)} like buttons, need 3")
                self._log_engagement_action(
                    'skip_post',
                    post_url,
                    instagram_username=post_author,
                    metadata={'reason': 'insufficient_like_buttons', 'buttons_found': len(comment_buttons)}
                )
                return False
            
            # Like first 3 comments
            logger.info(f"  Liking 3 comments...")
            comments_liked = 0
            
            for i in range(3):
                try:
                    button = comment_buttons[i]
                    
                    # Log button position for verification
                    try:
                        y_pos = button.location['y']
                        logger.info(f"    [TARGET {i+1}/3] Button at Y={y_pos} (visual position)")
                    except:
                        pass
                    
                    # Check if already liked
                    try:
                        svg = button.find_element(By.CSS_SELECTOR, "svg")
                        svg_aria = svg.get_attribute('aria-label') or ''
                        if 'unlike' in svg_aria.lower() or 'nie lubi' in svg_aria.lower():
                            logger.info(f"    Comment {i+1} already liked, skipping")
                            continue
                    except:
                        pass
                    
                    # Click like button
                    try:
                        # DON'T use scrollIntoView - it scrolls the whole page and moves comments!
                        # Just click directly with JavaScript
                        self.driver.execute_script("arguments[0].click();", button)
                        logger.info(f"    [OK] JavaScript click succeeded")
                    except Exception as e:
                        # Fallback to JavaScript click
                        logger.warning(f"    [WARN] Regular click failed, trying JavaScript...")
                        self.driver.execute_script("arguments[0].click();", button)
                        logger.info(f"    [OK] JavaScript click succeeded")
                    
                    # Wait for like to register
                    time.sleep(1)
                    
                    comments_liked += 1
                    self.likes_performed += 1
                    
                    # CRITICAL: Take screenshot AFTER like to verify which comment was liked
                    try:
                        timestamp = datetime.now().strftime('%H%M%S')
                        screenshot_path = self.logs_dir / f"after_like_{i+1}_{timestamp}.png"
                        self.driver.save_screenshot(str(screenshot_path))
                        logger.info(f"    [SCREENSHOT] Saved: {screenshot_path.name}")
                    except Exception as screenshot_error:
                        logger.warning(f"    Failed to save screenshot: {screenshot_error}")
                    
                    logger.info(f"    [LIKE {i+1}/3] Success! Total session likes: {self.likes_performed}")
                    print(f"    [LIKE] Liked comment {i+1}/3")
                    
                    # Log to engagement_log
                    self._log_engagement_action(
                        'like_comment',
                        post_url,
                        instagram_username=post_author,
                        metadata={'comment_index': i+1}
                    )
                    
                    # Random delay between likes
                    delay = random.uniform(
                        self.settings.ig_action_delay_min,
                        self.settings.ig_action_delay_max
                    )
                    time.sleep(delay)
                
                except Exception as e:
                    logger.error(f"    [ERROR] Failed to like comment {i+1}: {e}")
                    self.errors_count += 1
            
            # Save to processed_posts
            try:
                conn = sqlite3.connect(str(self.db_path))
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO processed_posts 
                    (post_url, instagram_username, profile_id, comments_liked, status)
                    VALUES (?, ?, ?, ?, 'completed')
                """, (post_url, post_author, self.profile_id, comments_liked))
                
                conn.commit()
                conn.close()
                
                logger.info(f"  Post saved to database: {comments_liked} comments liked")
            
            except sqlite3.IntegrityError:
                logger.warning(f"  Post already in database (duplicate): {post_url}")
            except Exception as e:
                logger.error(f"  Error saving post to database: {e}")
            
            logger.info(f"  ✅ Successfully liked {comments_liked}/3 comments on post")
            return comments_liked > 0
        
        except Exception as e:
            logger.error(f"  [ERROR] Error processing post: {e}", exc_info=True)
            self.errors_count += 1
            
            # Log error
            self._log_engagement_action('error', post_url, success=False, error_message=str(e))
            
            # RECOVERY: Return to /explore if we got stuck
            try:
                logger.info(f"  [RECOVERY] Returning to /explore after error...")
                self.driver.get("https://www.instagram.com/explore/")
                time.sleep(3)
            except:
                logger.warning("  [RECOVERY] Failed to return to /explore")
            
            return False
    
    def _count_comments(self) -> int:
        """
        Count comments on current post (multiple detection methods)
        
        Returns:
            Number of comments found
        """
        try:
            # Method 1: Count comment-like SVG buttons (most reliable)
            try:
                all_svgs = self.driver.find_elements(By.CSS_SELECTOR, "svg")
                comment_like_buttons = []
                
                for svg in all_svgs:
                    aria_label = svg.get_attribute('aria-label') or ''
                    height = svg.get_attribute('height') or ''
                    
                    # Comment like buttons: aria-label contains "like"/"polub"/"lubi" and size is NOT 24x24
                    if any(word in aria_label.lower() for word in ['like', 'polub', 'lubi', 'heart', 'serce']):
                        if height != '24' and 'unlike' not in aria_label.lower():
                            comment_like_buttons.append(svg)
                
                if len(comment_like_buttons) > 0:
                    logger.info(f"  [METHOD 1] Found {len(comment_like_buttons)} comment like buttons")
                    return len(comment_like_buttons)
            except Exception as e:
                logger.debug(f"  Method 1 failed: {e}")
            
            # Method 2: Count UL > LI structure (fallback)
            try:
                ul_elements = self.driver.find_elements(By.CSS_SELECTOR, "ul")
                
                for ul in ul_elements:
                    li_children = ul.find_elements(By.CSS_SELECTOR, "li")
                    if len(li_children) >= 2:
                        logger.info(f"  [METHOD 2] Found {len(li_children)} LI elements in UL")
                        return len(li_children)
            except Exception as e:
                logger.debug(f"  Method 2 failed: {e}")
            
            # Method 3: Try to find comment-like text structure (last resort)
            try:
                # Look for elements that might contain comment text
                spans = self.driver.find_elements(By.CSS_SELECTOR, "span")
                comment_texts = [s for s in spans if s.text and len(s.text) > 5]
                
                if len(comment_texts) > 10:  # Post with many text elements likely has comments
                    estimated_comments = min(len(comment_texts) // 3, 10)
                    logger.info(f"  [METHOD 3] Estimated {estimated_comments} comments from text elements")
                    return estimated_comments
            except Exception as e:
                logger.debug(f"  Method 3 failed: {e}")
            
            logger.warning("  All comment detection methods failed, returning 0")
            return 0
        
        except Exception as e:
            logger.error(f"Error counting comments: {e}")
            return 0
    
    def _scroll_comments_container(self):
        """Scroll within comments container to load all comments"""
        try:
            logger.info("  Preparing to find comments (NO scrolling to avoid moving elements)...")
            # DON'T scroll at all - it moves elements and causes the first comment to be missed
            # Just wait a moment for any lazy-loaded content
            time.sleep(1)
        
        except Exception as e:
            logger.warning(f"Error in scroll preparation: {e}")
    
    def _find_comment_like_buttons(self) -> List:
        """
        Find like buttons for comments - SIMPLE AND ROBUST
        
        Strategy:
        - Find ALL like button SVGs on the page
        - Exclude the main post button (size 24x24)
        - Exclude already liked (red hearts)
        - Sort by Y-position 
        - Skip the first one IF it's too far above the rest (caption/header button)
        - Take the next 3
        
        Returns:
            List of clickable button elements (sorted top-to-bottom)
        """
        try:
            logger.info("  Searching for comment like buttons (simple approach)...")
            
            like_buttons = []
            
            # Find ALL SVGs with aria-label
            all_svgs = self.driver.find_elements(By.CSS_SELECTOR, "svg[aria-label]")
            logger.info(f"  Found {len(all_svgs)} SVGs with aria-label")
            
            for svg in all_svgs:
                try:
                    aria_label = svg.get_attribute('aria-label') or ''
                    height = svg.get_attribute('height') or ''
                    width = svg.get_attribute('width') or ''
                    
                    # Is this a like button?
                    if any(word in aria_label.lower() for word in ['like', 'polub', 'lubi', 'heart', 'serce']):
                        # CRITICAL: Skip the main post like button (24x24)
                        if height == '24' or width == '24':
                            logger.debug(f"    Skipping post button (24x24)")
                            continue
                        
                        # Skip already liked
                        if 'unlike' in aria_label.lower() or 'nie lubi' in aria_label.lower():
                            logger.debug(f"    Skipping already liked")
                            continue
                        
                        # Get clickable parent
                        button = None
                        try:
                            button = svg.find_element(By.XPATH, "./ancestor::*[@role='button'][1]")
                        except:
                            try:
                                parent = svg.find_element(By.XPATH, "./..")
                                if parent.tag_name in ['button', 'a', 'span', 'div']:
                                    button = parent
                            except:
                                pass
                        
                        if button and button not in like_buttons:
                            like_buttons.append(button)
                
                except Exception as e:
                    pass
            
            if not like_buttons:
                logger.warning("  No like buttons found at all")
                return []
            
            # Sort by Y-position
            logger.info(f"  Found {len(like_buttons)} potential comment like buttons")
            buttons_with_y = []
            
            for i, btn in enumerate(like_buttons):
                try:
                    y_pos = btn.location['y']
                    buttons_with_y.append((y_pos, btn))
                    logger.info(f"    Button #{i+1}: Y={y_pos}")
                except:
                    pass
            
            # Sort by Y position (top to bottom) - LOWEST Y = TOPMOST COMMENT
            buttons_with_y.sort(key=lambda x: x[0])
            
            # Log the Y-positions of first 5 buttons for debugging
            logger.info(f"  Button Y-positions (sorted): {[y for y, _ in buttons_with_y[:5]]}")
            
            # SIMPLE APPROACH: Take the first 3 buttons by Y-position (top 3 comments)
            # No outlier detection, no smart logic - just the literal top 3
            final_buttons = [btn for _, btn in buttons_with_y[:3]]
            logger.info(f"  Taking buttons #1, #2, #3 (lowest Y-positions = topmost comments)")
            
            logger.info(f"  Selected {len(final_buttons)} buttons for liking")
            return final_buttons
        
        except Exception as e:
            logger.error(f"  Error finding like buttons: {e}")
            return []
    
    def _log_engagement_action(self, action: str, target_url: Optional[str],
                               instagram_username: Optional[str] = None,
                               success: bool = True,
                               error_message: Optional[str] = None,
                               metadata: Optional[Dict] = None):
        """
        Log action to engagement_log table
        
        Args:
            action: 'like_comment', 'skip_post', 'error', etc.
            target_url: Instagram post URL
            instagram_username: Post author username
            success: True if action succeeded
            error_message: Error message if failed
            metadata: Additional data as dict (will be JSON serialized)
        """
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            
            metadata_json = json.dumps(metadata) if metadata else None
            
            cursor.execute("""
                INSERT INTO engagement_log 
                (profile_id, action, target_url, instagram_username,
                 success, error_message, metadata, session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                self.profile_id,
                action,
                target_url,
                instagram_username,
                1 if success else 0,
                error_message,
                metadata_json,
                self.session_id
            ))
            
            conn.commit()
            conn.close()
        
        except Exception as e:
            logger.error(f"Error logging engagement action: {e}")
    
    def cleanup(self):
        """Clean up resources (close browser, stop GoLogin)"""
        try:
            if self.driver:
                try:
                    self.driver.quit()
                    logger.info("Selenium driver closed")
                except:
                    pass
        except:
            pass
        
        try:
            if self.gologin_session:
                self.gologin_manager.cleanup_session(self.gologin_session)
                logger.info("GoLogin session stopped")
        except:
            pass
        
        print("[CLEANUP] Browser cleaned up\n")
