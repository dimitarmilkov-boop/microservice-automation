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

from core.selectors import SELECTORS

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
            time.sleep(0.5)

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

    def find_follow_buttons(self, driver):
        """Find Follow buttons - <a> tags with text 'Follow' (as found on live Threads page)"""
        buttons = []
        
        # Method 1: Find <a> tags containing "Follow" text (most common on Threads)
        try:
            xpath = "//a[@role='link' and contains(., 'Follow')]"
            found = driver.find_elements(By.XPATH, xpath)
            print(f"[DEBUG] XPath <a role=link> with 'Follow': {len(found)}")
            buttons.extend(found)
        except Exception as e:
            print(f"[DEBUG] XPath method 1 failed: {e}")
        
        # Method 2: Any <a> tag with exact text "Follow" 
        try:
            xpath2 = "//a[normalize-space(.)='Follow']"
            found2 = driver.find_elements(By.XPATH, xpath2)
            print(f"[DEBUG] XPath <a> text='Follow': {len(found2)}")
            for el in found2:
                if el not in buttons:
                    buttons.append(el)
        except Exception as e:
            print(f"[DEBUG] XPath method 2 failed: {e}")
        
        # Method 3: div[role=button] with "Follow" (fallback for profile pages)
        try:
            xpath3 = "//div[@role='button' and contains(., 'Follow')]"
            found3 = driver.find_elements(By.XPATH, xpath3)
            print(f"[DEBUG] XPath div[role=button] with 'Follow': {len(found3)}")
            for el in found3:
                if el not in buttons:
                    buttons.append(el)
        except Exception as e:
            print(f"[DEBUG] XPath method 3 failed: {e}")
        
        print(f"[DEBUG] Total unique Follow buttons found: {len(buttons)}")
        return buttons

    def find_like_buttons(self, driver):
        """Find Like buttons (heart icons) - svg[aria-label=Like] with parent div[role=button]"""
        buttons = []
        
        # Method 1: Find SVG with aria-label="Like" and get parent div[role=button]
        try:
            svgs = driver.find_elements(By.CSS_SELECTOR, 'svg[aria-label="Like"]')
            print(f"[DEBUG] Found {len(svgs)} SVG with aria-label=Like")
            for svg in svgs:
                try:
                    # Get the parent div[role="button"]
                    parent = svg.find_element(By.XPATH, './ancestor::div[@role="button"][1]')
                    if parent not in buttons:
                        buttons.append(parent)
                except Exception as e:
                    print(f"[DEBUG] Could not find parent for SVG: {e}")
        except Exception as e:
            print(f"[DEBUG] Like SVG method failed: {e}")
        
        print(f"[DEBUG] Total unique Like buttons (clickable parents) found: {len(buttons)}")
        return buttons

    def extract_username(self, user_element_context):
        """Extract username from post context"""
        try:
            username_link = user_element_context.find_element(By.XPATH, './/ancestor::article//a[starts-with(@href, "/@")]')
            href = username_link.get_attribute('href')
            username = href.split('/@')[-1].split('/')[0]
            return username
        except:
            return "unknown"
