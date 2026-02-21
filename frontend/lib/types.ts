export const roleValues = ["Admin", "Manager", "Staff", "Viewer"] as const;
export type Role = (typeof roleValues)[number];

export const storeTypeValues = ["DIRECT", "FC"] as const;
export type StoreType = (typeof storeTypeValues)[number];

export const scopeValues = ["company", "biz", "store"] as const;
export type Scope = (typeof scopeValues)[number];

export const periodValues = ["weekly", "monthly", "quarterly", "yearly"] as const;
export type Period = (typeof periodValues)[number];

export const importStatusValues = ["pending", "success", "failed"] as const;
export type ImportStatus = (typeof importStatusValues)[number];

export const reportStatusValues = ["queued", "generated", "sent", "failed"] as const;
export type ReportStatus = (typeof reportStatusValues)[number];

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  scope: Scope;
}

export interface Store {
  id: string;
  code: string;
  name: string;
  type: StoreType;
  area: string;
  manager: string;
  businessUnit: string;
}

export interface KpiDefinition {
  id: string;
  key: string;
  name: string;
  unit: "JPY" | "count" | "percent";
  target: number;
  alertThreshold: number;
}

export interface KpiSummaryItem {
  storeCode: string;
  metricKey: string;
  actual: number;
  target: number;
  diffPrevMonth: number;
  diffPrevYear: number;
  alert: boolean;
}

export interface KpiSummary {
  scope: Scope;
  period: Period;
  from: string;
  to: string;
  totalRevenue: number;
  customerCount: number;
  repeatRate: number;
  utilizationRate: number;
  adCpa: number;
  items: KpiSummaryItem[];
}

export interface ImportError {
  row: number;
  column: string;
  reason: string;
  fix: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  status: ImportStatus;
  createdAt: string;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
}

export interface ReportJob {
  id: string;
  scope: Scope;
  period: Period;
  from: string;
  to: string;
  recipients: string[];
  status: ReportStatus;
  fileUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  at: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  detail: string;
}

export interface ItemRecord {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done";
  owner: string;
  tag: string;
  updatedAt: string;
  history: string[];
}

export interface KpiTrendPoint {
  date: string;
  revenue: number;
  customers: number;
}
