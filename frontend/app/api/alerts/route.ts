import { NextResponse, type NextRequest } from "next/server";
import { parseDate, parsePeriod, parseScope } from "@/lib/api/parsers";
import { listAlerts } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const scope = parseScope(params.get("scope")) ?? "company";
  const period = parsePeriod(params.get("period")) ?? "monthly";
  const from = parseDate(params.get("from"), "2026-02-01");
  const to = parseDate(params.get("to"), "2026-02-21");

  return NextResponse.json(listAlerts({ scope, period, from, to }));
}
