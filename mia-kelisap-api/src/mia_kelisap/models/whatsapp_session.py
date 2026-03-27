from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from mia_kelisap.models.base import Base, TimestampMixin, UUIDMixin


class WhatsAppSession(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "whatsapp_sessions"

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id"), unique=True, index=True
    )
    status: Mapped[str] = mapped_column(String(20), default="disconnected")
    session_data: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="whatsapp_session")  # type: ignore[name-defined]  # noqa: F821
