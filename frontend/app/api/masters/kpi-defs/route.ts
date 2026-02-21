import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { canManageMaster, resolveRole } from "@/lib/auth/rbac";
import { createKpiDef, listKpiDefs } from "@/lib/server/repository";

export const runtime = "edge";

const createKpiPayload = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  unit: z.enum(["JPY", "count", "percent"]),
  target: z.number().nonnegative(),
  alertThreshold: z.number().min(0).max(1)
});

export async function GET() {
  return NextResponse.json(listKpiDefs());
}

export async function POST(request: NextRequest) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canManageMaster(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const parsed = createKpiPayload.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues }, { status: 400 });
  }

  const created = createKpiDef(parsed.data);
  return NextResponse.json(created, { status: 201 });
}
