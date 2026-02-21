import type {
  AuditLog,
  ItemRecord,
  KpiDefinition,
  ReportJob,
  Store
} from "@/lib/types";

export const seedStores: Store[] = [
  {
    id: "store-1",
    code: "TKY-001",
    name: "SalonOps Tokyo Central",
    type: "DIRECT",
    area: "Kanto",
    manager: "Sato",
    businessUnit: "Salon"
  },
  {
    id: "store-2",
    code: "OSK-003",
    name: "SalonOps Osaka Umeda",
    type: "FC",
    area: "Kansai",
    manager: "Yamada",
    businessUnit: "Salon"
  },
  {
    id: "store-3",
    code: "NGY-002",
    name: "SalonOps Nagoya Sakae",
    type: "DIRECT",
    area: "Chubu",
    manager: "Tanaka",
    businessUnit: "Salon"
  },
  {
    id: "store-4",
    code: "MFG-JP",
    name: "Manufacturer Japan",
    type: "DIRECT",
    area: "HQ",
    manager: "Kobayashi",
    businessUnit: "Manufacturer"
  },
  {
    id: "store-5",
    code: "OEM-SEA",
    name: "OEM Southeast Asia",
    type: "FC",
    area: "Global",
    manager: "Suzuki",
    businessUnit: "OEM"
  }
];

export const seedKpiDefs: KpiDefinition[] = [
  {
    id: "kpi-revenue",
    key: "revenue",
    name: "売上",
    unit: "JPY",
    target: 12000000,
    alertThreshold: 0.15
  },
  {
    id: "kpi-customers",
    key: "customers",
    name: "客数",
    unit: "count",
    target: 5400,
    alertThreshold: 0.2
  },
  {
    id: "kpi-repeat-rate",
    key: "repeat_rate",
    name: "リピート率",
    unit: "percent",
    target: 63,
    alertThreshold: 0.08
  },
  {
    id: "kpi-utilization",
    key: "utilization",
    name: "稼働率",
    unit: "percent",
    target: 77,
    alertThreshold: 0.1
  },
  {
    id: "kpi-ad-cpa",
    key: "ad_cpa",
    name: "広告CPA",
    unit: "JPY",
    target: 6800,
    alertThreshold: 0.18
  }
];

export const seedAuditLogs: AuditLog[] = [
  {
    id: "audit-1",
    at: "2026-02-20T09:30:00.000Z",
    userEmail: "manager@salonops.local",
    action: "IMPORT_EXECUTED",
    resource: "sales_import",
    resourceId: "imp-101",
    detail: "2 stores imported. 3 rows rejected."
  },
  {
    id: "audit-2",
    at: "2026-02-20T11:10:00.000Z",
    userEmail: "admin@salonops.local",
    action: "KPI_THRESHOLD_UPDATED",
    resource: "kpi_definition",
    resourceId: "kpi-revenue",
    detail: "Revenue threshold changed from 0.12 to 0.15"
  },
  {
    id: "audit-3",
    at: "2026-02-21T00:10:00.000Z",
    userEmail: "ops@salonops.local",
    action: "REPORT_SENT",
    resource: "report",
    resourceId: "rep-5",
    detail: "Weekly report sent to 8 recipients"
  }
];

export const seedReports: ReportJob[] = [
  {
    id: "rep-5",
    scope: "company",
    period: "weekly",
    from: "2026-02-10",
    to: "2026-02-16",
    recipients: ["board@salonops.local", "ops@salonops.local"],
    status: "sent",
    fileUrl: "https://example.com/reports/rep-5.pdf",
    createdAt: "2026-02-17T00:10:00.000Z",
    updatedAt: "2026-02-17T00:11:00.000Z"
  },
  {
    id: "rep-6",
    scope: "biz",
    period: "monthly",
    from: "2026-01-01",
    to: "2026-01-31",
    recipients: ["manager@salonops.local"],
    status: "generated",
    fileUrl: "https://example.com/reports/rep-6.pdf",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:03:00.000Z"
  }
];

export const seedItems: ItemRecord[] = [
  {
    id: "item-1",
    title: "月次広告費の異常値レビュー",
    status: "open",
    owner: "Yamada",
    tag: "alert",
    updatedAt: "2026-02-20T08:00:00.000Z",
    history: ["Issue created", "Owner assigned"]
  },
  {
    id: "item-2",
    title: "FC店舗のCSVテンプレ更新",
    status: "in_progress",
    owner: "Sato",
    tag: "import",
    updatedAt: "2026-02-21T02:30:00.000Z",
    history: ["Template design complete", "Validation rule draft"]
  },
  {
    id: "item-3",
    title: "海外11か国の為替換算レイヤー設計",
    status: "done",
    owner: "Kobayashi",
    tag: "global",
    updatedAt: "2026-02-18T10:45:00.000Z",
    history: ["RFC approved", "Initial rollout complete"]
  }
];
