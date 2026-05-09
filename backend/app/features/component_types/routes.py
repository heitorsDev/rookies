import asyncio

from fastapi import APIRouter, Depends, Query

from app.features.auth.dependencies import get_current_member, require_admin
from app.features.auth.models import Member
from app.features.component_types.schemas import (
    ComponentTypeCreate,
    ComponentTypeOut,
    ComponentTypeUpdate,
)
from app.features.component_types.service import (
    archive_component_type,
    create_component_type,
    get_component_type_by_slug,
    list_component_types,
    update_component_type,
)

router = APIRouter(prefix="/component-types", tags=["component-types"])


@router.get("", response_model=list[ComponentTypeOut])
async def get_component_types(
    include_archived: bool = Query(False),
    _: Member = Depends(get_current_member),
):
    return await asyncio.to_thread(list_component_types, include_archived=include_archived)


@router.post("", response_model=ComponentTypeOut, status_code=201)
async def post_component_type(
    data: ComponentTypeCreate,
    _: Member = Depends(get_current_member),
):
    return await asyncio.to_thread(create_component_type, data)


@router.get("/{slug}", response_model=ComponentTypeOut)
async def get_component_type(
    slug: str,
    _: Member = Depends(get_current_member),
):
    return await asyncio.to_thread(get_component_type_by_slug, slug)


@router.put("/{slug}", response_model=ComponentTypeOut)
async def put_component_type(
    slug: str,
    data: ComponentTypeUpdate,
    _: Member = Depends(get_current_member),
):
    return await asyncio.to_thread(update_component_type, slug, data)


@router.delete("/{slug}", response_model=ComponentTypeOut)
async def delete_component_type(
    slug: str,
    _: Member = Depends(require_admin),
):
    return await asyncio.to_thread(archive_component_type, slug)
