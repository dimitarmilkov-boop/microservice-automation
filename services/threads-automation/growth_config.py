"""
Configuration for Threads Growth Worker (Targeted Follow)
"""

# Settings for the Growth Worker
GROWTH_SETTINGS = {
    "max_follows_per_session": 50,
    "delay_min": 2,
    "delay_max": 8,
    "scroll_delay": 3,
    "max_scrolls": 20,
    "filter_language": ["latin", "cyrillic"], # 'latin', 'cyrillic', 'arabic', 'other'
    "skip_if_no_avatar": True,
    "skip_keywords": ["bot", "shop", "store", "promo", "nft", "crypto"],
}

