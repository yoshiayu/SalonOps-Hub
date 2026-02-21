import {
  seedAuditLogs,
  seedItems,
  seedKpiDefs,
  seedReports,
  seedStores
} from "@/lib/mocks/data";
import type {
  AuditLog,
  ImportError,
  ImportJob,
  ItemRecord,
  KpiDefinition,
  KpiSummary,
  KpiTrendPoint,
  Period,
  ReportJob,
  Scope,
  Store,
  StoreType
} from "@/lib/types";

interface StorePerformance {
  revenue: number;
  customers: number;
  repeatRate: number;
  utilizationRate: number;
  adCpa: number;
  prevMonthRevenue: number;
  prevYearRevenue: number;
}

const performance: Record<string, StorePerformance> = {
  "TKY-001": {
    revenue: 13800000,
    customers: 5800,
    repeatRate: 66.2,
    utilizationRate: 81.4,
    adCpa: 6400,
    prevMonthRevenue: 13100000,
    prevYearRevenue: 12600000
  },
  "OSK-003": {
    revenue: 9800000,
    customers: 4300,
    repeatRate: 59.1,
    utilizationRate: 74.3,
    adCpa: 7200,
    prevMonthRevenue: 10000000,
    prevYearRevenue: 8900000
  },
  "NGY-002": {
    revenue: 11200000,
    customers: 5100,
    repeatRate: 62.7,
    utilizationRate: 77.2,
    adCpa: 6800,
    prevMonthRevenue: 10600000,
    prevYearRevenue: 9800000
  },
  "MFG-JP": {
    revenue: 15300000,
    customers: 0,
    repeatRate: 0,
    utilizationRate: 0,
    adCpa: 0,
    prevMonthRevenue: 14900000,
    prevYearRevenue: 14000000
  },
  "OEM-SEA": {
    revenue: 12400000,
    customers: 0,
    repeatRate: 0,
    utilizationRate: 0,
    adCpa: 0,
    prevMonthRevenue: 12100000,
    prevYearRevenue: 10900000
  }
};

let stores = structuredClone(seedStores);
let kpiDefs = structuredClone(seedKpiDefs);
let importJobs: ImportJob[] = [];
let reports = structuredClone(seedReports);
let auditLogs = structuredClone(seedAuditLogs);
let items = structuredClone(seedItems);

function nowIso(): string {
  return new Date().toISOString();
}

function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listStores(filters?: {
  type?: StoreType;
  area?: string;
  manager?: string;
  businessUnit?: string;
}): Store[] {
  return stores.filter((store) => {
    if (filters?.type && store.type !== filters.type) {
      return false;
    }
    if (filters?.area && store.area !== filters.area) {
      return false;
    }
    if (filters?.manager && store.manager !== filters.manager) {
      return false;
    }
    if (filters?.businessUnit && store.businessUnit !== filters.businessUnit) {
      return false;
    }
    return true;
  });
}

export function createStore(payload: Omit<Store, "id">): Store {
  const store: Store = {
    ...payload,
    id: nextId("store")
  };
  stores = [store, ...stores];
  recordAudit({
    userEmail: "system@salonops.local",
    action: "STORE_CREATED",
    resource: "store",
    resourceId: store.id,
    detail: `${store.code} ${store.name}`
  });
  return store;
}

export function updateStore(
  storeId: string,
  payload: Partial<Omit<Store, "id">>
): Store | null {
  const idx = stores.findIndex((store) => store.id === storeId);
  if (idx < 0) {
    return null;
  }
  const updated: Store = {
    ...stores[idx],
    ...payload
  };
  stores[idx] = updated;
  recordAudit({
    userEmail: "system@salonops.local",
    action: "STORE_UPDATED",
    resource: "store",
    resourceId: updated.id,
    detail: `${updated.code} updated`
  });
  return updated;
}

export function listKpiDefs(): KpiDefinition[] {
  return kpiDefs;
}

