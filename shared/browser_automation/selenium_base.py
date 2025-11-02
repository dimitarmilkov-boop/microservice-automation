"""
Selenium Base Utilities

Common Selenium operations and helper functions for browser automation.
"""

import time
import logging
import os
from typing import Optional, List, Tuple
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    StaleElementReferenceException,
    WebDriverException
)


class SeleniumBase:
    """Base class providing common Selenium utilities."""
    
    def __init__(self, driver: webdriver.Chrome, logger: Optional[logging.Logger] = None):
        """
        Initialize Selenium utilities.
        
        Args:
            driver: Selenium WebDriver instance
            logger: Logger instance (creates one if not provided)
        """
        self.driver = driver
        self.logger = logger or logging.getLogger(self.__class__.__name__)
    
    # ============================================================================
    # WAIT HELPERS
    # ============================================================================
    
    def wait_for_element(
        self, 
        selector: str, 
        by: By = By.CSS_SELECTOR, 
        timeout: int = 10,
        visible: bool = True
    ) -> Optional[webdriver.remote.webelement.WebElement]:
        """
        Wait for element to be present (and optionally visible).
        
        Args:
            selector: Element selector
            by: Selenium By locator type
            timeout: Maximum wait time in seconds
            visible: Wait for visibility (True) or just presence (False)
            
        Returns:
            WebElement if found, None otherwise
        """
        try:
            if visible:
                element = WebDriverWait(self.driver, timeout).until(
                    EC.visibility_of_element_located((by, selector))
                )
            else:
                element = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_element_located((by, selector))
                )
            return element
        
        except TimeoutException:
            self.logger.warning(f"Element not found: {selector} (timeout: {timeout}s)")
            return None
    
    def wait_for_elements(
        self, 
        selector: str, 
        by: By = By.CSS_SELECTOR, 
        timeout: int = 10
    ) -> List[webdriver.remote.webelement.WebElement]:
        """
        Wait for multiple elements to be present.
        
        Args:
            selector: Element selector
            by: Selenium By locator type
            timeout: Maximum wait time in seconds
            
        Returns:
            List of WebElements (empty list if none found)
        """
        try:
            elements = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_all_elements_located((by, selector))
            )
            return elements
        
        except TimeoutException:
            self.logger.warning(f"Elements not found: {selector}")
            return []
    
    def wait_for_clickable(
        self, 
        selector: str, 
        by: By = By.CSS_SELECTOR, 
        timeout: int = 10
    ) -> Optional[webdriver.remote.webelement.WebElement]:
        """
        Wait for element to be clickable.
        
        Args:
            selector: Element selector
            by: Selenium By locator type
            timeout: Maximum wait time in seconds
            
        Returns:
            WebElement if found and clickable, None otherwise
        """
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((by, selector))
            )
            return element
        
        except TimeoutException:
            self.logger.warning(f"Element not clickable: {selector}")
            return None
    
    def wait_for_url_contains(self, text: str, timeout: int = 10) -> bool:
        """
        Wait for URL to contain specific text.
        
        Args:
            text: Text to search for in URL
            timeout: Maximum wait time in seconds
            
        Returns:
            True if URL contains text within timeout, False otherwise
        """
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.url_contains(text)
            )
            return True
        
        except TimeoutException:
            self.logger.warning(f"URL does not contain: {text}")
            return False
    
    # ============================================================================
    # INTERACTION HELPERS
    # ============================================================================
    
    def safe_click(
        self, 
        selector: str, 
        by: By = By.CSS_SELECTOR, 
        timeout: int = 10,
        retry: int = 3
    ) -> bool:
        """
        Safely click an element with retries.
        
        Args:
            selector: Element selector
            by: Selenium By locator type
            timeout: Wait timeout
            retry: Number of retry attempts
            
        Returns:
            True if click succeeded, False otherwise
        """
        for attempt in range(retry):
            try:
                element = self.wait_for_clickable(selector, by, timeout)
                if element:
                    element.click()
                    self.logger.debug(f"Clicked: {selector}")
                    return True
            
            except StaleElementReferenceException:
                self.logger.warning(f"Stale element, retrying... ({attempt + 1}/{retry})")
                time.sleep(1)
            
            except Exception as e:
                self.logger.warning(f"Click failed: {e}")
        
        return False
    
    def safe_type(
        self, 
        selector: str, 
        text: str,
        by: By = By.CSS_SELECTOR, 
        timeout: int = 10,
        clear_first: bool = True,
        press_enter: bool = False
    ) -> bool:
        """
        Safely type text into an element.
        
        Args:
            selector: Element selector
            text: Text to type
            by: Selenium By locator type
            timeout: Wait timeout
            clear_first: Clear existing text before typing
            press_enter: Press Enter after typing
            
        Returns:
            True if typing succeeded, False otherwise
        """
        try:
            element = self.wait_for_element(selector, by, timeout)
            if not element:
                return False
            
            if clear_first:
                element.clear()
            
            element.send_keys(text)
            
            if press_enter:
                element.send_keys(Keys.RETURN)
            
            self.logger.debug(f"Typed into: {selector}")
            return True
        
        except Exception as e:
            self.logger.error(f"Failed to type into {selector}: {e}")
            return False
    
    def scroll_to_element(self, element: webdriver.remote.webelement.WebElement):
        """
        Scroll element into view.
        
        Args:
            element: WebElement to scroll to
        """
        try:
            self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
            time.sleep(0.5)  # Wait for scroll to complete
        except Exception as e:
            self.logger.warning(f"Failed to scroll to element: {e}")
    
    def scroll_page(self, amount: int = 300):
        """
        Scroll page by specific amount.
        
        Args:
            amount: Pixels to scroll (positive = down, negative = up)
        """
        try:
            self.driver.execute_script(f"window.scrollBy(0, {amount});")
            time.sleep(0.5)
        except Exception as e:
            self.logger.warning(f"Failed to scroll page: {e}")
    
    # ============================================================================
    # UTILITY METHODS
    # ============================================================================
    
    def get_text(
        self, 
        selector: str, 
        by: By = By.CSS_SELECTOR, 
        timeout: int = 5
    ) -> Optional[str]:
        """
        Get text content of an element.
        
        Args:
            selector: Element selector
            by: Selenium By locator type
            timeout: Wait timeout
            
        Returns:
            Element text or None if not found
        """
        element = self.wait_for_element(selector, by, timeout, visible=False)
        if element:
            return element.text
        return None
    
    def get_attribute(
        self, 
        selector: str, 
        attribute: str,
        by: By = By.CSS_SELECTOR, 
        timeout: int = 5
    ) -> Optional[str]:
        """
        Get attribute value of an element.
        
        Args:
            selector: Element selector
            attribute: Attribute name
            by: Selenium By locator type
            timeout: Wait timeout
            
        Returns:
            Attribute value or None if not found
        """
        element = self.wait_for_element(selector, by, timeout, visible=False)
        if element:
            return element.get_attribute(attribute)
        return None
    
    def is_element_visible(
        self, 
        selector: str, 
        by: By = By.CSS_SELECTOR
    ) -> bool:
        """
        Check if element is visible on page.
        
        Args:
            selector: Element selector
            by: Selenium By locator type
            
        Returns:
            True if element is visible, False otherwise
        """
        try:
            element = self.driver.find_element(by, selector)
            return element.is_displayed()
        except (NoSuchElementException, StaleElementReferenceException):
            return False
    
    def take_screenshot(self, filename: str, directory: str = "logs/screenshots") -> bool:
        """
        Take a screenshot and save to file.
        
        Args:
            filename: Screenshot filename
            directory: Directory to save screenshot
            
        Returns:
            True if screenshot saved successfully, False otherwise
        """
        try:
            os.makedirs(directory, exist_ok=True)
            filepath = os.path.join(directory, filename)
            self.driver.save_screenshot(filepath)
            self.logger.info(f"Screenshot saved: {filepath}")
            return True
        
        except Exception as e:
            self.logger.error(f"Failed to save screenshot: {e}")
            return False
    
    def wait_random(self, min_seconds: float = 2.0, max_seconds: float = 5.0):
        """
        Wait for a random duration (human-like behavior).
        
        Args:
            min_seconds: Minimum wait time
            max_seconds: Maximum wait time
        """
        import random
        wait_time = random.uniform(min_seconds, max_seconds)
        self.logger.debug(f"Random wait: {wait_time:.2f}s")
        time.sleep(wait_time)
    
    def get_current_url(self) -> str:
        """Get current page URL."""
        try:
            return self.driver.current_url
        except WebDriverException:
            return ""
    
    def get_page_title(self) -> str:
        """Get current page title."""
        try:
            return self.driver.title
        except WebDriverException:
            return ""

