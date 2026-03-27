import httpx

from mia_kelisap.api.whatsapp.schemas import ConnectResponse, WhatsAppStatusResponse
from mia_kelisap.config import settings


class WhatsAppService:
    @staticmethod
    async def connect(user_id: str) -> ConnectResponse:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{settings.bridge_url}/sessions/{user_id}/connect",
                headers={"Authorization": f"Bearer {settings.bridge_secret}"},
                timeout=30.0,
            )
            resp.raise_for_status()
            body = resp.json()
            inner = body.get("data", body)
            return ConnectResponse(
                status=inner.get("status", "connecting"),
                message="Connection initiated",
            )

    @staticmethod
    async def disconnect(user_id: str) -> ConnectResponse:
        async with httpx.AsyncClient() as client:
            resp = await client.delete(
                f"{settings.bridge_url}/sessions/{user_id}",
                headers={"Authorization": f"Bearer {settings.bridge_secret}"},
                timeout=10.0,
            )
            resp.raise_for_status()
            return ConnectResponse(status="disconnected", message="Disconnected")

    @staticmethod
    async def get_status(user_id: str) -> WhatsAppStatusResponse:
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(
                    f"{settings.bridge_url}/sessions/{user_id}/status",
                    headers={"Authorization": f"Bearer {settings.bridge_secret}"},
                    timeout=10.0,
                )
                resp.raise_for_status()
                body = resp.json()
                # Bridge wraps in { success, data: { status, qrCode } }
                inner = body.get("data", body)
                return WhatsAppStatusResponse(
                    status=inner.get("status", "disconnected"),
                    qr_code=inner.get("qrCode"),
                )
            except httpx.HTTPError:
                return WhatsAppStatusResponse(status="disconnected")
