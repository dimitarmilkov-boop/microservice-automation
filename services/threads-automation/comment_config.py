"""
Configuration for Threads Comment Worker (White Panel)
"""

COMMENT_SETTINGS = {
    "feed_type": "for_you", # or "following"
    "max_comments_per_session": 10,  # Conservative limit to avoid rate limiting
    "enable_like": True, # Like post before commenting
    "enable_comment": True,
    "stealth_mode": True, # Use human-like typing simulation
    
    "scroll_delay": 5,
    "max_scrolls": 50,
    "comments_delay_min": 30, # Time between comments
    "comments_delay_max": 120,
    
    # AI Settings
    "ai_provider": "openai", # openai, groq, gemini
    "ai_model": "gpt-4-turbo",
    "ai_prompt": """The following is a social media post:

"{POST_TEXT}"

Write a short, natural reply to this post (1-2 sentences max). Be specific to what the post says. Do NOT use generic phrases like "love this" or "great post". Do NOT use hashtags or emojis. Just respond naturally as if you're having a conversation.""",
    
    # Filters
    "skip_keywords": ["giveaway", "promo", "shop", "nft", "crypto"],
    "min_post_length": 10,
    "max_post_length": 500
}
