from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ContactRuleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    contact_jid: str
    rule_type: str
    contact_name: str
    created_at: datetime


class ContactRuleListResponse(BaseModel):
    rules: list[ContactRuleResponse]


class CreateContactRuleRequest(BaseModel):
    contact_jid: str
    rule_type: str  # "allow" | "block"
    contact_name: str = ""
