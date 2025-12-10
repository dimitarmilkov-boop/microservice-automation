"""
Filtering Logic for Threads Automation
Ported from 'Follow un/content.js'
"""
import re

class ThreadsFilters:
    @staticmethod
    def detect_name_language(name: str) -> str:
        """
        Detect the script/language of a username or display name.
        Returns: 'cyrillic', 'latin', 'arabic', or 'other'
        """
        if not name:
            return 'empty'
            
        name = name.lower().strip()
        
        # Regex patterns from extension
        cyrillic_pattern = re.compile(r'[а-яё]')
        latin_pattern = re.compile(r'[a-z]')
        arabic_pattern = re.compile(r'[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]')
        
        if cyrillic_pattern.search(name):
            return 'cyrillic'
        if arabic_pattern.search(name):
            return 'arabic'
        if latin_pattern.search(name):
            return 'latin'
            
        return 'other'

    @staticmethod
    def has_avatar(element_html: str) -> bool:
        """
        Check if user has a custom avatar (not default/blank).
        Note: In Selenium, we pass the WebElement's outerHTML or inspect attributes directly.
        """
        # Common default avatar patterns in URLs
        default_patterns = [
            'instagram_default_profile',
            'anonymous_profile',
            'blank_profile'
        ]
        
        if not element_html:
            return False
            
        # Check if img src exists and doesn't match default patterns
        # This is a basic string check; more robust check happens in Selenium context
        has_img_tag = '<img' in element_html
        is_default = any(pat in element_html for pat in default_patterns)
        
        return has_img_tag and not is_default

    @staticmethod
    def filter_user(username: str, bio: str, settings: dict) -> bool:
        """
        Apply all user filters based on settings.
        """
        # 1. Language Check
        lang = ThreadsFilters.detect_name_language(username)
        allowed_langs = settings.get('filter_language', ['latin', 'cyrillic'])
        if lang not in allowed_langs:
            return False
            
        # 2. Keyword Filtering (Whitelist/Blacklist)
        bio_lower = (bio or "").lower()
        
        # Blacklist (higher priority)
        blacklist = settings.get('keywords_blacklist', [])
        for keyword in blacklist:
            if keyword.lower() in bio_lower:
                return False
                
        # Whitelist (only if defined)
        whitelist = settings.get('keywords_whitelist', [])
        if whitelist:
            has_match = any(k.lower() in bio_lower for k in whitelist)
            if not has_match:
                return False
                
        return True









