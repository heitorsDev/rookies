import asyncio

from fastapi import APIRouter, Depends, status

from app.features.auth.dependencies import get_current_member
from app.features.auth.models import Member
from app.features.components import service
from app.features.components.schemas import (
    ComponentCreate,
    ComponentOut,
    ComponentUpdate,
    HistoryEntryOut,
)

router = APIRouter(prefix="/components", tags=["components"])


@router.post("", response_model=ComponentOut, status_code=status.HTTP_201_CREATED)
async def register_component(
    body: ComponentCreate,
    member: Member = Depends(get_current_member),
):
    component = await asyncio.to_thread(
        service.create_component,
        body.component_type_slug,
        body.diagnostic_data,
        body.notes,
        body.status,
        member.username,
    )
    return ComponentOut.model_validate(component)


@router.get("/{code}", response_model=ComponentOut)
async def get_component(
    code: str,
    member: Member = Depends(get_current_member),
):
    component = await asyncio.to_thread(service.get_component_by_code, code)
    return ComponentOut.model_validate(component)


@router.patch("/{code}", response_model=ComponentOut)
async def update_component(
    code: str,
    body: ComponentUpdate,
    member: Member = Depends(get_current_member),
):
    component = await asyncio.to_thread(
        service.update_component,
        code,
        body.status,
        body.diagnostic_data,
        body.notes,
        body.loan_info.model_dump() if body.loan_info is not None else None,
        member.username,
    )
    return ComponentOut.model_validate(component)


@router.get("/{code}/history", response_model=list[HistoryEntryOut])
async def get_component_history(
    code: str,
    member: Member = Depends(get_current_member),
):
    history = await asyncio.to_thread(service.get_component_history, code)
    return [HistoryEntryOut.model_validate(e) for e in history]
