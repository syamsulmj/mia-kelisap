from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from mia_kelisap.api.analytics.schemas import AnalyticsOverview
from mia_kelisap.models.conversation import Conversation
from mia_kelisap.models.message import Message
from mia_kelisap.services.memory import MemoryService

memory_service = MemoryService()


class AnalyticsService:
    @staticmethod
    async def get_overview(db: AsyncSession, user_id: str) -> AnalyticsOverview:
        conv_count = (
            await db.execute(
                select(func.count())
                .select_from(Conversation)
                .where(Conversation.user_id == user_id)
            )
        ).scalar() or 0

        msg_count = (
            await db.execute(
                select(func.count())
                .select_from(Message)
                .where(Message.user_id == user_id)
            )
        ).scalar() or 0

        week_ago = datetime.now(UTC) - timedelta(days=7)
        week_msg_count = (
            await db.execute(
                select(func.count())
                .select_from(Message)
                .where(Message.user_id == user_id, Message.created_at >= week_ago)
            )
        ).scalar() or 0

        try:
            total_memories = len(memory_service.list_memories(user_id, limit=10000))
        except Exception:
            total_memories = 0

        return AnalyticsOverview(
            total_conversations=conv_count,
            total_messages=msg_count,
            total_memories=total_memories,
            messages_this_week=week_msg_count,
        )
