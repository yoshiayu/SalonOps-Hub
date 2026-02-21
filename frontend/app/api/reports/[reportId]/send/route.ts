import { NextResponse, type NextRequest } from "next/server";
import { canGenerateReport, resolveRole } from "@/lib/auth/rbac";
import { sendReport } from "@/lib/server/repository";

export const runtime = "edge";

export async function POST(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canGenerateReport(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const report = sendReport(params.reportId);
  if (!report) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  return NextResponse.json(report);
}
