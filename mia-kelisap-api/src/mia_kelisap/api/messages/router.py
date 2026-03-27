from fastapi import APIRouter, Header, HTTPException, Query, status

from mia_kelisap.api.messages.schemas import (
    IncomingMessageRequest,
    MessageListResponse,
    MessageResponse,
)
from mia_kelisap.api.messages.service import MessageService
from mia_kelisap.config import settings
from mia_kelisap.dependencies import DB, CurrentUser

router = APIRouter()


@router.post(
    "/incoming",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def incoming_message(
    data: IncomingMessageRequest,
    db: DB,
    authorization: str = Header(...),
) -> MessageResponse:
    if authorization != f"Bearer {settings.bridge_secret}":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid bridge secret"
        )
    return await MessageService.handle_incoming(db, data)


@router.get("", response_model=MessageListResponse)
async def list_messages(
    user: CurrentUser,
    db: DB,
    conversation_id: str = Query(...),
) -> MessageListResponse:
    return await MessageService.list_messages(db, user.id, conversation_id)
