import asyncio

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.config import settings
from app.features.auth import service
from app.features.auth.dependencies import get_current_member, require_admin
from app.features.auth.models import Member
from app.features.auth.schemas import (
    ActivateRequest,
    LoginRequest,
    LoginResponse,
    MemberCreate,
    MemberOut,
    MessageResponse,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/activate", response_model=MessageResponse)
async def activate(body: ActivateRequest):
    member = await asyncio.to_thread(
        service.activate_member, body.username, body.token, body.password
    )
    return MessageResponse(detail="Account activated. You can now log in with your password.")


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    access_token = await asyncio.to_thread(
        service.authenticate, body.username, body.password
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

    def member_to_out(m):
        out = MemberOut.model_validate(m)
        out.is_activated = service.is_activated(m)
        return out

    return [await asyncio.to_thread(member_to_out, m) for m in members]


@router.get("/members/me", response_model=MemberOut)
async def get_current_member_info(member: Member = Depends(get_current_member)):
    out = MemberOut.model_validate(member)
    out.is_activated = service.is_activated(member)
    return out


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
