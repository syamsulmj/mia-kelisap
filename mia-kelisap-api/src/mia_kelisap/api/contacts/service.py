from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mia_kelisap.api.contacts.schemas import (
    ContactRuleListResponse,
    ContactRuleResponse,
    CreateContactRuleRequest,
)
from mia_kelisap.models.contact_rule import ContactRule
from mia_kelisap.models.user_settings import UserSettings


class ContactRuleService:
    @staticmethod
    async def list_rules(db: AsyncSession, user_id: str) -> ContactRuleListResponse:
        stmt = (
            select(ContactRule)
            .where(ContactRule.user_id == user_id)
            .order_by(ContactRule.created_at.desc())
        )
        rules = (await db.execute(stmt)).scalars().all()
        return ContactRuleListResponse(
            rules=[ContactRuleResponse.model_validate(r) for r in rules]
        )

    @staticmethod
    async def create_rule(
        db: AsyncSession, user_id: str, data: CreateContactRuleRequest
    ) -> ContactRuleResponse:
        # Upsert: update rule_type if contact already exists
        stmt = select(ContactRule).where(
            ContactRule.user_id == user_id,
            ContactRule.contact_jid == data.contact_jid,
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            existing.rule_type = data.rule_type
            if data.contact_name:
                existing.contact_name = data.contact_name
            await db.flush()
            return ContactRuleResponse.model_validate(existing)

        rule = ContactRule(
            user_id=user_id,
            contact_jid=data.contact_jid,
            rule_type=data.rule_type,
            contact_name=data.contact_name,
        )
        db.add(rule)
        await db.flush()
        return ContactRuleResponse.model_validate(rule)

    @staticmethod
    async def delete_rule(db: AsyncSession, user_id: str, rule_id: str) -> bool:
        stmt = select(ContactRule).where(
            ContactRule.id == rule_id,
            ContactRule.user_id == user_id,
        )
        rule = (await db.execute(stmt)).scalar_one_or_none()
        if not rule:
            return False
        await db.delete(rule)
        await db.flush()
        return True

    @staticmethod
    async def is_contact_allowed(
        db: AsyncSession, user_id: str, contact_jid: str
    ) -> bool:
        settings_stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        settings = (await db.execute(settings_stmt)).scalar_one_or_none()

        if not settings or settings.contact_access_mode == "reply_all":
            return True

        rule_stmt = select(ContactRule).where(
            ContactRule.user_id == user_id,
            ContactRule.contact_jid == contact_jid,
        )
        rule = (await db.execute(rule_stmt)).scalar_one_or_none()

        if settings.contact_access_mode == "allowlist":
            return rule is not None and rule.rule_type == "allow"

        if settings.contact_access_mode == "blocklist":
            return rule is None or rule.rule_type != "block"

        return True
