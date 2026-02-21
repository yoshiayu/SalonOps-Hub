"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchKpiDefs, fetchStores } from "@/lib/api/client";
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

export function MastersView() {
  const queryClient = useQueryClient();
  const [storeForm, setStoreForm] = useState({
    code: "",
    name: "",
    type: "DIRECT",
    area: "",
    manager: "",
    businessUnit: "Salon"
  });
  const [kpiForm, setKpiForm] = useState({
    key: "",
    name: "",
    unit: "JPY",
    target: "",
    alertThreshold: "0.15"
  });

  const storesQuery = useQuery({
    queryKey: ["stores-master"],
    queryFn: () => fetchStores()
  });

  const kpiDefsQuery = useQuery({
    queryKey: ["kpi-defs"],
    queryFn: () => fetchKpiDefs()
  });

  const createStoreMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/masters/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-role": "Admin"
        },
        body: JSON.stringify(storeForm)
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores-master"] });
      setStoreForm({
        code: "",
        name: "",
        type: "DIRECT",
        area: "",
        manager: "",
        businessUnit: "Salon"
      });
    }
  });

  const createKpiMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/masters/kpi-defs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-role": "Admin"
        },
        body: JSON.stringify({
          ...kpiForm,
          target: Number(kpiForm.target),
          alertThreshold: Number(kpiForm.alertThreshold)
        })
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-defs"] });
      setKpiForm({
        key: "",
        name: "",
        unit: "JPY",
        target: "",
        alertThreshold: "0.15"
      });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">マスタ管理</h2>
        <p className="text-sm text-zinc-400">店舗・商材・KPI定義を管理画面から変更します。</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>店舗マスタ</CardTitle>
            <CardDescription>直営/FC・地域・担当を統一管理</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="店舗コード">
                <Input
                  value={storeForm.code}
                  onChange={(event) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      code: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="店舗名">
                <Input
                  value={storeForm.name}
                  onChange={(event) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      name: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="種別">
                <Select
                  value={storeForm.type}
                  options={[
                    { label: "直営", value: "DIRECT" },
                    { label: "FC", value: "FC" }
                  ]}
                  onChange={(event) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      type: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="エリア">
                <Input
                  value={storeForm.area}
                  onChange={(event) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      area: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="担当">
                <Input
                  value={storeForm.manager}
                  onChange={(event) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      manager: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="事業">
                <Input
                  value={storeForm.businessUnit}
                  onChange={(event) =>
                    setStoreForm((prev) => ({
                      ...prev,
                      businessUnit: event.target.value
                    }))
                  }
                />
              </Field>
            </div>
            <Button onClick={() => createStoreMutation.mutate()} disabled={createStoreMutation.isPending}>
              店舗追加
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Area</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storesQuery.data?.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell>{store.code}</TableCell>
                    <TableCell>{store.name}</TableCell>
                    <TableCell>{store.type}</TableCell>
                    <TableCell>{store.area}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPI定義マスタ</CardTitle>
            <CardDescription>目標値と閾値をコード変更なしで更新</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="キー">
                <Input
                  value={kpiForm.key}
                  onChange={(event) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      key: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="名称">
                <Input
                  value={kpiForm.name}
                  onChange={(event) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      name: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="単位">
                <Select
                  value={kpiForm.unit}
                  options={[
                    { label: "JPY", value: "JPY" },
                    { label: "count", value: "count" },
                    { label: "percent", value: "percent" }
                  ]}
                  onChange={(event) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      unit: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="目標値">
                <Input
                  type="number"
                  value={kpiForm.target}
                  onChange={(event) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      target: event.target.value
                    }))
                  }
                />
              </Field>
              <Field label="アラート閾値(0-1)">
                <Input
                  type="number"
                  step="0.01"
                  value={kpiForm.alertThreshold}
                  onChange={(event) =>
                    setKpiForm((prev) => ({
                      ...prev,
                      alertThreshold: event.target.value
                    }))
                  }
                />
              </Field>
            </div>
            <Button onClick={() => createKpiMutation.mutate()} disabled={createKpiMutation.isPending}>
              KPI追加
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiDefsQuery.data?.map((kpi) => (
                  <TableRow key={kpi.id}>
                    <TableCell>{kpi.key}</TableCell>
                    <TableCell>{kpi.name}</TableCell>
                    <TableCell>{kpi.target.toLocaleString()}</TableCell>
                    <TableCell>{kpi.alertThreshold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
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
