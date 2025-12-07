"""
DOM Selectors for Threads.net
Extracted from 'Follow threads v1' and 'Follow un' extensions.
"""

SELECTORS = {
    # Modal Windows
    "modal": [
        '[role="dialog"]',
        '[aria-modal="true"]',
        '[data-testid="modal"]',
        '[data-testid="followers-modal"]',
        '[data-testid="following-modal"]',
        'div[style*="position: fixed"][style*="z-index: 5000"]' # Fallback high z-index
    ],
    
    # Buttons
    "follow_button": [
        # Standard buttons
        'button', 
        # Divs acting as buttons (common in React apps)
        'div[role="button"]' 
    ],
    
    # Text content to identify follow buttons (multilingual support)
    "follow_button_text": [
        "Follow", 
        "Подписаться", 
        "Follow back", 
        "Subscribe"
    ],
    
    # Selectors for Opening the Followers List on Profile Page
    "followers_count_button": [
        "a[href*='followers']",
        "a[href*='/followers/']",
        "span", # Often wrapped in span if just text
    ],

    # Containers
    "scrollable_container": [
        '[style*="overflow"]',
        '[style*="scroll"]',
        'div[style*="height"]'
    ],
    
    # Posts in Feed
    "post_article": [
        '[role="article"]',
        '[data-testid="post-container"]',
        'div[data-pressable-container="true"]' # Often the clickable wrapper
    ],
    
    # User Profile Elements
    "user_avatar": 'img[alt*="profile picture"]',
    "username_element": [
        'span[style*="font-weight: 600"]', # Often the bold username
        'a[href^="/@"]' # Profile links
    ],
    
    # Interaction Buttons on Post
    "like_button": 'svg[aria-label="Like"]',
    "unlike_button": 'svg[aria-label="Unlike"]',
    "comment_button": 'svg[aria-label="Comment"]',
    "repost_button": 'svg[aria-label="Repost"]'
}








