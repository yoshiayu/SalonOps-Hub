"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function AuditView() {
  const [filters, setFilters] = useState({
    from: "2026-02-01",
    to: "2026-02-21",
    user: "",
    action: ""
  });
  const [submittedFilters, setSubmittedFilters] = useState(filters);

  const logsQuery = useQuery({
    queryKey: ["audit-logs", submittedFilters],
    queryFn: () =>
      fetchAuditLogs({
        from: submittedFilters.from || undefined,
        to: submittedFilters.to || undefined,
        user: submittedFilters.user || undefined,
        action: submittedFilters.action || undefined
      })
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">監査ログ</h2>
        <p className="text-sm text-zinc-400">誰がいつ何を変更したかを追跡します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索条件</CardTitle>
          <CardDescription>未指定項目は絞り込みません。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Field label="From">
            <Input
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
            />
          </Field>
          <Field label="To">
            <Input
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
            />
          </Field>
          <Field label="User">
            <Input
              value={filters.user}
              onChange={(event) => setFilters((prev) => ({ ...prev, user: event.target.value }))}
            />
          </Field>
          <Field label="Action">
            <Input
              value={filters.action}
              onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))}
            />
          </Field>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => setSubmittedFilters(filters)}>
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>検索結果</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>At</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsQuery.data?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.at}</TableCell>
                  <TableCell>{log.userEmail}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    {log.resource}:{log.resourceId}
                  </TableCell>
                  <TableCell>{log.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
