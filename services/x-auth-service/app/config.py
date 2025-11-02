"""
Configuration management for X Auth Service.

Uses Pydantic for settings validation and environment variable loading.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional
import os
from pathlib import Path

# Fix BOM encoding issue - manually load .env from PROJECT ROOT
# Path goes up 4 levels: config.py -> app/ -> x-auth-service/ -> services/ -> project root
env_path = Path(__file__).parent.parent.parent.parent / '.env'
if env_path.exists():
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ[key.strip()] = value.strip()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Service Info
    service_name: str = "x-auth-service"
    service_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8001

    # GoLogin
    gologin_token: str = Field(default="", validation_alias="GOLOGIN_TOKEN")

    # Database (Optional)
    database_url: str = "sqlite:///./x_auth.db"

    # Redis (Optional)
    redis_url: Optional[str] = None

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    # Captcha Services (Optional)
    anticaptcha_api_key: Optional[str] = None
    twocaptcha_api_key: Optional[str] = None
    capsolver_api_key: Optional[str] = None

    # Proxy (Optional)
    royal_proxy_username: Optional[str] = None
    royal_proxy_password: Optional[str] = None
    royal_proxy_api_token: Optional[str] = None

    # Worker Settings
    max_concurrent_jobs: int = 5
    job_timeout_seconds: int = 300  # 5 minutes

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


# Global settings instance
settings = Settings()
