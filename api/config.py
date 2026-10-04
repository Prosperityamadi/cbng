import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App Information
    APP_NAME: str = "NemiCapital International Bank API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/nemicapital_bank"

    # Cache & OTP Store (Upstash Redis)
    REDIS_URL: str = "redis://localhost:6379/0"
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""

    # Transactional Email (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM_VERIFY: str = "NemiCapital Security <verify@nemicapbank.com>"
    EMAIL_FROM_WELCOME: str = "NemiCapital Private Wealth <hello@nemicapbank.com>"
    EMAIL_REPLY_TO: str = "NemiCapital Client Support <support@nemicapbank.com>"

    # Object Storage (Supabase Storage)
    SUPABASE_URL: str = "https://djwhjzvszeypetdxvyhk.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET_PROFILE: str = "profile-pictures"
    KYC_STORAGE_BUCKET: str = "kyc-documents"

    # Authentication & JWT Security
    JWT_SECRET_KEY: str = "nemicapital_super_secret_live_jwt_key_2026_banking_vault"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 Days (43,200 Minutes)
    ONBOARDING_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 Hours

    model_config = SettingsConfigDict(
        env_file=(".env.local", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
