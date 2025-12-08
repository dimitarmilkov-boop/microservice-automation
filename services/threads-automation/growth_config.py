"""
Configuration for Threads Growth Worker (Targeted Follow)
Implements "Human Protocol" to avoid detection.
"""

# List of target profiles (fallback if not provided in UI)
TARGETS = ["zuck", "mosseri", "instagram"]

# Settings for the Growth Worker
GROWTH_SETTINGS = {
    # SAFETY & LIMITS
    "max_follows_per_session": 15,    # Lower limit per session (Split 50 daily into 3 sessions)
    "max_rejections": 1,              # STOP immediately if 1 follow is rejected (Safety Valve)
    
    # HUMAN TIMING (Anti-Rhythm)
    "delay_min": 15,                  # Minimum wait between follows (seconds)
    "delay_max": 60,                  # Maximum wait between follows (seconds)
    
    # COFFEE BREAKS (Pattern Breaking)
    "enable_breaks": True,
    "break_every_min": 4,             # Take a break after 4-7 follows
    "break_every_max": 7,
    "break_duration_min": 120,        # Break length: 2 minutes
    "break_duration_max": 300,        # Break length: 5 minutes
    
    # MOUSE SIMULATION
    "hover_before_click": True,
    "hover_delay_min": 0.5,
    "hover_delay_max": 1.5,
    
    # NAVIGATION
    "scroll_delay": 4,
    "max_scrolls": 50,
    "filter_language": ["latin", "cyrillic"],
    "skip_if_no_avatar": True,
    "skip_keywords": ["bot", "shop", "store", "promo", "nft", "crypto"],
}
