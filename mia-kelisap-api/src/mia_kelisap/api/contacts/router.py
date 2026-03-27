from fastapi import APIRouter, HTTPException, status

from mia_kelisap.api.contacts.schemas import (
    ContactRuleListResponse,
    ContactRuleResponse,
    CreateContactRuleRequest,
)
from mia_kelisap.api.contacts.service import ContactRuleService
from mia_kelisap.dependencies import DB, CurrentUser

router = APIRouter()


@router.get("", response_model=ContactRuleListResponse)
async def list_contact_rules(user: CurrentUser, db: DB) -> ContactRuleListResponse:
    return await ContactRuleService.list_rules(db, user.id)


@router.post(
    "",
    response_model=ContactRuleResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_contact_rule(
    user: CurrentUser, db: DB, data: CreateContactRuleRequest
) -> ContactRuleResponse:
    return await ContactRuleService.create_rule(db, user.id, data)


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_rule(rule_id: str, user: CurrentUser, db: DB) -> None:
    deleted = await ContactRuleService.delete_rule(db, user.id, rule_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact rule not found",
        )
