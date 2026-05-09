from datetime import datetime

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    token: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    member: "MemberOut"


class MemberOut(BaseModel):
    name: str
    username: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class MemberCreate(BaseModel):
    name: str
    username: str
    role: str = "member"


class TokenResponse(BaseModel):
    token: str
    username: str
