from datetime import datetime

from pydantic import BaseModel


class FieldDefinitionIn(BaseModel):
    field_id: str
    label: str
    field_type: str
    required: bool = False
    default: object = None
    options: list[str] | None = None
    min_value: float | None = None
    max_value: float | None = None
    unit: str | None = None
    placeholder: str | None = None
    help_text: str | None = None
    auto: bool = False
    auto_hint: str | None = None


class ComponentTypeCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    fields: list[FieldDefinitionIn] = []


class ComponentTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    fields: list[FieldDefinitionIn] | None = None


class ComponentTypeOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    fields: list[FieldDefinitionIn]
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
