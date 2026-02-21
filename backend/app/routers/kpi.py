from __future__ import annotations

from datetime import date

from fastapi import APIRouter

from app.repository import repo
from app.schemas import Alert, KpiSummary, KpiTrendPoint, Period, Scope, StoreType

router = APIRouter(tags=["kpi"])


@router.get("/kpi/summary", response_model=KpiSummary)
def get_summary(
    scope: Scope = Scope.COMPANY,
    period: Period = Period.MONTHLY,
    from_date: date = date(2026, 2, 1),
    to_date: date = date(2026, 2, 21),
    store_code: str | None = None,
    store_type: StoreType | None = None,
    area: str | None = None,
):
    return repo.get_summary(
        scope=scope,
        period=period,
        from_date=from_date,
        to_date=to_date,
        store_code=store_code,
        store_type=store_type,
        area=area,
    )


@router.get("/kpi/trends", response_model=list[KpiTrendPoint])
def get_trends(
    from_date: date = date(2026, 1, 1),
    to_date: date = date(2026, 2, 21),
    store_type: StoreType | None = None,
    area: str | None = None,
):
    return repo.get_trends(from_date=from_date, to_date=to_date, _store_type=store_type, _area=area)


@router.get("/alerts", response_model=list[Alert])
def get_alerts(
    scope: Scope = Scope.COMPANY,
    period: Period = Period.MONTHLY,
    from_date: date = date(2026, 2, 1),
    to_date: date = date(2026, 2, 21),
):
    summary = repo.get_summary(scope=scope, period=period, from_date=from_date, to_date=to_date)
    return repo.list_alerts(summary)
