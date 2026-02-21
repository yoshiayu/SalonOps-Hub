import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { parseStoreType } from "@/lib/api/parsers";
import { canManageMaster, resolveRole } from "@/lib/auth/rbac";
import { createStore, listStores } from "@/lib/server/repository";

export const runtime = "edge";

const storePayload = z.object({
  code: z.string().min(2),
  name: z.string().min(1),
  type: z.enum(["DIRECT", "FC"]),
  area: z.string().min(1),
  manager: z.string().min(1),
  businessUnit: z.string().min(1)
});

export async function GET(request: NextRequest) {
  const type = parseStoreType(request.nextUrl.searchParams.get("type"));
  const area = request.nextUrl.searchParams.get("area") ?? undefined;
  const manager = request.nextUrl.searchParams.get("manager") ?? undefined;
  const businessUnit = request.nextUrl.searchParams.get("businessUnit") ?? undefined;

  const data = listStores({ type, area, manager, businessUnit });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canManageMaster(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const parsed = storePayload.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues }, { status: 400 });
  }

  const created = createStore(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
