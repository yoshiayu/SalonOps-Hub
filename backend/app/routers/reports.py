from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.deps import require_roles
from app.repository import build_report, repo
from app.schemas import Report, ReportGenerateRequest, Role

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/generate", response_model=Report, status_code=status.HTTP_201_CREATED)
def generate_report(
    payload: ReportGenerateRequest,
    _=Depends(require_roles(Role.ADMIN, Role.MANAGER, Role.STAFF)),
):
    report = build_report(
        scope=payload.scope,
        period=payload.period,
        from_date=payload.from_date,
        to_date=payload.to_date,
        recipients=[str(recipient) for recipient in payload.recipients],
    )
    return repo.create_report(report)


@router.get("", response_model=list[Report])
def list_reports():
    return repo.list_reports()


@router.get("/{report_id}", response_model=Report)
def get_report(report_id: str):
    report = repo.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="report not found")
    return report


@router.post("/{report_id}/send", response_model=Report)
def resend_report(
    report_id: str,
    _=Depends(require_roles(Role.ADMIN, Role.MANAGER, Role.STAFF)),
):
    report = repo.send_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="report not found")
    return report
