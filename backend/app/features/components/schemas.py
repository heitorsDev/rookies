from datetime import datetime

from pydantic import BaseModel, model_validator

from app.features.component_types.models import ComponentType


class LoanInfoIn(BaseModel):
    borrower_name: str
    expected_return: datetime
    notes: str | None = None


class LoanInfoOut(BaseModel):
    borrower_name: str
    expected_return: datetime
    notes: str | None = None

    model_config = {"from_attributes": True}


class HistoryEntryOut(BaseModel):
    timestamp: datetime
    changed_by: str
    field: str
    old_value: str | None = None
    new_value: str | None = None

    model_config = {"from_attributes": True}


class AttachmentOut(BaseModel):
    filename: str
    mime_type: str | None = None
    uploaded_at: datetime

    model_config = {"from_attributes": True}


class ComponentCreate(BaseModel):
    component_type_slug: str
    diagnostic_data: dict = {}
    notes: str | None = None
    status: str = "available"


class ComponentUpdate(BaseModel):
    status: str | None = None
    diagnostic_data: dict | None = None
    notes: str | None = None
    loan_info: LoanInfoIn | None = None


class ComponentOut(BaseModel):
    code: str
    component_type: str
    component_type_slug: str
    status: str
    diagnostic_data: dict
    notes: str | None = None
    loan_info: LoanInfoOut | None = None
    attachments: list[AttachmentOut] = []
    history: list[HistoryEntryOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_type_reference(cls, data):
        ct = data.get("component_type") if isinstance(data, dict) else getattr(data, "component_type", None)
        if ct is not None and isinstance(ct, ComponentType):
            if isinstance(data, dict):
                data["component_type"] = ct.name
                data["component_type_slug"] = ct.slug
            else:
                data.component_type = ct.name
                data.component_type_slug = ct.slug
        return data
