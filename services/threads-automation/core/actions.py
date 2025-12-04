"""
Browser Actions for Threads Automation
Implements high-level actions using Selenium.
"""
import time
import random
import logging
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, ElementClickInterceptedException

from .selectors import SELECTORS

logger = logging.getLogger(__name__)

class ThreadsActions:
    def __init__(self, driver):
        self.driver = driver

    def random_delay(self, min_sec=2, max_sec=5):
        """Human-like random delay"""
        delay = random.uniform(min_sec, max_sec)
        time.sleep(delay)

    def safe_click(self, element):
        """Scroll to element and click safely"""
        try:
            # 1. Scroll into view
            self.driver.execute_script(
                "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", 
                element
            )
            time.sleep(0.5) # Wait for scroll
            
            # 2. Check visibility
            if not element.is_displayed():
                logger.warning("Element not visible for click")
                return False
                
            # 3. Click
            element.click()
            return True
        except ElementClickInterceptedException:
            # Fallback: JS Click
            try:
                self.driver.execute_script("arguments[0].click();", element)
                return True
            except Exception as e:
                logger.error(f"JS Click failed: {e}")
                return False
        except Exception as e:
            logger.error(f"Safe click failed: {e}")
            return False

    def find_modal(self):
        """Find the active modal window"""
        for selector in SELECTORS["modal"]:
            try:
                modal = self.driver.find_element(By.CSS_SELECTOR, selector)
                if modal.is_displayed():
                    return modal
            except:
                continue
        return None

    def scroll_modal(self, modal_element):
        """Scroll inside a modal to load more content"""
        try:
            # Try finding a specific scrollable container inside
            for selector in SELECTORS["scrollable_container"]:
                try:
                    container = modal_element.find_element(By.CSS_SELECTOR, selector)
                    self.driver.execute_script(
                        "arguments[0].scrollTop = arguments[0].scrollHeight", 
                        container
                    )
                    return True
                except:
                    continue
            
            # Fallback: Scroll the modal itself
            self.driver.execute_script(
                "arguments[0].scrollTop = arguments[0].scrollHeight", 
                modal_element
            )
            return True
        except Exception as e:
            logger.warning(f"Failed to scroll modal: {e}")
            return False

    def find_follow_buttons(self, container):
        """Find all 'Follow' buttons within a container (modal or page)"""
        buttons = []
        
        # Strategy 1: Button tags with specific text
        for text in SELECTORS["follow_button_text"]:
            try:
                # XPath to find button with text (case insensitive approx)
                xpath = f".//button[contains(text(), '{text}')] | .//div[@role='button'][contains(text(), '{text}')]"
                found = container.find_elements(By.XPATH, xpath)
                buttons.extend(found)
            except:
                pass
                
        return buttons

    def extract_username(self, user_element_context):
        """Extract username relative to a button/row"""
        try:
            # Try finding the username span or link
            # This is heuristic and depends on DOM structure relative to the button
            # Usually we look up to a row container, then down to a username
            
            # 1. Go up to finding the row (Li or Div)
            row = user_element_context.find_element(By.XPATH, "./ancestor::div[@role='button'] | ./ancestor::li")
            
            # 2. Find text starting with @ or inside bold span
            text_elements = row.find_elements(By.CSS_SELECTOR, 'span, a')
            for el in text_elements:
                text = el.text.strip()
                if len(text) > 2 and not "Follow" in text and not " " in text:
                    return text
        except:
            return "unknown"
        return "unknown"




