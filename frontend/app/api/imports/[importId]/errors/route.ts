import { NextResponse } from "next/server";
import { getImportJob } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET(
  _: Request,
  { params }: { params: { importId: string } }
) {
  const importJob = getImportJob(params.importId);
  if (!importJob) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  return NextResponse.json(importJob.errors);
}
