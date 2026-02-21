"use client";

import { useState, useTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { generateReportAction } from "@/app/reports/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { fetchReports } from "@/lib/api/client";
import type { Period, Scope } from "@/lib/types";

export function ReportsView() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [scope, setScope] = useState<Scope>("company");
  const [period, setPeriod] = useState<Period>("weekly");
  const [from, setFrom] = useState("2026-02-01");
  const [to, setTo] = useState("2026-02-21");
  const [recipients, setRecipients] = useState("ops@salonops.local, board@salonops.local");
  const [actionMessage, setActionMessage] = useState("");

  const reportsQuery = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports
  });

  const sendMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/reports/${reportId}/send`, {
        method: "POST",
        headers: {
          "x-role": "Manager"
        }
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setActionMessage("レポートを再送しました。");
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">レポート生成 / 履歴</h2>
        <p className="text-sm text-zinc-400">Server Actionで生成し、履歴はReact Queryで再取得します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>週次 / 月次レポート生成</CardTitle>
          <CardDescription>Google Docs/PDF化を想定したジョブを発行します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Field label="Scope">
            <Select
              value={scope}
              options={[
                { label: "company", value: "company" },
                { label: "biz", value: "biz" },
                { label: "store", value: "store" }
              ]}
              onChange={(event) => setScope(event.target.value as Scope)}
            />
          </Field>
          <Field label="Period">
            <Select
              value={period}
              options={[
                { label: "weekly", value: "weekly" },
                { label: "monthly", value: "monthly" },
                { label: "quarterly", value: "quarterly" },
                { label: "yearly", value: "yearly" }
              ]}
              onChange={(event) => setPeriod(event.target.value as Period)}
            />
          </Field>
          <Field label="Recipients(comma)">
            <Input value={recipients} onChange={(event) => setRecipients(event.target.value)} />
          </Field>
          <Field label="From">
            <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </Field>
          <Field label="To">
            <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={() => {
                startTransition(async () => {
                  const result = await generateReportAction({
                    scope,
                    period,
                    from,
                    to,
                    recipients: recipients
                      .split(",")
                      .map((email) => email.trim())
                      .filter(Boolean)
                  });
                  setActionMessage(`レポートを生成しました: ${result.id}`);
                  queryClient.invalidateQueries({ queryKey: ["reports"] });
                });
              }}
              disabled={isPending}
            >
              生成実行
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionMessage ? <p className="text-sm text-emerald-300">{actionMessage}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>ジョブ履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsQuery.data?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>{report.scope}</TableCell>
                  <TableCell>{report.period}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell className="max-w-[280px] truncate">{report.recipients.join(", ")}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => sendMutation.mutate(report.id)}
                      disabled={sendMutation.isPending}
                    >
                      再送
                    </Button>
                  </TableCell>
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
