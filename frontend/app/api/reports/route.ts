import { NextResponse } from "next/server";
import { listReports } from "@/lib/server/repository";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(listReports());
}
