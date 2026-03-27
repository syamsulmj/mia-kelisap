from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    contact_jid: str
    contact_name: str
    created_at: datetime
    last_message: str | None = None
    message_count: int = 0


class ConversationListResponse(BaseModel):
    conversations: list[ConversationResponse]
    total: int