export function createKpiDef(payload: Omit<KpiDefinition, "id">): KpiDefinition {
  const record: KpiDefinition = {
    ...payload,
    id: nextId("kpi")
  };
  kpiDefs = [record, ...kpiDefs];
  recordAudit({
    userEmail: "system@salonops.local",
    action: "KPI_CREATED",
    resource: "kpi_definition",
    resourceId: record.id,
    detail: `${record.key} created`
  });
  return record;
}

export function updateKpiDef(
  kpiId: string,
  payload: Partial<Omit<KpiDefinition, "id">>
): KpiDefinition | null {
  const idx = kpiDefs.findIndex((kpi) => kpi.id === kpiId);
  if (idx < 0) {
    return null;
  }
  const updated: KpiDefinition = {
    ...kpiDefs[idx],
    ...payload
  };
  kpiDefs[idx] = updated;
  recordAudit({
    userEmail: "system@salonops.local",
    action: "KPI_UPDATED",
    resource: "kpi_definition",
    resourceId: updated.id,
    detail: `${updated.key} updated`
  });
  return updated;
}

export function createImportJob(params: {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: ImportError[];
}): ImportJob {
  const importJob: ImportJob = {
    id: nextId("imp"),
    fileName: params.fileName,
    status: params.errors.length > 0 ? "failed" : "success",
    createdAt: nowIso(),
    totalRows: params.totalRows,
    validRows: params.validRows,
    errors: params.errors
  };
  importJobs = [importJob, ...importJobs];
  recordAudit({
    userEmail: "system@salonops.local",
    action: "IMPORT_EXECUTED",
    resource: "sales_import",
    resourceId: importJob.id,
    detail: `${importJob.fileName} rows=${params.totalRows}`
  });
  return importJob;
}

export function getImportJob(importId: string): ImportJob | null {
  return importJobs.find((job) => job.id === importId) ?? null;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((acc, cur) => acc + cur, 0) / values.length;
}

export function getKpiSummary(params: {
  scope: Scope;
  period: Period;
  from: string;
  to: string;
  storeCode?: string;
  type?: StoreType;
  area?: string;
}): KpiSummary {
  const filteredStores = stores.filter((store) => {
    if (params.storeCode && store.code !== params.storeCode) {
      return false;
    }
    if (params.type && store.type !== params.type) {
      return false;
    }
    if (params.area && store.area !== params.area) {
      return false;
    }
    return true;
  });

  const metrics = filteredStores.map((store) => performance[store.code]).filter(Boolean);
  const revenueTarget = kpiDefs.find((kpi) => kpi.key === "revenue")?.target ?? 12000000;
  const threshold = kpiDefs.find((kpi) => kpi.key === "revenue")?.alertThreshold ?? 0.15;

  const items = filteredStores.map((store) => {
    const metric = performance[store.code];
    const actual = metric?.revenue ?? 0;
    return {
      storeCode: store.code,
      metricKey: "revenue",
      actual,
      target: revenueTarget,
      diffPrevMonth: actual - (metric?.prevMonthRevenue ?? 0),
      diffPrevYear: actual - (metric?.prevYearRevenue ?? 0),
      alert: actual < revenueTarget * (1 - threshold)
    };
  });

  return {
    scope: params.scope,
    period: params.period,
    from: params.from,
    to: params.to,
    totalRevenue: metrics.reduce((acc, cur) => acc + cur.revenue, 0),
    customerCount: metrics.reduce((acc, cur) => acc + cur.customers, 0),
    repeatRate: average(metrics.map((cur) => cur.repeatRate).filter((v) => v > 0)),
    utilizationRate: average(metrics.map((cur) => cur.utilizationRate).filter((v) => v > 0)),
    adCpa: average(metrics.map((cur) => cur.adCpa).filter((v) => v > 0)),
    items
  };
}

export function getKpiTrends(params: {
  from: string;
  to: string;
  type?: StoreType;
  area?: string;
}): KpiTrendPoint[] {
  const start = new Date(params.from);
  const points: KpiTrendPoint[] = [];
  for (let i = 0; i < 6; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i * 5);
    points.push({
      date: date.toISOString().slice(0, 10),
      revenue: 52000000 + i * 1700000,
      customers: 17400 + i * 290
    });
  }
  return points;
}

