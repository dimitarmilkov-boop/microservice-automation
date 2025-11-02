"""
Instagram CSS/XPath Selectors
Defines all selectors for Instagram elements
"""

class InstagramSelectors:
    """Instagram web UI selectors (as of 2025)"""
    
    # ========================================
    # PROFILE PAGE SELECTORS
    # ========================================
    
    # Main posts grid on profile page
    POSTS_GRID = "article div a[href*='/p/']"
    
    # Individual post links
    POST_LINK = "a[href*='/p/']"
    
    # Profile username header
    PROFILE_USERNAME = "header h2"
    
    # ========================================
    # POST PAGE SELECTORS
    # ========================================
    
    # Comments section
    COMMENTS_SECTION = "ul[class*='_ab']"  # Instagram uses obfuscated classes
    
    # Individual comment containers
    COMMENT_ITEM = "li[role='menuitem']"
    
    # Comment like button (heart icon)
    # Instagram uses SVG for like buttons
    COMMENT_LIKE_BUTTON = "button[aria-label*='Like']"
    COMMENT_UNLIKE_BUTTON = "button[aria-label*='Unlike']"
    
    # Alternative: span containing the like button
    COMMENT_LIKE_SPAN = "span[aria-label*='Like']"
    
    # Comment text
    COMMENT_TEXT = "span[class*='_ap3a']"
    
    # ========================================
    # GENERAL NAVIGATION
    # ========================================
    
    # Instagram logo (for detecting page load)
    IG_LOGO = "svg[aria-label='Instagram']"
    
    # Login button (shouldn't appear if already logged in)
    LOGIN_BUTTON = "a[href*='/accounts/login']"
    
    # ========================================
    # XPath ALTERNATIVES (more reliable)
    # ========================================
    
    @staticmethod
    def xpath_comment_like_button(index: int = 1) -> str:
        """
        XPath to find like button for nth comment
        Args:
            index: 1-based index of comment (1 = first comment)
        """
        return f"(//li[@role='menuitem'])[{index}]//button[contains(@aria-label, 'Like') or contains(@aria-label, 'like')]"
    
    @staticmethod
    def xpath_all_comment_like_buttons() -> str:
        """XPath to find all comment like buttons on page"""
        return "//li[@role='menuitem']//button[contains(@aria-label, 'Like') or contains(@aria-label, 'like')]"
    
    @staticmethod
    def xpath_post_links() -> str:
        """XPath to find all post links on profile page"""
        return "//article//a[contains(@href, '/p/')]"
    
    @staticmethod
    def xpath_comment_by_index(index: int) -> str:
        """XPath to find nth comment container"""
        return f"(//li[@role='menuitem'])[{index}]"


# Singleton instance
SELECTORS = InstagramSelectors()


# ========================================
# HELPER FUNCTIONS
# ========================================

def is_logged_in_selector() -> str:
    """Selector to check if user is logged in (no login button visible)"""
    return "a[href*='/accounts/login']"

def wait_for_page_load_selector() -> str:
    """Selector to wait for Instagram page to finish loading"""
    return "svg[aria-label='Instagram']"

