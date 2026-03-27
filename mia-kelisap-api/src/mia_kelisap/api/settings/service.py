from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mia_kelisap.api.settings.schemas import (
    UpdateSettingsRequest,
    UserSettingsResponse,
)
from mia_kelisap.core.encryption import encrypt_value
from mia_kelisap.models.user_settings import UserSettings

_DEFAULTS = UserSettingsResponse(
    llm_provider="openai",
    llm_model="gpt-4o-mini",
    has_openai_key=False,
    has_claude_key=False,
    debounce_seconds=90,
    agent_name="Mia",
    agent_tone="friendly",
    agent_instructions=None,
    response_length="medium",
    avoid_markdown=True,
    use_simple_language=True,
    avoid_oversharing=True,
    contact_access_mode="reply_all",
)


def _to_response(s: UserSettings) -> UserSettingsResponse:
    return UserSettingsResponse(
        llm_provider=s.llm_provider,
        llm_model=s.llm_model,
        has_openai_key=s.openai_api_key_encrypted is not None,
        has_claude_key=s.claude_api_key_encrypted is not None,
        debounce_seconds=s.debounce_seconds,
        agent_name=s.agent_name,
        agent_tone=s.agent_tone,
        agent_instructions=s.agent_instructions,
        response_length=s.response_length,
        avoid_markdown=s.avoid_markdown,
        use_simple_language=s.use_simple_language,
        avoid_oversharing=s.avoid_oversharing,
        contact_access_mode=s.contact_access_mode,
    )


class SettingsService:
    @staticmethod
    async def get_settings(db: AsyncSession, user_id: str) -> UserSettingsResponse:
        stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        s = (await db.execute(stmt)).scalar_one_or_none()
        if not s:
            return _DEFAULTS
        return _to_response(s)

    @staticmethod
    async def update_settings(
        db: AsyncSession, user_id: str, data: UpdateSettingsRequest
    ) -> UserSettingsResponse:
        stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        s = (await db.execute(stmt)).scalar_one_or_none()
        if not s:
            s = UserSettings(user_id=user_id)
            db.add(s)

        if data.llm_provider is not None:
            s.llm_provider = data.llm_provider
        if data.llm_model is not None:
            s.llm_model = data.llm_model
        if data.openai_api_key is not None:
            s.openai_api_key_encrypted = encrypt_value(data.openai_api_key)
        if data.claude_api_key is not None:
            s.claude_api_key_encrypted = encrypt_value(data.claude_api_key)
        if data.debounce_seconds is not None:
            s.debounce_seconds = data.debounce_seconds
        if data.agent_name is not None:
            s.agent_name = data.agent_name
        if data.agent_tone is not None:
            s.agent_tone = data.agent_tone
        if data.agent_instructions is not None:
            s.agent_instructions = data.agent_instructions
        if data.response_length is not None:
            s.response_length = data.response_length
        if data.avoid_markdown is not None:
            s.avoid_markdown = data.avoid_markdown
        if data.use_simple_language is not None:
            s.use_simple_language = data.use_simple_language
        if data.avoid_oversharing is not None:
            s.avoid_oversharing = data.avoid_oversharing
        if data.contact_access_mode is not None:
            s.contact_access_mode = data.contact_access_mode

        await db.flush()
        return _to_response(s)
