import { describe, expect, it } from "vitest";
import { validateSalesRows } from "@/lib/validation/csv";

describe("validateSalesRows", () => {
  it("正常行を取り込める", () => {
    const result = validateSalesRows([
      {
        store_code: "TKY-001",
        date: "2026-02-01",
        revenue: "1200000",
        customers: "120"
      }
    ]);

    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(1);
  });

  it("重複行を検知する", () => {
    const result = validateSalesRows([
      {
        store_code: "TKY-001",
        date: "2026-02-01",
        revenue: "1200000",
        customers: "120"
      },
      {
        store_code: "TKY-001",
        date: "2026-02-01",
        revenue: "1250000",
        customers: "130"
      }
    ]);

    expect(result.validRows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].column).toBe("store_code,date");
  });
});
