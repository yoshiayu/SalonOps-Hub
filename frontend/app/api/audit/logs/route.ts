import { NextResponse, type NextRequest } from "next/server";
import { listAuditLogs } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const from = params.get("from") ?? undefined;
  const to = params.get("to") ?? undefined;
  const user = params.get("user") ?? undefined;
  const action = params.get("action") ?? undefined;

  return NextResponse.json(listAuditLogs({ from, to, user, action }));
}
