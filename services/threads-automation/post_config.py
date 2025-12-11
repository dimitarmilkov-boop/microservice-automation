import os
from pathlib import Path

# Default media folder
DEFAULT_MEDIA_FOLDER = Path(__file__).parent / "media"

POST_SETTINGS = {
    # Where to look for photos
    "photos_folder": os.getenv("THREADS_MEDIA_FOLDER", str(DEFAULT_MEDIA_FOLDER)),
    
    # Supported image formats
    "allowed_extensions": [".jpg", ".jpeg", ".png", ".webp"],
    
    # Limits
    "max_posts_per_day": 3,
    
    # Delay after posting (seconds)
    "delay_after_post": 60,
    
    # AI Settings for Caption
    "ai_provider": "openai", # openai, groq
    "ai_model": "gpt-4-turbo",
    
    "ai_prompt": """Write a short, engaging social media post (1-3 sentences) for Threads.
Topic hint: {TOPIC}

Guidelines:
- Tone: Casual, conversational, authentic
- No hashtags unless specifically relevant to the topic
- Avoid generic phrases like "Check this out" or "Loving this view"
- Act like a real person sharing a moment
- Do not use emojis if they don't fit the tone (keep it minimal)
"""
}
