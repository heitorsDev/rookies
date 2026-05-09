import secrets
from datetime import datetime, timedelta

import bcrypt
import jwt
from fastapi import HTTPException, status
from mongoengine.errors import NotUniqueError

from app.config import settings
from app.features.auth.models import Member


def _hash_token(token: str) -> str:
    return bcrypt.hashpw(token.encode(), bcrypt.gensalt()).decode()


def _verify_token(token: str, token_hash: str) -> bool:
    return bcrypt.checkpw(token.encode(), token_hash.encode())


def _create_jwt(member: Member) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": member.username,
        "role": member.role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def create_member(
    name: str, username: str, admin_username: str, role: str = "member"
) -> tuple[Member, str]:
    if role not in ("member", "admin"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'member' or 'admin'",
        )

    try:
        member = Member(
            name=name,
            username=username,
            role=role,
            created_by=admin_username,
        )
        member.save()
    except NotUniqueError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{username}' already exists",
        )

    raw_token = generate_token(member)
    return member, raw_token


def generate_token(member: Member) -> str:
    raw_token = secrets.token_urlsafe(32)
    member.login_token_hash = _hash_token(raw_token)
    member.token_issued_at = datetime.utcnow()
    member.save()
    return raw_token


def authenticate(username: str, raw_token: str) -> str:
    member = Member.objects(username=username).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or token",
        )

    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )

    if not member.login_token_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No login token issued. Ask an admin to generate one.",
        )

    if not _verify_token(raw_token, member.login_token_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or token",
        )

    return _create_jwt(member)


def get_member_by_username(username: str) -> Member:
    member = Member.objects(username=username).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member '{username}' not found",
        )
    return member


def list_members() -> list[Member]:
    return list(Member.objects().order_by("name"))


def seed_first_admin(name: str, username: str) -> tuple[Member, str]:
    if Member.objects.count() > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot seed: members already exist in the database",
        )

    member = Member(
        name=name,
        username=username,
        role="admin",
        created_by="system",
    )
    member.save()

    raw_token = generate_token(member)
    return member, raw_token
