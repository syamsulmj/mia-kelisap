from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    total_conversations: int
    total_messages: int
    total_memories: int
    messages_this_week: int
