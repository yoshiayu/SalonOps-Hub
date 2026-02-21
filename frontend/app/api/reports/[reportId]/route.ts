import { NextResponse } from "next/server";
import { getReport } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET(
  _: Request,
  { params }: { params: { reportId: string } }
) {
  const report = getReport(params.reportId);
  if (!report) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}
