import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # Project Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DB_PATH = os.path.join(BASE_DIR, "threads_automation.db")
    
    # GoLogin
    GOLOGIN_TOKEN = os.getenv("GOLOGIN_TOKEN")
    
    # AI Providers
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # Default Automation Settings
    DEFAULT_SETTINGS = {
        "max_follows_per_day": 50,
        "max_likes_per_day": 50,
        "max_comments_per_day": 20,
        "min_delay_seconds": 2,
        "max_delay_seconds": 8,
        "enable_ai_comments": True,
        "ai_provider": "groq", # or "openai"
        "ai_model": "llama-3.1-8b-instant", # Default fast model
        "filter_language": ["ru", "en"], # Default languages
        "skip_no_avatar": True,
        "skip_business_accounts": False
    }

    # API Settings
    HOST = "0.0.0.0"
    PORT = 8000





