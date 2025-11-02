"""
Instagram Engagement Service - Configuration
Loads settings from root .env file using Pydantic
"""

import os
from pathlib import Path
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings


# Fix BOM encoding issue - manually load .env from PROJECT ROOT
# Path goes up 3 levels: config.py -> ig-engagement-service/ -> services/ -> project root
env_path = Path(__file__).parent.parent.parent / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()


class Settings(BaseSettings):
    """Instagram Engagement Service Settings"""
    
    # ========================================
    # GoLogin Configuration
    # ========================================
    gologin_token: str = Field(..., alias='GOLOGIN_TOKEN')
    gologin_local_mode: bool = Field(False, alias='GOLOGIN_LOCAL_MODE')  # False = Cloud mode (default)
    gologin_ig_profiles: str = Field(..., alias='GOLOGIN_IG_PROFILES')  # Comma-separated profile names
    
    # ========================================
    # Instagram Automation Configuration
    # ========================================
    ig_target_accounts_file: str = Field('ig_targets.txt', alias='IG_TARGET_ACCOUNTS_FILE')
    ig_daily_like_limit: int = Field(30, alias='IG_DAILY_LIKE_LIMIT')
    ig_comments_to_like: int = Field(3, alias='IG_COMMENTS_TO_LIKE')
    ig_posts_per_session: int = Field(5, alias='IG_POSTS_PER_SESSION')
    
    # ========================================
    # Timing & Delays Configuration
    # ========================================
    ig_action_delay_min: int = Field(3, alias='IG_ACTION_DELAY_MIN')
    ig_action_delay_max: int = Field(7, alias='IG_ACTION_DELAY_MAX')
    ig_scheduler_check_interval: int = Field(300, alias='IG_SCHEDULER_CHECK_INTERVAL')  # 5 minutes = 300 seconds
    
    # ========================================
    # Database Configuration
    # ========================================
    ig_database_path: str = Field('ig_engagement.db', alias='IG_DATABASE_PATH')
    
    # ========================================
    # Logging Configuration
    # ========================================
    environment: str = Field('development', alias='ENVIRONMENT')
    debug: bool = Field(False, alias='DEBUG')
    
    class Config:
        env_file = str(env_path)
        env_file_encoding = 'utf-8-sig'
        case_sensitive = False
        extra = 'ignore'  # Ignore extra env vars from shared .env file
    
    @property
    def profile_names(self) -> List[str]:
        """Parse comma-separated profile names into list"""
        return [p.strip() for p in self.gologin_ig_profiles.split(',') if p.strip()]
    
    @property
    def sessions_per_profile(self) -> int:
        """Calculate number of sessions per profile per day"""
        # Total likes per day ÷ comments per post ÷ posts per session
        total_posts_per_day = self.ig_daily_like_limit / self.ig_comments_to_like
        sessions = total_posts_per_day / self.ig_posts_per_session
        return max(1, round(sessions))  # At least 1 session per day
    
    def get_target_accounts_path(self) -> Path:
        """Get absolute path to target accounts file"""
        target_path = Path(self.ig_target_accounts_file)
        if not target_path.is_absolute():
            # Resolve relative to project root
            project_root = Path(__file__).parent.parent.parent
            target_path = project_root / target_path
        return target_path
    
    def get_database_path(self) -> Path:
        """Get absolute path to database file"""
        db_path = Path(self.ig_database_path)
        if not db_path.is_absolute():
            # Resolve relative to project root
            project_root = Path(__file__).parent.parent.parent
            db_path = project_root / db_path
        return db_path


# Singleton instance
_settings = None

def get_settings() -> Settings:
    """Get singleton settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings

