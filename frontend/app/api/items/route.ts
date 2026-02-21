import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getItem, listItems } from "@/lib/server/repository";

export const runtime = "edge";

const statusSchema = z.enum(["open", "in_progress", "done"]);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") ?? undefined;
  const tag = params.get("tag") ?? undefined;
  const rawStatus = params.get("status");
  const parsedStatus = rawStatus ? statusSchema.safeParse(rawStatus) : null;
  const status = parsedStatus?.success ? parsedStatus.data : undefined;

  return NextResponse.json(listItems({ q, tag, status }));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const itemId = z.string().parse(body?.itemId);
  const item = getItem(itemId);
  if (!item) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
