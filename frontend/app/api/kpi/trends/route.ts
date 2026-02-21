import { NextResponse, type NextRequest } from "next/server";
import { parseDate, parseStoreType } from "@/lib/api/parsers";
import { getKpiTrends } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const from = parseDate(params.get("from"), "2026-01-01");
  const to = parseDate(params.get("to"), "2026-02-21");
  const type = parseStoreType(params.get("type"));
  const area = params.get("area") ?? undefined;

  return NextResponse.json(getKpiTrends({ from, to, type, area }));
}
