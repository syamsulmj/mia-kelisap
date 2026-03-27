from fastapi import APIRouter

from mia_kelisap.api.analytics.schemas import AnalyticsOverview
from mia_kelisap.api.analytics.service import AnalyticsService
from mia_kelisap.dependencies import DB, CurrentUser

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
async def overview(user: CurrentUser, db: DB) -> AnalyticsOverview:
    return await AnalyticsService.get_overview(db, user.id)
