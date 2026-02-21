"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import type { ImportError, ImportJob } from "@/lib/types";
import { parseCsvFile, validateSalesRows } from "@/lib/validation/csv";

export function ImportsView() {
  const [file, setFile] = useState<File | null>(null);
  const [previewErrors, setPreviewErrors] = useState<ImportError[]>([]);
  const [jobResult, setJobResult] = useState<ImportJob | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (uploadFile: File) => {
      const form = new FormData();
      form.append("file", uploadFile);
      const response = await fetch("/api/imports/sales", {
        method: "POST",
        body: form
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return (await response.json()) as ImportJob;
    },
    onSuccess: (data) => {
      setJobResult(data);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">データ取込</h2>
        <p className="text-sm text-zinc-400">
          CSVをアップロードすると、必須・型・範囲・重複を即時検証します。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>CSVアップロード</CardTitle>
          <CardDescription>
            必須列: <code>store_code,date,revenue,customers</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={async (event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
              setJobResult(null);

              if (!selected) {
                setPreviewErrors([]);
                return;
              }

              try {
                const rows = await parseCsvFile(selected);
                const result = validateSalesRows(rows);
                setPreviewErrors(result.errors);
              } catch (error) {
                setPreviewErrors([
                  {
                    row: 1,
                    column: "file",
                    reason: error instanceof Error ? error.message : "CSV解析に失敗しました",
                    fix: "UTF-8 / ヘッダ行ありの形式で再出力してください。"
                  }
                ]);
              }
            }}
            className="block w-full rounded-md border border-input bg-background p-2 text-sm"
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                if (!file) {
                  return;
                }
                uploadMutation.mutate(file);
              }}
              disabled={!file || uploadMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              取込実行
            </Button>
            {previewErrors.length > 0 ? (
              <Badge variant="warning">事前検証エラー {previewErrors.length} 件</Badge>
            ) : (
              <Badge variant="success">事前検証 OK</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>エラー一覧</CardTitle>
          <CardDescription>原因と修正方法を同時に表示します。</CardDescription>
        </CardHeader>
        <CardContent>
          {previewErrors.length === 0 ? (
            <p className="text-sm text-zinc-400">エラーはありません。</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>行</TableHead>
                  <TableHead>列</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>修正方法</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewErrors.map((error, idx) => (
                  <TableRow key={`${error.row}-${idx}`}>
                    <TableCell>{error.row}</TableCell>
                    <TableCell>{error.column}</TableCell>
                    <TableCell className="text-red-300">{error.reason}</TableCell>
                    <TableCell>{error.fix}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {jobResult ? (
        <Card>
          <CardHeader>
            <CardTitle>取込結果</CardTitle>
            <CardDescription>Import ID: {jobResult.id}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={jobResult.status === "success" ? "success" : "danger"}>{jobResult.status}</Badge>
            <span>総行数: {jobResult.totalRows}</span>
            <span>取込成功: {jobResult.validRows}</span>
            <span>エラー: {jobResult.errors.length}</span>
            {jobResult.errors.length > 0 ? <AlertCircle className="h-4 w-4 text-red-300" /> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
