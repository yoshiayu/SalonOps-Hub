from __future__ import annotations

from fastapi import APIRouter, Depends

from app.deps import get_current_user
from app.schemas import AppUser

router = APIRouter(tags=["auth"])


@router.get("/auth/login")
def auth_login() -> dict:
    return {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "message": "Google OAuth を開始してください。"
    }


@router.get("/auth/callback")
def auth_callback(code: str | None = None) -> dict:
    return {
        "code": code,
        "message": "callback received"
    }


@router.post("/auth/logout")
def auth_logout() -> dict:
    return {
        "message": "logout completed"
    }


@router.get("/me", response_model=AppUser)
def me(user: AppUser = Depends(get_current_user)) -> AppUser:
    return user
