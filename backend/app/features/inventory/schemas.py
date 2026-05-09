from datetime import datetime

from pydantic import BaseModel, model_validator

from app.features.component_types.models import ComponentType


class InventoryItem(BaseModel):
    code: str
    component_type: str
    type_slug: str
    status: str
    notes: str | None
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
                data["type_slug"] = ct.slug
            else:
                data.component_type = ct.name
                data.type_slug = ct.slug
        return data


class InventoryResponse(BaseModel):
    items: list[InventoryItem]
    total: int
    page: int
    page_size: int
