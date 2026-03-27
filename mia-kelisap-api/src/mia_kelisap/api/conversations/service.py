from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from mia_kelisap.api.conversations.schemas import (
    ConversationListResponse,
    ConversationResponse,
)
from mia_kelisap.models.conversation import Conversation
from mia_kelisap.models.message import Message


class ConversationService:
    @staticmethod
    async def list_conversations(
        db: AsyncSession, user_id: str, limit: int = 50, offset: int = 0
    ) -> ConversationListResponse:
        count_stmt = (
            select(func.count())
            .select_from(Conversation)
            .where(Conversation.user_id == user_id)
        )
        total = (await db.execute(count_stmt)).scalar() or 0

        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        convs = (await db.execute(stmt)).scalars().all()

        items: list[ConversationResponse] = []
        for conv in convs:
            last_msg = (
                await db.execute(
                    select(Message.content)
                    .where(Message.conversation_id == conv.id)
                    .order_by(Message.created_at.desc())
                    .limit(1)
                )
            ).scalar_one_or_none()

            msg_count = (
                await db.execute(
                    select(func.count())
                    .select_from(Message)
                    .where(Message.conversation_id == conv.id)
                )
            ).scalar() or 0

            items.append(
                ConversationResponse(
                    id=conv.id,
                    contact_jid=conv.contact_jid,
                    contact_name=conv.contact_name,
                    created_at=conv.created_at,
                    last_message=last_msg,
                    message_count=msg_count,
                )
            )

        return ConversationListResponse(conversations=items, total=total)

    @staticmethod
    async def get_conversation(
        db: AsyncSession, user_id: str, conversation_id: str
    ) -> Conversation | None:
        stmt = select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        return (await db.execute(stmt)).scalar_one_or_none()
