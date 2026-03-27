from fastapi import APIRouter, HTTPException, Query, status

from mia_kelisap.api.conversations.schemas import (
    ConversationListResponse,
    ConversationResponse,
)
from mia_kelisap.api.conversations.service import ConversationService
from mia_kelisap.dependencies import DB, CurrentUser

router = APIRouter()


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    user: CurrentUser,
    db: DB,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
) -> ConversationListResponse:
    return await ConversationService.list_conversations(db, user.id, limit, offset)


@router.get("/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str, user: CurrentUser, db: DB
) -> ConversationResponse:
    conv = await ConversationService.get_conversation(db, user.id, conversation_id)
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found"
        )
    return ConversationResponse.model_validate(conv)
