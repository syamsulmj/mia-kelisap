from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from mia_kelisap.models.base import Base, TimestampMixin, UUIDMixin


class UserSettings(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "user_settings"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), unique=True, index=True
    )
    llm_provider: Mapped[str] = mapped_column(String(20), default="openai")
    llm_model: Mapped[str] = mapped_column(String(50), default="gpt-4o-mini")
    openai_api_key_encrypted: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    claude_api_key_encrypted: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    debounce_seconds: Mapped[int] = mapped_column(Integer, default=90)

    # AI Agent persona
    agent_name: Mapped[str] = mapped_column(String(100), default="Mia")
    agent_tone: Mapped[str] = mapped_column(String(50), default="friendly")
    agent_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Reply style
    response_length: Mapped[str] = mapped_column(String(20), default="medium")
    avoid_markdown: Mapped[bool] = mapped_column(Boolean, default=True)
    use_simple_language: Mapped[bool] = mapped_column(Boolean, default=True)
    avoid_oversharing: Mapped[bool] = mapped_column(Boolean, default=True)

    # Contact access control
    contact_access_mode: Mapped[str] = mapped_column(String(20), default="reply_all")

    user: Mapped["User"] = relationship(back_populates="settings")  # type: ignore[name-defined]  # noqa: F821
