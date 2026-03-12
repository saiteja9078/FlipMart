from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str
    ENVIRONMENT: str = "development"
    
    # JWT
    JWT_SECRET: str = "flipmart-super-secret-jwt-key-change-in-production"
    
    # SMTP (optional — email will be mocked if not set)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — reads .env once."""
    return Settings()
