from __future__ import annotations

from datetime import datetime, date
from enum import Enum
from pydantic import BaseModel, EmailStr, Field


class Role(str, Enum):
    ADMIN = "Admin"
    MANAGER = "Manager"
    STAFF = "Staff"
    VIEWER = "Viewer"


class Scope(str, Enum):
    COMPANY = "company"
    BIZ = "biz"
    STORE = "store"


class Period(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class StoreType(str, Enum):
    DIRECT = "DIRECT"
    FC = "FC"


class ReportStatus(str, Enum):
    QUEUED = "queued"
    GENERATED = "generated"
    SENT = "sent"
    FAILED = "failed"


class ImportStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class AppUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    scope: Scope


class Store(BaseModel):
    id: str
    code: str
    name: str
    type: StoreType
    area: str
    manager: str
    business_unit: str


class StoreCreate(BaseModel):
    code: str = Field(min_length=2)
    name: str
    type: StoreType
    area: str
    manager: str
    business_unit: str


class StoreUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    type: StoreType | None = None
    area: str | None = None
    manager: str | None = None
    business_unit: str | None = None


class KpiDef(BaseModel):
    id: str
    key: str
    name: str
    unit: str
    target: float
    alert_threshold: float


class KpiDefCreate(BaseModel):
    key: str
    name: str
    unit: str
    target: float = Field(ge=0)
    alert_threshold: float = Field(ge=0, le=1)


class KpiDefUpdate(BaseModel):
    key: str | None = None
    name: str | None = None
    unit: str | None = None
    target: float | None = Field(default=None, ge=0)
    alert_threshold: float | None = Field(default=None, ge=0, le=1)


class ImportError(BaseModel):
    row: int
    column: str
    reason: str
    fix: str


class ImportJob(BaseModel):
    id: str
    file_name: str
    status: ImportStatus
    created_at: datetime
    total_rows: int
    valid_rows: int
    errors: list[ImportError]


class KpiSummaryItem(BaseModel):
    store_code: str
    metric_key: str
    actual: float
    target: float
    diff_prev_month: float
    diff_prev_year: float
    alert: bool


class KpiSummary(BaseModel):
    scope: Scope
    period: Period
    from_date: date
    to_date: date
    total_revenue: float
    customer_count: int
    repeat_rate: float
    utilization_rate: float
    ad_cpa: float
    items: list[KpiSummaryItem]


class KpiTrendPoint(BaseModel):
    date: date
    revenue: float
    customers: int


class Alert(BaseModel):
    store_code: str
    severity: str
    message: str


class Report(BaseModel):
    id: str
    scope: Scope
    period: Period
    from_date: date
    to_date: date
    recipients: list[EmailStr]
    status: ReportStatus
    file_url: str | None
    created_at: datetime
    updated_at: datetime


class ReportGenerateRequest(BaseModel):
    scope: Scope
    period: Period
    from_date: date
    to_date: date
    recipients: list[EmailStr]


class AuditLog(BaseModel):
    id: str
    at: datetime
    user_email: EmailStr
    action: str
    resource: str
    resource_id: str
    detail: str


class BulkItemUpdateRequest(BaseModel):
    ids: list[str]
    status: str
