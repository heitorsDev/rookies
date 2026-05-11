import re
from datetime import datetime

from bson import ObjectId
from pydantic import BaseModel, field_validator, model_validator

SLUG_REGEX = re.compile(r"^[a-z0-9]+$")

ALLOWED_FIELD_TYPES = {
    "text",
    "number",
    "boolean",
    "select",
    "multiselect",
    "range",
    "textarea",
    "file",
    "auto",
    "date",
}


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

    @field_validator("field_type")
    @classmethod
    def validate_field_type(cls, v: str) -> str:
        if v not in ALLOWED_FIELD_TYPES:
            raise ValueError(
                f"Invalid field_type '{v}'. Allowed: {', '.join(sorted(ALLOWED_FIELD_TYPES))}"
            )
        return v

    @field_validator("field_id")
    @classmethod
    def validate_field_id(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("field_id must be alphanumeric only (no special characters)")
        return v

    @field_validator("options")
    @classmethod
    def validate_options(cls, v: list[str] | None, info) -> list[str] | None:
        return v or None


class FieldDefinitionOut(FieldDefinitionIn):
    model_config = {"from_attributes": True}


class ComponentTypeCreate(BaseModel):
    name: str
    slug: str
    description: str | None = None
    fields: list[FieldDefinitionIn] = []

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        v = v.lower().strip()
        if not SLUG_REGEX.match(v):
            raise ValueError(
                "Slug must be lowercase alphanumeric only (e.g. 'falcon500')"
            )
        return v

    @field_validator("fields")
    @classmethod
    def validate_field_ids_unique(cls, v: list[FieldDefinitionIn]) -> list[FieldDefinitionIn]:
        ids = [f.field_id for f in v]
        if len(ids) != len(set(ids)):
            raise ValueError("field_id values must be unique within a component type")
        return v


class ComponentTypeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    fields: list[FieldDefinitionIn] | None = None

    @field_validator("fields")
    @classmethod
    def validate_field_ids_unique(cls, v: list[FieldDefinitionIn] | None) -> list[FieldDefinitionIn] | None:
        if v is None:
            return v
        ids = [f.field_id for f in v]
        if len(ids) != len(set(ids)):
            raise ValueError("field_id values must be unique within a component type")
        return v


class ComponentTypeOut(BaseModel):
    id: str
    name: str
    slug: str
    description: str | None
    fields: list[FieldDefinitionOut]
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def convert_objectid(cls, data):
        if hasattr(data, "id") and isinstance(data.id, ObjectId):
            data.id = str(data.id)
        return data
