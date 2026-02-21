import type {
  AuditLog,
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

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchKpiSummary(params: {
  scope: Scope;
  period: Period;
  from: string;
  to: string;
  storeCode?: string;
  type?: StoreType;
  area?: string;
}): Promise<KpiSummary> {
  const searchParams = new URLSearchParams({
    scope: params.scope,
    period: params.period,
    from: params.from,
    to: params.to
  });
  if (params.storeCode) {
    searchParams.set("storeCode", params.storeCode);
  }
  if (params.type) {
    searchParams.set("type", params.type);
  }
  if (params.area) {
    searchParams.set("area", params.area);
  }

  return fetchJson<KpiSummary>(`/api/kpi/summary?${searchParams.toString()}`);
}

export async function fetchKpiTrends(params: {
  from: string;
  to: string;
  type?: StoreType;
  area?: string;
}): Promise<KpiTrendPoint[]> {
  const searchParams = new URLSearchParams({
    from: params.from,
    to: params.to
  });
  if (params.type) {
    searchParams.set("type", params.type);
  }
  if (params.area) {
    searchParams.set("area", params.area);
  }
  return fetchJson<KpiTrendPoint[]>(`/api/kpi/trends?${searchParams.toString()}`);
}

export async function fetchStores(params?: {
  type?: StoreType;
  area?: string;
  manager?: string;
  businessUnit?: string;
}): Promise<Store[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) {
    searchParams.set("type", params.type);
  }
  if (params?.area) {
    searchParams.set("area", params.area);
  }
  if (params?.manager) {
    searchParams.set("manager", params.manager);
  }
  if (params?.businessUnit) {
    searchParams.set("businessUnit", params.businessUnit);
  }

  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  return fetchJson<Store[]>(`/api/masters/stores${suffix}`);
}

export async function fetchKpiDefs(): Promise<KpiDefinition[]> {
  return fetchJson<KpiDefinition[]>("/api/masters/kpi-defs");
}

export async function fetchImport(importId: string): Promise<ImportJob> {
  return fetchJson<ImportJob>(`/api/imports/${importId}`);
}

export async function fetchReports(): Promise<ReportJob[]> {
  return fetchJson<ReportJob[]>("/api/reports");
}

export async function fetchAuditLogs(params?: {
  from?: string;
  to?: string;
  user?: string;
  action?: string;
}): Promise<AuditLog[]> {
  const searchParams = new URLSearchParams();
  if (params?.from) {
    searchParams.set("from", params.from);
  }
  if (params?.to) {
    searchParams.set("to", params.to);
  }
  if (params?.user) {
    searchParams.set("user", params.user);
  }
  if (params?.action) {
    searchParams.set("action", params.action);
  }
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  return fetchJson<AuditLog[]>(`/api/audit/logs${suffix}`);
}

export async function fetchItems(params?: {
  q?: string;
  status?: ItemRecord["status"];
  tag?: string;
}): Promise<ItemRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.q) {
    searchParams.set("q", params.q);
  }
  if (params?.status) {
    searchParams.set("status", params.status);
  }
  if (params?.tag) {
    searchParams.set("tag", params.tag);
  }
  const suffix = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  return fetchJson<ItemRecord[]>(`/api/items${suffix}`);
}

export async function bulkUpdateItems(payload: {
  ids: string[];
  status: ItemRecord["status"];
}): Promise<{ updated: number }> {
  return fetchJson<{ updated: number }>("/api/items/bulk", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
