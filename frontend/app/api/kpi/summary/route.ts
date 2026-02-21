import { NextResponse, type NextRequest } from "next/server";
import { parseDate, parsePeriod, parseScope, parseStoreType } from "@/lib/api/parsers";
import { getKpiSummary } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const scope = parseScope(params.get("scope")) ?? "company";
  const period = parsePeriod(params.get("period")) ?? "monthly";
  const from = parseDate(params.get("from"), "2026-02-01");
  const to = parseDate(params.get("to"), "2026-02-21");
  const storeCode = params.get("storeCode") ?? undefined;
  const type = parseStoreType(params.get("type"));
  const area = params.get("area") ?? undefined;

  const data = getKpiSummary({ scope, period, from, to, storeCode, type, area });
  return NextResponse.json(data);
}
