import asyncio

from fastapi import APIRouter, Depends, Query

from app.features.auth.dependencies import get_current_member
from app.features.auth.models import Member
from app.features.inventory import service
from app.features.inventory.schemas import InventoryItem, InventoryResponse

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("", response_model=InventoryResponse)
async def get_inventory(
    type_slug: str | None = Query(None, description="Filter by component type slug"),
    status: str | None = Query(None, description="Filter by status"),
    q: str | None = Query(None, description="Free-text search on code and notes"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Results per page"),
    sort_by: str = Query("created_at", description="Sort field: created_at, updated_at, status, code"),
    sort_dir: str = Query("desc", description="Sort direction: asc or desc"),
    _: Member = Depends(get_current_member),
):
    items, total = await asyncio.to_thread(
        service.list_inventory,
        type_slug,
        status,
        q,
        page,
        page_size,
        sort_by,
        sort_dir,
    )
    return InventoryResponse(
        items=[InventoryItem.model_validate(c) for c in items],
        total=total,
        page=page,
        page_size=page_size,
    )
