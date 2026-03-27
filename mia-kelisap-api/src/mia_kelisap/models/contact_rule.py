from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from mia_kelisap.models.base import Base, TimestampMixin, UUIDMixin


class ContactRule(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "contact_rules"
    __table_args__ = (
        UniqueConstraint("user_id", "contact_jid", name="uq_user_contact"),
    )

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    contact_jid: Mapped[str] = mapped_column(String(255), index=True)
    rule_type: Mapped[str] = mapped_column(String(10))  # "allow" | "block"
    contact_name: Mapped[str] = mapped_column(String(255), default="")

    user: Mapped["User"] = relationship(back_populates="contact_rules")  # type: ignore[name-defined]  # noqa: F821
