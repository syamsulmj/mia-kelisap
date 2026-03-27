from fastapi import APIRouter

from mia_kelisap.api.analytics.router import router as analytics_router
from mia_kelisap.api.auth.router import router as auth_router
from mia_kelisap.api.contacts.router import router as contacts_router
from mia_kelisap.api.conversations.router import router as conversations_router
from mia_kelisap.api.memory.router import router as memory_router
from mia_kelisap.api.messages.router import router as messages_router
from mia_kelisap.api.settings.router import router as settings_router
from mia_kelisap.api.whatsapp.router import router as whatsapp_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(
    conversations_router, prefix="/conversations", tags=["conversations"]
)
api_router.include_router(memory_router, prefix="/memory", tags=["memory"])
api_router.include_router(messages_router, prefix="/messages", tags=["messages"])
api_router.include_router(settings_router, prefix="/settings", tags=["settings"])
api_router.include_router(whatsapp_router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(contacts_router, prefix="/contacts", tags=["contacts"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
