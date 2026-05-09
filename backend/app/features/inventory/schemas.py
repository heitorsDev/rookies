from datetime import datetime

from pydantic import BaseModel


class InventoryItem(BaseModel):
    code: str
    component_type: str
    type_slug: str
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InventoryResponse(BaseModel):
    items: list[InventoryItem]
    total: int
    page: int
    page_size: int
