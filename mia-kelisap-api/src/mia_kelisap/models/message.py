from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from mia_kelisap.models.base import Base, TimestampMixin, UUIDMixin


class Message(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "messages"

    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id"), index=True
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    content: Mapped[str] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(20))  # incoming, outgoing, system
    is_stored_in_memory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_pending: Mapped[bool] = mapped_column(Boolean, default=True)

    conversation: Mapped["Conversation"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="messages"
    )
