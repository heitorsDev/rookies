from fastapi import Cookie, Depends, HTTPException, status

from app.features.auth.models import Member
from app.features.auth.service import decode_jwt, get_member_by_username


async def get_current_member(
    access_token: str | None = Cookie(None),
) -> Member:
    token = access_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_jwt(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    member = get_member_by_username(username)
    if not member.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
        )

    return member


async def require_admin(
    current_member: Member = Depends(get_current_member),
) -> Member:
    if current_member.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_member
