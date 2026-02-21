import Papa from "papaparse";
import { z } from "zod";
import type { ImportError } from "@/lib/types";

const salesRowSchema = z.object({
  store_code: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  revenue: z.coerce.number().nonnegative(),
  customers: z.coerce.number().int().nonnegative()
});

export type SalesCsvRow = z.infer<typeof salesRowSchema>;

export async function parseCsvFile(file: File): Promise<Record<string, string>[]> {
  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase()
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0].message);
  }

  return parsed.data;
}

export function validateSalesRows(rawRows: Record<string, string>[]): {
  validRows: SalesCsvRow[];
  errors: ImportError[];
} {
  const errors: ImportError[] = [];
  const validRows: SalesCsvRow[] = [];
  const seen = new Set<string>();

  rawRows.forEach((raw, index) => {
    const rowNumber = index + 2;
    const parsed = salesRowSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      errors.push({
        row: rowNumber,
        column: issue.path.join(".") || "unknown",
        reason: issue.message,
        fix: "テンプレート列名と値の型を確認してください。"
      });
      return;
    }

    const row = parsed.data;
    const duplicateKey = `${row.store_code}-${row.date}`;
    if (seen.has(duplicateKey)) {
      errors.push({
        row: rowNumber,
        column: "store_code,date",
        reason: "重複データです。",
        fix: "同一店舗・同一日の行を1行に統合してください。"
      });
      return;
    }
    seen.add(duplicateKey);

    if (row.revenue > 50000000) {
      errors.push({
        row: rowNumber,
        column: "revenue",
        reason: "売上が範囲上限を超えています。",
        fix: "桁区切りや単位を確認してください。"
      });
      return;
    }

    validRows.push(row);
  });

  return {
    validRows,
    errors
  };
}
