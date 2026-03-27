from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql+asyncpg://localhost:5432/mia_kelisap"
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 1440
    encryption_key: str = "change-me"
    bridge_url: str = "http://localhost:5174"
    bridge_secret: str = "change-me"
    debounce_default_seconds: int = 90


settings = Settings()
