from pydantic import BaseModel


class UserSettingsResponse(BaseModel):
    llm_provider: str
    llm_model: str
    has_openai_key: bool
    has_claude_key: bool
    debounce_seconds: int
    agent_name: str
    agent_tone: str
    agent_instructions: str | None
    response_length: str
    avoid_markdown: bool
    use_simple_language: bool
    avoid_oversharing: bool
    contact_access_mode: str


class UpdateSettingsRequest(BaseModel):
    llm_provider: str | None = None
    llm_model: str | None = None
    openai_api_key: str | None = None
    claude_api_key: str | None = None
    debounce_seconds: int | None = None
    agent_name: str | None = None
    agent_tone: str | None = None
    agent_instructions: str | None = None
    response_length: str | None = None
    avoid_markdown: bool | None = None
    use_simple_language: bool | None = None
    avoid_oversharing: bool | None = None
    contact_access_mode: str | None = None
