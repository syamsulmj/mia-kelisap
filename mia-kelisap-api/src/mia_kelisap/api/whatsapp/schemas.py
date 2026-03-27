from pydantic import BaseModel


class WhatsAppStatusResponse(BaseModel):
    status: str
    qr_code: str | None = None


class ConnectResponse(BaseModel):
    status: str
    message: str
