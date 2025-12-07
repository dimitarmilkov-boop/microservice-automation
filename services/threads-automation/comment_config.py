"""
Configuration for Threads Comment Worker (White Panel)
"""

COMMENT_SETTINGS = {
    "feed_type": "for_you", # or "following"
    "max_comments_per_session": 20,
    "enable_like": True, # Like post before commenting
    "scroll_delay": 5,
    "max_scrolls": 50,
    "comments_delay_min": 30, # Time between comments
    "comments_delay_max": 120,
    
    # AI Settings
    "ai_provider": "openai", # openai, groq, gemini
    "ai_model": "gpt-4-turbo",
    "ai_prompt": "Write a short, engaging comment relevant to this post. Keep it casual and friendly. Do not use hashtags.",
    
    # Filters
    "skip_keywords": ["giveaway", "promo", "shop", "nft", "crypto"],
    "min_post_length": 10,
    "max_post_length": 500
}

