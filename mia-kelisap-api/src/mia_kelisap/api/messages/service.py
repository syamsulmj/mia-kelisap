from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mia_kelisap.api.messages.schemas import (
    IncomingMessageRequest,
    MessageListResponse,
    MessageResponse,
)
from mia_kelisap.models.conversation import Conversation
from mia_kelisap.models.message import Message
from mia_kelisap.services.debounce import debounce_manager


class MessageService:
    @staticmethod
    async def handle_incoming(
        db: AsyncSession, data: IncomingMessageRequest
    ) -> MessageResponse:
        stmt = select(Conversation).where(
            Conversation.user_id == data.user_id,
            Conversation.contact_jid == data.contact_jid,
        )
        conv = (await db.execute(stmt)).scalar_one_or_none()

        if not conv:
            conv = Conversation(
                user_id=data.user_id,
                contact_jid=data.contact_jid,
                contact_name=data.contact_name,
                is_group=data.is_group,
            )
            db.add(conv)
            await db.flush()

        msg = Message(
            conversation_id=conv.id,
            user_id=data.user_id,
            content=data.content,
            role="incoming",
            is_pending=True,
            created_at=data.timestamp or datetime.now(UTC),
        )
        db.add(msg)
        await db.flush()

        # Notify debounce manager that this user has pending messages
        debounce_manager.notify_pending(data.user_id)

        return MessageResponse.model_validate(msg)

    @staticmethod
    async def list_messages(
        db: AsyncSession, user_id: str, conversation_id: str
    ) -> MessageListResponse:
        stmt = (
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.user_id == user_id,
            )
            .order_by(Message.created_at)
        )
        messages = (await db.execute(stmt)).scalars().all()
        return MessageListResponse(
            messages=[MessageResponse.model_validate(m) for m in messages]
        )
