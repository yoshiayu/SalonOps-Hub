"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bulkUpdateItems, fetchItems } from "@/lib/api/client";
import type { ItemRecord } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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

export function ItemsView() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | ItemRecord["status"]>("");
  const [tag, setTag] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const itemsQuery = useQuery({
    queryKey: ["items", q, status, tag],
    queryFn: () =>
      fetchItems({
        q: q || undefined,
        status: status || undefined,
        tag: tag || undefined
      })
  });

  const bulkMutation = useMutation({
    mutationFn: (nextStatus: ItemRecord["status"]) =>
      bulkUpdateItems({
        ids: selected,
        status: nextStatus
      }),
    onSuccess: () => {
      setSelected([]);
      queryClient.invalidateQueries({ queryKey: ["items"] });
    }
  });

  const allSelected = useMemo(() => {
    const ids = itemsQuery.data?.map((item) => item.id) ?? [];
    if (ids.length === 0) {
      return false;
    }
    return ids.every((id) => selected.includes(id));
  }, [itemsQuery.data, selected]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Items</h2>
        <p className="text-sm text-zinc-400">検索 + バルク操作で改善タスクを運用します。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>検索</CardTitle>
          <CardDescription>キーワード / ステータス / タグで絞り込み</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Field label="キーワード">
            <Input value={q} onChange={(event) => setQ(event.target.value)} />
          </Field>
          <Field label="ステータス">
            <Select
              value={status}
              options={[
                { label: "すべて", value: "" },
                { label: "open", value: "open" },
                { label: "in_progress", value: "in_progress" },
                { label: "done", value: "done" }
              ]}
              onChange={(event) => setStatus(event.target.value as "" | ItemRecord["status"])}
            />
          </Field>
          <Field label="タグ">
            <Input value={tag} onChange={(event) => setTag(event.target.value)} />
          </Field>
          <div className="flex items-end">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["items"] });
              }}
            >
              再検索
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>バルク操作</CardTitle>
          <CardDescription>選択した項目を一括更新します。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            disabled={selected.length === 0}
            onClick={() => bulkMutation.mutate("in_progress")}
          >
            In Progress へ変更
          </Button>
          <Button variant="default" disabled={selected.length === 0} onClick={() => bulkMutation.mutate("done")}>
            Done へ変更
          </Button>
          <span className="text-sm text-zinc-400">選択数: {selected.length}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(event) => {
                      if (!itemsQuery.data) {
                        return;
                      }
                      setSelected(event.target.checked ? itemsQuery.data.map((item) => item.id) : []);
                    }}
                  />
                </TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead>更新日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsQuery.data?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={(event) => {
                        setSelected((prev) =>
                          event.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/items/${item.id}`} className="text-emerald-300 hover:underline">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>{item.tag}</TableCell>
                  <TableCell>{item.updatedAt}</TableCell>
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

function StatusBadge({ status }: { status: ItemRecord["status"] }) {
  if (status === "done") {
    return <Badge variant="success">done</Badge>;
  }
  if (status === "in_progress") {
    return <Badge variant="warning">in_progress</Badge>;
  }
  return <Badge variant="outline">open</Badge>;
}
