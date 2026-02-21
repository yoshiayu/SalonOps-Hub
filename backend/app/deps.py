from __future__ import annotations

from typing import Callable

from fastapi import Depends, Header, HTTPException, status

from app.schemas import AppUser, Role, Scope


def get_current_user(
    x_user_email: str | None = Header(default=None),
    x_user_name: str | None = Header(default=None),
    x_role: str | None = Header(default=None),
    x_scope: str | None = Header(default=None),
) -> AppUser:
    role = Role(x_role) if x_role in {r.value for r in Role} else Role.ADMIN
    scope = Scope(x_scope) if x_scope in {s.value for s in Scope} else Scope.COMPANY
    email = x_user_email or "admin@salonops.example.com"
    name = x_user_name or email.split("@")[0]

    return AppUser(
        id=f"user-{email}",
        name=name,
        email=email,
        role=role,
        scope=scope,
    )


def require_roles(*roles: Role) -> Callable[[AppUser], AppUser]:
    def _validator(user: AppUser = Depends(get_current_user)) -> AppUser:
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="forbidden",
            )
        return user

    return _validator
