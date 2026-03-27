from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IncomingMessageRequest(BaseModel):
    user_id: str
    contact_jid: str
    contact_name: str
    content: str
    timestamp: datetime | None = None
    is_group: bool = False
    sender_jid: str | None = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    content: str
    role: str
    is_stored_in_memory: bool
    created_at: datetime


class MessageListResponse(BaseModel):
    messages: list[MessageResponse]
