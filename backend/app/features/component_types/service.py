from datetime import datetime, timezone

from fastapi import HTTPException, status
from mongoengine.errors import NotUniqueError

from app.features.component_types.models import ComponentType, FieldDefinition
from app.features.component_types.schemas import (
    ComponentTypeCreate,
    ComponentTypeUpdate,
)
from app.features.components.models import Component


def _utcnow():
    return datetime.now(timezone.utc)


def _doc_to_fields(doc) -> list[dict]:
    return [
        {
            "field_id": f.field_id,
            "label": f.label,
            "field_type": f.field_type,
            "required": f.required,
            "default": f.default,
            "options": f.options,
            "min_value": f.min_value,
            "max_value": f.max_value,
            "unit": f.unit,
            "placeholder": f.placeholder,
            "help_text": f.help_text,
            "auto": f.auto,
            "auto_hint": f.auto_hint,
        }
        for f in doc.fields
    ]


def list_component_types(include_archived: bool = False) -> list[ComponentType]:
    query = {} if include_archived else {"is_archived": False}
    return list(ComponentType.objects(**query).order_by("name"))


def create_component_type(data: ComponentTypeCreate) -> ComponentType:
    try:
        ct = ComponentType(
            name=data.name,
            slug=data.slug,
            description=data.description,
            fields=[
                FieldDefinition(**f.model_dump(exclude_none=True))
                for f in data.fields
            ],
        )
        ct.save()
    except NotUniqueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A component type with slug '{data.slug}' or name '{data.name}' already exists",
        )
    return ct


def get_component_type_by_slug(slug: str) -> ComponentType:
    ct = ComponentType.objects(slug=slug).first()
    if not ct:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Component type '{slug}' not found",
        )
    return ct


def update_component_type(slug: str, data: ComponentTypeUpdate) -> ComponentType:
    ct = get_component_type_by_slug(slug)

    update_kwargs = {}

    if data.name is not None:
        update_kwargs["name"] = data.name
    if data.description is not None:
        update_kwargs["description"] = data.description
    if data.fields is not None:
        update_kwargs["fields"] = [
            FieldDefinition(**f.model_dump(exclude_none=True))
            for f in data.fields
        ]

    if not update_kwargs:
        return ct

    update_kwargs["updated_at"] = _utcnow()

    try:
        ct.update(**update_kwargs)
        ct.reload()
    except NotUniqueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A component type with name '{data.name}' already exists",
        )
    return ct


def archive_component_type(slug: str) -> ComponentType:
    ct = get_component_type_by_slug(slug)

    if Component.objects(component_type=ct).count() > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete component type '{slug}': "
            f"{Component.objects(component_type=ct).count()} component(s) reference it. Archive instead.",
        )

    ct.is_archived = True
    ct.updated_at = _utcnow()
    ct.save()
    return ct
