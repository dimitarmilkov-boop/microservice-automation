#!/usr/bin/env python3
"""
Instagram Explore Comment Liker - Test Script

Complete standalone test following Viktor's exact requirements:
- Navigate to /explore feed
- Pick random posts
- Like FIRST 3 COMMENTS only (not posts)
- Check database to avoid re-processing
- Detailed logging for manual verification

Usage:
    python test_explore_liker.py
"""

import os
import sys
import time
import json
import random
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional

# Add project root to path
project_root = Path(__file__).parent.parent.parent.resolve()
service_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(project_root))
sys.path.insert(0, str(service_dir))

# Load environment variables manually (BOM-safe)
env_path = project_root / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()

# Selenium imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Local imports
from config import get_settings
from database import DatabaseManager
from shared.browser_automation import GoLoginManager, BrowserProfileManager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class InstagramExploreTester:
    """Test script for Instagram explore comment liking"""
    
    def __init__(self):
        """Initialize tester"""
        self.settings = get_settings()
        self.db = DatabaseManager(self.settings.get_database_path())
        self.profile_manager = BrowserProfileManager()
        self.gologin_manager = GoLoginManager()  # Initialize GoLogin manager
        
        self.driver = None
        self.gologin_session = None
        self.session_id = str(uuid.uuid4())
        self.profile_name = None
        self.profile_id = None
        
        # Session data for logging
        self.session_data = {
            "session_id": self.session_id,
            "profile_name": None,
            "started_at": datetime.now().isoformat(),
            "ended_at": None,
            "posts": []
        }
        
        # Create logs directory
        self.logs_dir = service_dir / 'logs'
        self.logs_dir.mkdir(exist_ok=True)
        
        logger.info("=" * 80)
        logger.info("Instagram Explore Comment Liker - TEST MODE")
        logger.info("=" * 80)
    
    def run(self):
        """Main test execution"""
        try:
            # Step 1: Select profile
            logger.info("\n[STEP 1] Selecting GoLogin profile...")
            self.select_profile()
            
            # Step 2: Launch GoLogin
            logger.info("\n[STEP 2] Launching GoLogin profile...")
            self.launch_gologin()
            
            # Step 3: Connect Selenium
            logger.info("\n[STEP 3] Connecting Selenium...")
            self.connect_selenium()
            
            # Step 4: Verify Instagram login
            logger.info("\n[STEP 4] Verifying Instagram login...")
            if not self.verify_instagram_login():
                raise Exception("Not logged into Instagram!")
            
            # Step 5: Navigate to explore
            logger.info("\n[STEP 5] Navigating to /explore...")
            self.navigate_to_explore()
            
            # Step 6: Process one post
            logger.info("\n[STEP 6] Processing one random post...")
            self.process_one_post()
            
            # Step 7: Save logs
            logger.info("\n[STEP 7] Saving logs...")
            self.save_logs()
            
            # Step 8: Manual verification
            logger.info("\n" + "=" * 80)
            logger.info("TEST COMPLETE!")
            logger.info("=" * 80)
            logger.info("\nPlease manually verify:")
            logger.info("1. Check log files in: " + str(self.logs_dir))
            logger.info("2. Open post URLs from logs")
            logger.info("3. Find comments by author names")
            logger.info("4. Confirm your likes appear")
            logger.info("\nBrowser will stay open. Press Enter to close...")
            try:
                input()
            except EOFError:
                logger.info("Running in non-interactive mode, waiting 10s before cleanup...")
                time.sleep(10)
            
            return True
        
        except Exception as e:
            logger.error(f"\nTest failed: {e}", exc_info=True)
            logger.info("\nBrowser will stay open for inspection. Press Enter to close...")
            try:
                input()
            except EOFError:
                logger.info("Running in non-interactive mode, waiting 10s before cleanup...")
                time.sleep(10)
            return False
        
        finally:
            self.cleanup()
    
    def select_profile(self):
        """Select first profile for testing"""
        profile_names = self.settings.profile_names
        if not profile_names:
            raise Exception("No profiles configured in GOLOGIN_IG_PROFILES")
        
        self.profile_name = profile_names[0]  # Use first profile
        self.session_data["profile_name"] = self.profile_name
        
        logger.info(f"Selected profile: {self.profile_name}")
        
        # Get profile ID
        self.profile_id = self.profile_manager.get_profile_id_by_name(self.profile_name)
        if not self.profile_id:
            raise Exception(f"Profile '{self.profile_name}' not found in GoLogin")
        
        logger.info(f"Profile ID: {self.profile_id}")
    
    def launch_gologin(self):
        """Launch GoLogin profile"""
        logger.info("Starting GoLogin session...")
        self.gologin_session = self.gologin_manager.start_session(self.profile_id)
        
        if not self.gologin_session:
            raise Exception("Failed to start GoLogin session")
        
        logger.info(f"GoLogin started: {self.gologin_session['debugger_address']}")
    
    def connect_selenium(self):
        """Connect Selenium to GoLogin browser"""
        # Driver is already in the gologin_session from start_session()
        self.driver = self.gologin_session['driver']
        logger.info("Selenium connected")
    
    def verify_instagram_login(self) -> bool:
        """Verify logged into Instagram"""
        self.driver.get("https://www.instagram.com/")
        time.sleep(3)
        
        # Check for login button (if present = not logged in)
        try:
            self.driver.find_element(By.CSS_SELECTOR, "a[href*='/accounts/login']")
            logger.error("Login button found - NOT logged into Instagram")
            return False
        except NoSuchElementException:
            logger.info("Instagram login verified ✓")
            return True
    
    def navigate_to_explore(self):
        """Navigate to Instagram explore page"""
        self.driver.get("https://www.instagram.com/explore/")
        time.sleep(3)
        
        # Enhanced logging - see what we got
        logger.info(f"Page Title: {self.driver.title}")
        logger.info(f"Current URL: {self.driver.current_url}")
        
        # Handle cookie popup if present
        self._handle_cookie_popup()
        
        logger.info("Loaded /explore page")
    
    def process_one_post(self):
        """Process one random post from explore"""
        # Find posts in explore feed
        post_urls = self.find_explore_posts()
        if not post_urls:
            raise Exception("No posts found in explore feed")
        
        logger.info(f"Found {len(post_urls)} posts in explore feed")
        
        # Try up to 5 posts (in case some are already processed)
        for attempt in range(5):
            post_url = random.choice(post_urls)
            
            # CHECK DATABASE - Viktor's requirement
            if self.db.is_post_processed(post_url):
                logger.info(f"Post already processed, skipping: {post_url}")
                continue
            
            # Process this post
            logger.info(f"\nProcessing post: {post_url}")
            success = self.like_post_comments(post_url)
            
            if success:
                return
        
        raise Exception("Could not find unprocessed post after 5 attempts")
    
    def _handle_cookie_popup(self):
        """Handle Instagram cookie consent popup"""
        try:
            # Common cookie popup button texts (multilingual)
            button_texts = [
                "Allow all cookies",
                "Allow essential and optional cookies",
                "Zezwól na wszystkie pliki cookie",  # Polish
                "Accept all",
                "Accept"
            ]
            
            # Try to find and click cookie accept button
            for button_text in button_texts:
                try:
                    button = self.driver.find_element(By.XPATH, f"//button[contains(text(), '{button_text}')]")
                    button.click()
                    logger.info(f"Dismissed cookie popup (button: '{button_text}')")
                    time.sleep(2)
                    return
                except NoSuchElementException:
                    continue
            
            # Alternative: look for any button in a dialog
            try:
                buttons = self.driver.find_elements(By.CSS_SELECTOR, "button")
                for button in buttons:
                    button_text = button.text.lower()
                    if any(word in button_text for word in ['allow', 'accept', 'zezwól', 'cookie']):
                        button.click()
                        logger.info(f"Dismissed cookie popup (found button with: '{button.text}')")
                        time.sleep(2)
                        return
            except:
                pass
            
            logger.debug("No cookie popup found or already dismissed")
        
        except Exception as e:
            logger.warning(f"Error handling cookie popup: {e}")
    
    def find_explore_posts(self) -> List[str]:
        """Find post URLs in explore feed with enhanced logging"""
        try:
            logger.info("Searching for posts in explore feed...")
            
            # Enhanced logging - take screenshot
            screenshot_path = self.logs_dir / f"explore_page_{datetime.now().strftime('%H%M%S')}.png"
            self.driver.save_screenshot(str(screenshot_path))
            logger.info(f"Screenshot saved: {screenshot_path}")
            
            # Log what elements are visible
            logger.info("Looking for selector: a[href*='/p/']")
            
            # Wait for posts to load
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "a[href*='/p/']")))
            
            # Find all post links (Instagram explore doesn't use <article> tags)
            post_elements = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/p/']")
            logger.info(f"Found {len(post_elements)} post elements")
            
            # Extract URLs
            post_urls = []
            for elem in post_elements[:20]:  # Get first 20 posts
                href = elem.get_attribute('href')
                if href and '/p/' in href:
                    post_urls.append(href)
            
            logger.info(f"Extracted {len(post_urls)} unique post URLs")
            if post_urls:
                logger.info(f"Sample URLs: {post_urls[:3]}")
            
            return list(set(post_urls))  # Remove duplicates
        
        except TimeoutException:
            logger.error("Timeout waiting for posts to load")
            self._dump_page_debug_info()
            return []
        
        except Exception as e:
            logger.error(f"Error finding posts: {e}")
            self._dump_page_debug_info()
            return []
    
    def _dump_page_debug_info(self):
        """Dump page information for debugging"""
        try:
            logger.info("=== PAGE DEBUG INFO ===")
            logger.info(f"Title: {self.driver.title}")
            logger.info(f"URL: {self.driver.current_url}")
            
            # Save screenshot
            screenshot_path = self.logs_dir / f"error_{datetime.now().strftime('%H%M%S')}.png"
            self.driver.save_screenshot(str(screenshot_path))
            logger.info(f"Error screenshot: {screenshot_path}")
            
            # Save page source
            html_path = self.logs_dir / f"page_source_{datetime.now().strftime('%H%M%S')}.html"
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(self.driver.page_source)
            logger.info(f"Page source saved: {html_path}")
            
            # Log visible elements
            articles = self.driver.find_elements(By.CSS_SELECTOR, "article")
            logger.info(f"Found {len(articles)} <article> elements")
            
            links = self.driver.find_elements(By.CSS_SELECTOR, "a")
            logger.info(f"Found {len(links)} total <a> elements")
            
            post_links = [a.get_attribute('href') for a in links if a.get_attribute('href') and '/p/' in a.get_attribute('href')]
            logger.info(f"Found {len(post_links)} links with '/p/' in href")
            
            logger.info("=== END DEBUG INFO ===")
        
        except Exception as e:
            logger.error(f"Error dumping debug info: {e}")
    
    def like_post_comments(self, post_url: str) -> bool:
        """
        Open post and like top 3 comments
        
        CRITICAL: Like COMMENTS only, not the post itself
        Viktor: "just focus on the first three"
        """
        post_data = {
            "url": post_url,
            "author": None,
            "opened_at": datetime.now().isoformat(),
            "comments": []
        }
        
        try:
            # Open post
            self.driver.get(post_url)
            time.sleep(3)
            
            # Get post author
            try:
                author_elem = self.driver.find_element(By.CSS_SELECTOR, "header a")
                post_author = author_elem.text
                post_data["author"] = post_author
                logger.info(f"Post by: @{post_author}")
            except:
                post_data["author"] = "unknown"
            
            # CRITICAL: Check if post has at least 3 comments (structure-based, not class-based)
            try:
                # Find all UL elements and count LI children
                ul_elements = self.driver.find_elements(By.CSS_SELECTOR, "ul")
                comment_count = 0
                
                for ul in ul_elements:
                    li_children = ul.find_elements(By.CSS_SELECTOR, "li")
                    if len(li_children) >= 2:  # This is likely the comments list
                        comment_count = len(li_children)
                        logger.info(f"Found {comment_count} comments on this post")
                        break
                
                if comment_count < 3:
                    logger.warning(f"Post has only {comment_count} comments, need at least 3. Skipping...")
                    return False
            except Exception as e:
                logger.warning(f"Could not count comments: {e}, trying anyway...")
            
            # Scroll comments container to load all comments
            self._scroll_comments_container()
            
            # Find comment like buttons
            comment_buttons = self.find_comment_like_buttons()
            
            if not comment_buttons:
                logger.warning("No comment like buttons found")
                return False
            
            # Like first 3 comments (Viktor's requirement)
            num_to_like = min(3, len(comment_buttons))
            logger.info(f"Found {len(comment_buttons)} comments, will like {num_to_like}")
            
            comments_liked = 0
            for i in range(num_to_like):
                try:
                    button = comment_buttons[i]
                    
                    # Extract comment details BEFORE clicking
                    comment_info = self.extract_comment_details(button, i)
                    
                    # Check if already liked by finding SVG inside button
                    try:
                        svg = button.find_element(By.CSS_SELECTOR, "svg")
                        svg_aria = svg.get_attribute('aria-label') or ''
                        if 'unlike' in svg_aria.lower() or 'nie lubi' in svg_aria.lower():
                            logger.info(f"  Comment {i+1} already liked (aria-label: '{svg_aria}'), skipping")
                            comment_info['clicked'] = False
                            comment_info['skip_reason'] = 'already_liked'
                            post_data["comments"].append(comment_info)
                            continue
                    except:
                        pass
                    
                    # Click like button - use JavaScript click for reliability
                    try:
                        # Scroll element into view first
                        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
                        time.sleep(0.5)
                        
                        # Try regular click first
                        button.click()
                        logger.info(f"  Clicked via regular click method")
                    except:
                        # Fallback to JavaScript click
                        logger.info(f"  Regular click failed, trying JavaScript click")
                        self.driver.execute_script("arguments[0].click();", button)
                    
                    comments_liked += 1
                    comment_info['clicked'] = True
                    
                    # Wait a moment to let the like register
                    time.sleep(1)
                    
                    logger.info(f"  ✓ Liked comment {i+1}/3 by @{comment_info['author']}: \"{comment_info['text'][:50]}...\" ({comment_info['likes_before']} likes)")
                    
                    post_data["comments"].append(comment_info)
                    
                    # Random delay (Viktor's requirement)
                    delay = random.uniform(
                        self.settings.ig_action_delay_min,
                        self.settings.ig_action_delay_max
                    )
                    time.sleep(delay)
                
                except Exception as e:
                    logger.error(f"  Failed to like comment {i+1}: {e}")
            
            # Save to database
            self.db.add_processed_post(
                post_url=post_url,
                instagram_username=post_data["author"],
                profile_id=self.profile_id,
                comments_liked=comments_liked,
                status='completed'
            )
            
            # Add to session data
            self.session_data["posts"].append(post_data)
            
            logger.info(f"\nSuccessfully liked {comments_liked} comments")
            return comments_liked > 0
        
        except Exception as e:
            logger.error(f"Error processing post: {e}", exc_info=True)
            return False
    
    def _scroll_comments_container(self):
        """Scroll within the comments container to load all comments (no class name dependencies)"""
        try:
            logger.info("Scrolling comments container to load all comments...")
            
            # Strategy: Find UL elements that contain comment LI elements (structure-based, not class-based)
            try:
                # Find all UL elements
                ul_elements = self.driver.find_elements(By.CSS_SELECTOR, "ul")
                
                # Find the UL that contains multiple LI elements (likely comments list)
                for ul in ul_elements:
                    li_children = ul.find_elements(By.CSS_SELECTOR, "li")
                    if len(li_children) >= 2:  # Has multiple items, likely comments
                        logger.info(f"Found comments UL with {len(li_children)} LI elements")
                        
                        # Scroll this UL element
                        self.driver.execute_script("""
                            arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});
                            arguments[0].scrollTop = arguments[0].scrollHeight;
                        """, ul)
                        
                        logger.info("Scrolled comments container")
                        time.sleep(2)
                        return True
                        
            except Exception as e:
                logger.warning(f"Could not find comments UL: {e}")
            
            # Fallback: try to find and scroll any scrollable container
            try:
                self.driver.execute_script("""
                    // Find scrollable container (comments section on right side)
                    let containers = document.querySelectorAll('article, section, div[role="dialog"]');
                    for (let container of containers) {
                        if (container.scrollHeight > container.clientHeight) {
                            container.scrollTop = container.scrollHeight;  // Scroll to bottom
                            break;
                        }
                    }
                """)
                logger.info("Scrolled using fallback method")
                time.sleep(2)
                return True
            except:
                logger.warning("Could not scroll comments container")
                return False
            
        except Exception as e:
            logger.warning(f"Error scrolling comments: {e}")
            return False
    
    def find_comment_like_buttons(self) -> List:
        """
        Find like buttons for comments (structure-based, no class dependencies)
        
        CRITICAL: Find COMMENT like buttons ONLY (inside LI elements), NOT the post like button
        """
        try:
            logger.info("Searching for comment like buttons...")
            
            # Take screenshot for debugging
            screenshot_path = self.logs_dir / f"post_page_{datetime.now().strftime('%H%M%S')}.png"
            self.driver.save_screenshot(str(screenshot_path))
            logger.info(f"Post page screenshot: {screenshot_path}")
            
            like_buttons = []
            
            # Find all UL elements
            ul_elements = self.driver.find_elements(By.CSS_SELECTOR, "ul")
            logger.info(f"Found {len(ul_elements)} <ul> elements")
            
            # Find the comments UL (has multiple LI children)
            comments_ul = None
            for ul in ul_elements:
                li_children = ul.find_elements(By.CSS_SELECTOR, "li")
                if len(li_children) >= 3:  # Must have at least 3 comments
                    comments_ul = ul
                    logger.info(f"Found comments UL with {len(li_children)} LI elements")
                    break
            
            if not comments_ul:
                logger.warning("Could not find comments UL with >= 3 LI elements")
                return []
            
            # Get first 3 LI elements (comments) - just for counting
            comment_lis = comments_ul.find_elements(By.CSS_SELECTOR, "li")[:3]
            logger.info(f"Processing first 3 comments...")
            
            # Strategy: Find ALL SVGs with "Lubię to!" on the page, get their clickable parents
            all_svgs = self.driver.find_elements(By.CSS_SELECTOR, "svg")
            logger.info(f"Found {len(all_svgs)} total SVG elements on page")
            
            # Find like button SVGs
            for svg in all_svgs:
                if len(like_buttons) >= 3:  # Only need 3
                    break
                
                try:
                    aria_label = svg.get_attribute('aria-label') or ''
                    height = svg.get_attribute('height') or ''
                    width = svg.get_attribute('width') or ''
                    
                    # Check if this is a like button SVG
                    # "Lubię to!" = Like (Polish), "Unlike" = Already liked
                    if any(word in aria_label.lower() for word in ['like', 'polub', 'lubi', 'heart', 'serce']):
                        # Skip post like button (24x24)
                        if height == '24' or width == '24':
                            logger.info(f"  Skipping post like button (24x24, aria-label: '{aria_label}')")
                            continue
                        
                        # CRITICAL: Skip if already liked (aria-label contains "unlike" or "nie lubię")
                        if 'unlike' in aria_label.lower() or 'nie lubi' in aria_label.lower():
                            logger.info(f"  Skipping already-liked comment (aria-label: '{aria_label}')")
                            continue
                        
                        # Get the clickable parent (div with role="button")
                        try:
                            # Try to find ancestor with role="button" 
                            parent = svg.find_element(By.XPATH, "./ancestor::*[@role='button'][1]")
                            if parent and parent not in like_buttons:
                                like_buttons.append(parent)
                                logger.info(f"  ✓ Found comment like button #{len(like_buttons)} (aria-label: '{aria_label}', size: {width}x{height})")
                        except:
                            # Try direct parent as fallback
                            try:
                                parent = svg.find_element(By.XPATH, "./..")
                                # Make sure parent is clickable
                                if parent.tag_name in ['button', 'a', 'span', 'div']:
                                    if parent not in like_buttons:
                                        like_buttons.append(parent)
                                        logger.info(f"  ✓ Found comment like button #{len(like_buttons)} via direct parent (aria-label: '{aria_label}', size: {width}x{height})")
                            except:
                                pass
                
                except Exception as e:
                    pass
            
            logger.info(f"Total comment like buttons found: {len(like_buttons)}")
            
            # Filter out post like button (24x24) - only keep smaller ones
            filtered_buttons = []
            for btn in like_buttons:
                try:
                    svg = btn.find_element(By.CSS_SELECTOR, "svg")
                    height = svg.get_attribute('height') or ''
                    width = svg.get_attribute('width') or ''
                    
                    # Skip post like button (24x24), keep comment like buttons (12x12, 16x16)
                    if height == '24' or width == '24':
                        logger.info(f"  Skipping post like button (24x24)")
                        continue
                    
                    filtered_buttons.append(btn)
                except:
                    # If can't check size, include it
                    filtered_buttons.append(btn)
            
            logger.info(f"After filtering: {len(filtered_buttons)} comment like buttons")
            return filtered_buttons
        
        except Exception as e:
            logger.error(f"Error finding comment buttons: {e}")
            return []
    
    def extract_comment_details(self, button, index: int) -> Dict:
        """Extract comment details for logging"""
        comment_info = {
            "author": "unknown",
            "text": "",
            "likes_before": 0,
            "clicked": False,
            "timestamp": datetime.now().isoformat(),
            "index": index + 1
        }
        
        try:
            # Find parent comment container
            comment_container = button.find_element(By.XPATH, "./ancestor::li[@role='menuitem']")
            
            # Extract comment author
            try:
                author_elem = comment_container.find_element(By.CSS_SELECTOR, "a")
                comment_info["author"] = author_elem.text or "unknown"
            except:
                pass
            
            # Extract comment text
            try:
                text_elem = comment_container.find_element(By.CSS_SELECTOR, "span")
                full_text = text_elem.text or ""
                comment_info["text"] = full_text[:100]  # First 100 chars
            except:
                pass
            
            # Extract likes count (if visible)
            try:
                # Look for likes count near the button
                likes_elem = comment_container.find_element(By.XPATH, ".//span[contains(text(), 'like')]")
                likes_text = likes_elem.text
                # Extract number from text like "42 likes" or "1 like"
                import re
                numbers = re.findall(r'\d+', likes_text)
                if numbers:
                    comment_info["likes_before"] = int(numbers[0])
            except:
                pass  # Likes count not always visible
        
        except Exception as e:
            logger.warning(f"Could not extract all comment details: {e}")
        
        return comment_info
    
    def save_logs(self):
        """Save detailed logs (JSON + text)"""
        self.session_data["ended_at"] = datetime.now().isoformat()
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save JSON log
        json_path = self.logs_dir / f"explore_{self.profile_name}_{timestamp}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self.session_data, f, indent=2)
        
        logger.info(f"JSON log saved: {json_path}")
        
        # Save text log
        text_path = self.logs_dir / f"explore_{self.profile_name}_{timestamp}.txt"
        with open(text_path, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("Instagram Explore Test Session\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Profile: {self.session_data['profile_name']}\n")
            f.write(f"Started: {self.session_data['started_at']}\n")
            f.write(f"Ended: {self.session_data['ended_at']}\n\n")
            
            for post in self.session_data['posts']:
                f.write(f"Post: {post['url']}\n")
                f.write(f"Author: @{post['author']}\n")
                f.write(f"Opened: {post['opened_at']}\n")
                f.write(f"Comments: {len(post['comments'])}\n\n")
                
                for comment in post['comments']:
                    status = "✓" if comment['clicked'] else "✗"
                    f.write(f"  {status} Comment by @{comment['author']}\n")
                    f.write(f"     Text: \"{comment['text']}\"\n")
                    f.write(f"     Likes before: {comment['likes_before']}\n")
                    f.write(f"     Clicked: {comment['clicked']}\n")
                    if 'skip_reason' in comment:
                        f.write(f"     Skip reason: {comment['skip_reason']}\n")
                    f.write("\n")
        
        logger.info(f"Text log saved: {text_path}")
    
    def cleanup(self):
        """Cleanup resources"""
        logger.info("\nCleaning up...")
        
        try:
            if self.gologin_session:
                self.gologin_manager.cleanup_session(self.gologin_session)
        except Exception as e:
            logger.error(f"Cleanup error: {e}")
        
        logger.info("Cleanup complete")


def main():
    """Main entry point"""
    tester = InstagramExploreTester()
    success = tester.run()
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

