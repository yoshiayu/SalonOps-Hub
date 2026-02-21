"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, TrendingUp, Users } from "lucide-react";
import { fetchKpiSummary, fetchKpiTrends, fetchStores } from "@/lib/api/client";
import type { Period, Scope, StoreType } from "@/lib/types";
import { toCurrency, toPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const periodOptions: Array<{ label: string; value: Period }> = [
  { label: "週次", value: "weekly" },
  { label: "月次", value: "monthly" },
  { label: "四半期", value: "quarterly" },
  { label: "年次", value: "yearly" }
];

const scopeOptions: Array<{ label: string; value: Scope }> = [
  { label: "全社", value: "company" },
  { label: "事業", value: "biz" },
  { label: "店舗", value: "store" }
];

const storeTypeOptions: Array<{ label: string; value: "" | StoreType }> = [
  { label: "すべて", value: "" },
  { label: "直営", value: "DIRECT" },
  { label: "FC", value: "FC" }
];

export function DashboardView() {
  const [scope, setScope] = useState<Scope>("company");
  const [period, setPeriod] = useState<Period>("monthly");
  const [type, setType] = useState<"" | StoreType>("");
  const [from, setFrom] = useState("2026-02-01");
  const [to, setTo] = useState("2026-02-21");

  const summaryQuery = useQuery({
    queryKey: ["kpi-summary", scope, period, from, to, type],
    queryFn: () =>
      fetchKpiSummary({
        scope,
        period,
        from,
        to,
        type: type || undefined
      })
  });

  const trendsQuery = useQuery({
    queryKey: ["kpi-trends", from, to, type],
    queryFn: () =>
      fetchKpiTrends({
        from,
        to,
        type: type || undefined
      })
  });

  const storesQuery = useQuery({
    queryKey: ["stores", type],
    queryFn: () => fetchStores({ type: type || undefined })
  });

  const alertCount = useMemo(
    () => summaryQuery.data?.items.filter((item) => item.alert).length ?? 0,
    [summaryQuery.data]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">KPIダッシュボード</h2>
        <p className="text-sm text-zinc-400">
          19店舗 + メーカー/OEM の横断KPIを同一指標で比較します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>フィルタ</CardTitle>
          <CardDescription>未指定項目はフィルタ適用なしで集計します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-1">
            <Label>Scope</Label>
            <Select
              value={scope}
              options={scopeOptions}
              onChange={(event) => setScope(event.target.value as Scope)}
            />
          </div>
          <div className="space-y-1">
            <Label>Period</Label>
            <Select
              value={period}
              options={periodOptions}
              onChange={(event) => setPeriod(event.target.value as Period)}
            />
          </div>
          <div className="space-y-1">
            <Label>Store Type</Label>
            <Select
              value={type}
              options={storeTypeOptions}
              onChange={(event) => setType(event.target.value as "" | StoreType)}
            />
          </div>
          <div className="space-y-1">
            <Label>From</Label>
            <input
              type="date"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>To</Label>
            <input
              type="date"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>対象店舗数</Label>
            <div className="flex h-10 items-center rounded-md border border-input bg-background px-3 text-sm">
              {storesQuery.data?.length ?? 0}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="売上" value={toCurrency(summaryQuery.data?.totalRevenue ?? 0)} icon={TrendingUp} />
        <MetricCard label="客数" value={(summaryQuery.data?.customerCount ?? 0).toLocaleString()} icon={Users} />
        <MetricCard label="リピート率" value={toPercent(summaryQuery.data?.repeatRate ?? 0)} />
        <MetricCard label="稼働率" value={toPercent(summaryQuery.data?.utilizationRate ?? 0)} />
        <MetricCard label="アラート" value={String(alertCount)} icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>目標 vs 実績（売上）</CardTitle>
          <CardDescription>前年差・前月差・異常検知を一覧表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>店舗</TableHead>
                <TableHead>実績</TableHead>
                <TableHead>目標</TableHead>
                <TableHead>前月差</TableHead>
                <TableHead>前年差</TableHead>
                <TableHead>判定</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryQuery.data?.items.map((row) => (
                <TableRow key={row.storeCode}>
                  <TableCell>{row.storeCode}</TableCell>
                  <TableCell>{toCurrency(row.actual)}</TableCell>
                  <TableCell>{toCurrency(row.target)}</TableCell>
                  <TableCell className={row.diffPrevMonth >= 0 ? "text-emerald-300" : "text-red-300"}>
                    {toCurrency(row.diffPrevMonth)}
                  </TableCell>
                  <TableCell className={row.diffPrevYear >= 0 ? "text-emerald-300" : "text-red-300"}>
                    {toCurrency(row.diffPrevYear)}
                  </TableCell>
                  <TableCell>
                    {row.alert ? <Badge variant="danger">異常</Badge> : <Badge variant="success">正常</Badge>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>トレンド</CardTitle>
          <CardDescription>簡易時系列（売上/客数）</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>売上</TableHead>
                <TableHead>客数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trendsQuery.data?.map((point) => (
                <TableRow key={point.date}>
                  <TableCell>{point.date}</TableCell>
                  <TableCell>{toCurrency(point.revenue)}</TableCell>
                  <TableCell>{point.customers.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center justify-between">
          {label}
          {Icon ? <Icon className="h-4 w-4 text-emerald-300" /> : null}
        </CardDescription>
        <CardTitle className="text-xl text-white">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
