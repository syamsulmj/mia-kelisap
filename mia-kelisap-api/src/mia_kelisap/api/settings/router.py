from fastapi import APIRouter

from mia_kelisap.api.settings.schemas import UpdateSettingsRequest, UserSettingsResponse
from mia_kelisap.api.settings.service import SettingsService
from mia_kelisap.dependencies import DB, CurrentUser

router = APIRouter()


@router.get("", response_model=UserSettingsResponse)
async def get_settings(user: CurrentUser, db: DB) -> UserSettingsResponse:
    return await SettingsService.get_settings(db, user.id)


@router.put("", response_model=UserSettingsResponse)
async def update_settings(
    user: CurrentUser, db: DB, data: UpdateSettingsRequest
) -> UserSettingsResponse:
    return await SettingsService.update_settings(db, user.id, data)
