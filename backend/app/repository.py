from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from uuid import uuid4

from app.schemas import (
    Alert,
    AuditLog,
    ImportError,
    ImportJob,
    ImportStatus,
    KpiDef,
    KpiSummary,
    KpiSummaryItem,
    KpiTrendPoint,
    Period,
    Report,
    ReportStatus,
    Scope,
    Store,
    StoreType,
)


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex[:8]}"


class InMemoryRepository:
    def __init__(self) -> None:
        self.stores: list[Store] = [
            Store(
                id="store-1",
                code="TKY-001",
                name="SalonOps Tokyo Central",
                type=StoreType.DIRECT,
                area="Kanto",
                manager="Sato",
                business_unit="Salon",
            ),
            Store(
                id="store-2",
                code="OSK-003",
                name="SalonOps Osaka Umeda",
                type=StoreType.FC,
                area="Kansai",
                manager="Yamada",
                business_unit="Salon",
            ),
            Store(
                id="store-3",
                code="MFG-JP",
                name="Manufacturer Japan",
                type=StoreType.DIRECT,
                area="HQ",
                manager="Kobayashi",
                business_unit="Manufacturer",
            ),
        ]

        self.kpi_defs: list[KpiDef] = [
            KpiDef(
                id="kpi-revenue",
                key="revenue",
                name="売上",
                unit="JPY",
                target=12_000_000,
                alert_threshold=0.15,
            ),
            KpiDef(
                id="kpi-customers",
                key="customers",
                name="客数",
                unit="count",
                target=5_000,
                alert_threshold=0.20,
            ),
        ]

        self.import_jobs: list[ImportJob] = []
        self.reports: list[Report] = [
            Report(
                id="rep-seed",
                scope=Scope.COMPANY,
                period=Period.WEEKLY,
                from_date=date(2026, 2, 10),
                to_date=date(2026, 2, 16),
                recipients=["ops@salonops.example.com"],
                status=ReportStatus.SENT,
                file_url="https://example.com/reports/rep-seed.pdf",
                created_at=_now(),
                updated_at=_now(),
            )
        ]

        self.audit_logs: list[AuditLog] = [
            AuditLog(
                id="audit-seed-1",
                at=_now(),
                user_email="ops@salonops.example.com",
                action="IMPORT_EXECUTED",
                resource="sales_import",
                resource_id="imp-seed",
                detail="Seed import finished.",
            )
        ]

        self.performance = {
            "TKY-001": {
                "revenue": 13_800_000,
                "customers": 5_800,
                "repeat_rate": 66.2,
                "utilization_rate": 81.4,
                "ad_cpa": 6_400,
                "prev_month_revenue": 13_100_000,
                "prev_year_revenue": 12_600_000,
            },
            "OSK-003": {
                "revenue": 9_800_000,
                "customers": 4_300,
                "repeat_rate": 59.1,
                "utilization_rate": 74.3,
                "ad_cpa": 7_200,
                "prev_month_revenue": 10_000_000,
                "prev_year_revenue": 8_900_000,
            },
            "MFG-JP": {
                "revenue": 15_300_000,
                "customers": 0,
                "repeat_rate": 0,
                "utilization_rate": 0,
                "ad_cpa": 0,
                "prev_month_revenue": 14_900_000,
                "prev_year_revenue": 14_000_000,
            },
        }

    def list_stores(
        self,
        type_: StoreType | None = None,
        area: str | None = None,
        manager: str | None = None,
        business_unit: str | None = None,
    ) -> list[Store]:
        result = []
        for store in self.stores:
            if type_ and store.type != type_:
                continue
            if area and store.area != area:
                continue
            if manager and store.manager != manager:
                continue
            if business_unit and store.business_unit != business_unit:
                continue
            result.append(store)
        return result

    def create_store(self, payload: Store) -> Store:
        self.stores.insert(0, payload)
        self.record_audit(
            user_email="system@salonops.example.com",
            action="STORE_CREATED",
            resource="store",
            resource_id=payload.id,
            detail=f"{payload.code} created",
        )
        return payload

    def update_store(self, store_id: str, patch: dict) -> Store | None:
        for idx, store in enumerate(self.stores):
            if store.id != store_id:
                continue
            updated = store.model_copy(update=patch)
            self.stores[idx] = updated
            self.record_audit(
                user_email="system@salonops.example.com",
                action="STORE_UPDATED",
                resource="store",
                resource_id=store_id,
                detail=f"{updated.code} updated",
            )
            return updated
        return None

    def list_kpi_defs(self) -> list[KpiDef]:
        return self.kpi_defs

    def create_kpi_def(self, payload: KpiDef) -> KpiDef:
        self.kpi_defs.insert(0, payload)
        self.record_audit(
            user_email="system@salonops.example.com",
            action="KPI_CREATED",
            resource="kpi_def",
            resource_id=payload.id,
            detail=payload.key,
        )
        return payload

    def update_kpi_def(self, kpi_id: str, patch: dict) -> KpiDef | None:
        for idx, kpi in enumerate(self.kpi_defs):
            if kpi.id != kpi_id:
                continue
            updated = kpi.model_copy(update=patch)
            self.kpi_defs[idx] = updated
            self.record_audit(
                user_email="system@salonops.example.com",
                action="KPI_UPDATED",
                resource="kpi_def",
                resource_id=kpi_id,
                detail=updated.key,
            )
            return updated
        return None

    def create_import_job(
        self,
        file_name: str,
        total_rows: int,
        valid_rows: int,
        errors: list[ImportError],
    ) -> ImportJob:
        job = ImportJob(
            id=_id("imp"),
            file_name=file_name,
            status=ImportStatus.FAILED if errors else ImportStatus.SUCCESS,
            created_at=_now(),
            total_rows=total_rows,
            valid_rows=valid_rows,
            errors=errors,
        )
        self.import_jobs.insert(0, job)
        self.record_audit(
            user_email="system@salonops.example.com",
            action="IMPORT_EXECUTED",
            resource="sales_import",
            resource_id=job.id,
            detail=f"{file_name} rows={total_rows}",
        )
        return job

    def get_import_job(self, import_id: str) -> ImportJob | None:
        for job in self.import_jobs:
            if job.id == import_id:
                return job
        return None

    def get_summary(
        self,
        scope: Scope,
        period: Period,
        from_date: date,
        to_date: date,
        store_code: str | None = None,
        store_type: StoreType | None = None,
        area: str | None = None,
    ) -> KpiSummary:
        stores = self.list_stores(type_=store_type, area=area)
        if store_code:
            stores = [s for s in stores if s.code == store_code]

        revenue_target = next((k.target for k in self.kpi_defs if k.key == "revenue"), 12_000_000)
        threshold = next((k.alert_threshold for k in self.kpi_defs if k.key == "revenue"), 0.15)

        items: list[KpiSummaryItem] = []
        total_revenue = 0.0
        total_customers = 0
        repeat = []
        util = []
        cpa = []

        for store in stores:
            perf = self.performance.get(store.code, None)
            if not perf:
                continue

            total_revenue += perf["revenue"]
            total_customers += int(perf["customers"])
            if perf["repeat_rate"] > 0:
                repeat.append(perf["repeat_rate"])
            if perf["utilization_rate"] > 0:
                util.append(perf["utilization_rate"])
            if perf["ad_cpa"] > 0:
                cpa.append(perf["ad_cpa"])

            actual = float(perf["revenue"])
            items.append(
                KpiSummaryItem(
                    store_code=store.code,
                    metric_key="revenue",
                    actual=actual,
                    target=revenue_target,
                    diff_prev_month=actual - float(perf["prev_month_revenue"]),
                    diff_prev_year=actual - float(perf["prev_year_revenue"]),
                    alert=actual < revenue_target * (1 - threshold),
                )
            )

        def avg(values: list[float]) -> float:
            return sum(values) / len(values) if values else 0.0

        return KpiSummary(
            scope=scope,
            period=period,
            from_date=from_date,
            to_date=to_date,
            total_revenue=total_revenue,
            customer_count=total_customers,
            repeat_rate=avg(repeat),
            utilization_rate=avg(util),
            ad_cpa=avg(cpa),
            items=items,
        )

    def get_trends(
        self,
        from_date: date,
        to_date: date,
        _store_type: StoreType | None,
        _area: str | None,
    ) -> list[KpiTrendPoint]:
        points: list[KpiTrendPoint] = []
        cursor = from_date
        step = max((to_date - from_date).days // 5, 1)
        while cursor <= to_date and len(points) < 6:
            points.append(
                KpiTrendPoint(
                    date=cursor,
                    revenue=52_000_000 + len(points) * 1_700_000,
                    customers=17_400 + len(points) * 290,
                )
            )
            cursor += timedelta(days=step)
        return points

    def list_alerts(self, summary: KpiSummary) -> list[Alert]:
        return [
            Alert(
                store_code=item.store_code,
                severity="high",
                message=f"売上が閾値を下回っています（実績 {item.actual:,.0f}）",
            )
            for item in summary.items
            if item.alert
        ]

    def create_report(self, report: Report) -> Report:
        self.reports.insert(0, report)
        self.record_audit(
            user_email="system@salonops.example.com",
            action="REPORT_GENERATED",
            resource="report",
            resource_id=report.id,
            detail=f"{report.scope}:{report.period}",
        )
        return report

    def list_reports(self) -> list[Report]:
        return self.reports

    def get_report(self, report_id: str) -> Report | None:
        for report in self.reports:
            if report.id == report_id:
                return report
        return None

    def send_report(self, report_id: str) -> Report | None:
        for idx, report in enumerate(self.reports):
            if report.id != report_id:
                continue
            sent = report.model_copy(update={"status": ReportStatus.SENT, "updated_at": _now()})
            self.reports[idx] = sent
            self.record_audit(
                user_email="system@salonops.example.com",
                action="REPORT_SENT",
                resource="report",
                resource_id=report_id,
                detail="manual resend",
            )
            return sent
        return None

    def list_audit_logs(
        self,
        from_date: date | None = None,
        to_date: date | None = None,
        user: str | None = None,
        action: str | None = None,
    ) -> list[AuditLog]:
        result = []
        for log in self.audit_logs:
            if from_date and log.at.date() < from_date:
                continue
            if to_date and log.at.date() > to_date:
                continue
            if user and user not in log.user_email:
                continue
            if action and action != log.action:
                continue
            result.append(log)
        return result

    def record_audit(
        self,
        user_email: str,
        action: str,
        resource: str,
        resource_id: str,
        detail: str,
    ) -> AuditLog:
        log = AuditLog(
            id=_id("audit"),
            at=_now(),
            user_email=user_email,
            action=action,
            resource=resource,
            resource_id=resource_id,
            detail=detail,
        )
        self.audit_logs.insert(0, log)
        return log


repo = InMemoryRepository()


def build_report(scope: Scope, period: Period, from_date: date, to_date: date, recipients: list[str]) -> Report:
    return Report(
        id=_id("rep"),
        scope=scope,
        period=period,
        from_date=from_date,
        to_date=to_date,
        recipients=recipients,
        status=ReportStatus.GENERATED,
        file_url=f"https://example.com/reports/{uuid4().hex}.pdf",
        created_at=_now(),
        updated_at=_now(),
    )