export function listAlerts(params: {
  scope: Scope;
  period: Period;
  from: string;
  to: string;
}): Array<{
  storeCode: string;
  severity: "high" | "medium";
  message: string;
}> {
  const summary = getKpiSummary(params);
  return summary.items
    .filter((item) => item.alert)
    .map((item) => ({
      storeCode: item.storeCode,
      severity: "high" as const,
      message: `売上が閾値を下回っています（実績 ${item.actual.toLocaleString()}）`
    }));
}

export function listReports(): ReportJob[] {
  return reports;
}

export function createReport(params: {
  scope: Scope;
  period: Period;
  from: string;
  to: string;
  recipients: string[];
}): ReportJob {
  const report: ReportJob = {
    id: nextId("rep"),
    scope: params.scope,
    period: params.period,
    from: params.from,
    to: params.to,
    recipients: params.recipients,
    status: "generated",
    fileUrl: `https://example.com/reports/${Date.now()}.pdf`,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  reports = [report, ...reports];
  recordAudit({
    userEmail: "system@salonops.local",
    action: "REPORT_GENERATED",
    resource: "report",
    resourceId: report.id,
    detail: `${report.scope}:${report.period}`
  });
  return report;
}

export function getReport(reportId: string): ReportJob | null {
  return reports.find((report) => report.id === reportId) ?? null;
}

export function sendReport(reportId: string): ReportJob | null {
  const report = reports.find((item) => item.id === reportId);
  if (!report) {
    return null;
  }
  report.status = "sent";
  report.updatedAt = nowIso();
  recordAudit({
    userEmail: "system@salonops.local",
    action: "REPORT_SENT",
    resource: "report",
    resourceId: report.id,
    detail: `sent to ${report.recipients.join(",")}`
  });
  return report;
}

export function listAuditLogs(filters?: {
  from?: string;
  to?: string;
  user?: string;
  action?: string;
}): AuditLog[] {
  return auditLogs.filter((log) => {
    if (filters?.from && log.at < `${filters.from}T00:00:00.000Z`) {
      return false;
    }
    if (filters?.to && log.at > `${filters.to}T23:59:59.999Z`) {
      return false;
    }
    if (filters?.user && !log.userEmail.includes(filters.user)) {
      return false;
    }
    if (filters?.action && log.action !== filters.action) {
      return false;
    }
    return true;
  });
}

export function recordAudit(payload: {
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  detail: string;
}): AuditLog {
  const log: AuditLog = {
    id: nextId("audit"),
    at: nowIso(),
    ...payload
  };
  auditLogs = [log, ...auditLogs];
  return log;
}

export function listItems(params?: {
  q?: string;
  status?: ItemRecord["status"];
  tag?: string;
}): ItemRecord[] {
  return items.filter((item) => {
    if (params?.q && !item.title.toLowerCase().includes(params.q.toLowerCase())) {
      return false;
    }
    if (params?.status && item.status !== params.status) {
      return false;
    }
    if (params?.tag && item.tag !== params.tag) {
      return false;
    }
    return true;
  });
}

export function getItem(itemId: string): ItemRecord | null {
  return items.find((item) => item.id === itemId) ?? null;
}

export function bulkUpdateItems(itemIds: string[], status: ItemRecord["status"]): number {
  let updated = 0;
  items = items.map((item) => {
    if (!itemIds.includes(item.id)) {
      return item;
    }
    updated += 1;
    return {
      ...item,
      status,
      updatedAt: nowIso(),
      history: [...item.history, `Status updated to ${status}`]
    };
  });
  recordAudit({
    userEmail: "system@salonops.local",
    action: "ITEM_BULK_UPDATED",
    resource: "item",
    resourceId: itemIds.join(","),
    detail: `${updated} items set to ${status}`
  });
  return updated;
}
