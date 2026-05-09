import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.config import settings
from app.features.auth import service
from app.features.auth.dependencies import get_current_member, require_admin
from app.features.auth.models import Member
from app.features.auth.schemas import (
    LoginRequest,
    LoginResponse,
    MemberCreate,
    MemberOut,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    access_token = await asyncio.to_thread(
        service.authenticate, body.username, body.token
    )
    member = await asyncio.to_thread(service.get_member_by_username, body.username)
    return LoginResponse(
        access_token=access_token,
        member=MemberOut.model_validate(member),
    )


@router.post("/members", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    body: MemberCreate,
    admin: Member = Depends(require_admin),
):
    member, raw_token = await asyncio.to_thread(
        service.create_member,
        body.name,
        body.username,
        admin.username,
        body.role,
    )
    return TokenResponse(token=raw_token, username=member.username)


@router.get("/members", response_model=list[MemberOut])
async def list_members(admin: Member = Depends(require_admin)):
    members = await asyncio.to_thread(service.list_members)
    return [MemberOut.model_validate(m) for m in members]


@router.post("/tokens", response_model=TokenResponse)
async def generate_login_token(
    username: str = Query(description="Username of the member"),
    admin: Member = Depends(require_admin),
):
    member = await asyncio.to_thread(service.get_member_by_username, username)
    raw_token = await asyncio.to_thread(service.generate_token, member)
    return TokenResponse(token=raw_token, username=member.username)


@router.post("/seed", response_model=TokenResponse)
async def seed_first_admin(
    body: MemberCreate,
    seed_key: str = Query(description="The seed key from env"),
):
    if not settings.seed_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seed endpoint is not configured",
        )
    if seed_key != settings.seed_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid seed key",
        )

    member, raw_token = await asyncio.to_thread(
        service.seed_first_admin, body.name, body.username
    )
    return TokenResponse(token=raw_token, username=member.username)
