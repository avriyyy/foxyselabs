from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="FOX_", case_sensitive=False, extra="ignore")

    agent_port: int = 8000
    log_level: str = "info"

    # Server-side defaults (gateway can also pass these per request)
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    ollama_base_url: str | None = None

    default_provider: str = "openai"
    default_model: str = "gpt-4o-mini"


settings = Settings()
