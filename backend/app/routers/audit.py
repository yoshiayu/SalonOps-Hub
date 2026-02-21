from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from app.repository import repo
from app.schemas import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs", response_model=list[AuditLog])
def get_audit_logs(
    from_date: date | None = None,
    to_date: date | None = None,
    user: str | None = None,
    action: str | None = None,
):
    return repo.list_audit_logs(from_date=from_date, to_date=to_date, user=user, action=action)
