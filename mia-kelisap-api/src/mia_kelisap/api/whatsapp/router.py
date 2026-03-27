import logging

from fastapi import APIRouter, Header
from pydantic import BaseModel

from mia_kelisap.api.whatsapp.schemas import ConnectResponse, WhatsAppStatusResponse
from mia_kelisap.api.whatsapp.service import WhatsAppService
from mia_kelisap.config import settings
from mia_kelisap.dependencies import CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter()


class BridgeStatusUpdate(BaseModel):
    user_id: str
    status: str


@router.post("/connect", response_model=ConnectResponse)
async def connect(user: CurrentUser) -> ConnectResponse:
    return await WhatsAppService.connect(user.id)


@router.post("/disconnect", response_model=ConnectResponse)
async def disconnect(user: CurrentUser) -> ConnectResponse:
    return await WhatsAppService.disconnect(user.id)


@router.get("/status", response_model=WhatsAppStatusResponse)
async def get_status(user: CurrentUser) -> WhatsAppStatusResponse:
    return await WhatsAppService.get_status(user.id)


@router.post("/bridge-status")
async def bridge_status(
    data: BridgeStatusUpdate,
    authorization: str = Header(...),
) -> dict[str, str]:
    """Receives connection status updates from the bridge service."""
    if authorization != f"Bearer {settings.bridge_secret}":
        return {"status": "forbidden"}
    logger.info(
        "Bridge status update: user=%s status=%s",
        data.user_id,
        data.status,
    )
    return {"status": "ok"}
