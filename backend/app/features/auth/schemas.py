from datetime import datetime

from pydantic import BaseModel


class ActivateRequest(BaseModel):
    username: str
    token: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    member: "MemberOut"


class MemberOut(BaseModel):
    name: str
    username: str
    role: str
    is_active: bool
    created_at: datetime
    created_by: str | None = None
    is_activated: bool = False

    model_config = {"from_attributes": True}


class MemberCreate(BaseModel):
    name: str
    username: str
    role: str = "member"


class TokenResponse(BaseModel):
    token: str
    username: str


class MessageResponse(BaseModel):
    detail: str


class SeedAdminRequest(BaseModel):
    name: str
    username: str
    password: str | None = None
    seed_key: str | None = None
