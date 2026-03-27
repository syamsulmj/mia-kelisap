from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from mia_kelisap.models.base import Base, TimestampMixin, UUIDMixin


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(255), default="")

    settings: Mapped["UserSettings"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="user", uselist=False, lazy="selectin"
    )
    conversations: Mapped[list["Conversation"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="user", lazy="selectin"
    )
    whatsapp_session: Mapped["WhatsAppSession"] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="user", uselist=False, lazy="selectin"
    )
    contact_rules: Mapped[list["ContactRule"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        back_populates="user", lazy="selectin"
    )
