import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { canManageMaster, resolveRole } from "@/lib/auth/rbac";
import { updateKpiDef } from "@/lib/server/repository";

export const runtime = "edge";

const updateKpiPayload = z
  .object({
    key: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    unit: z.enum(["JPY", "count", "percent"]).optional(),
    target: z.number().nonnegative().optional(),
    alertThreshold: z.number().min(0).max(1).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "at least one field is required"
  });

export async function PUT(
  request: NextRequest,
  { params }: { params: { kpiId: string } }
) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canManageMaster(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const parsed = updateKpiPayload.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues }, { status: 400 });
  }

  const updated = updateKpiDef(params.kpiId, parsed.data);
  if (!updated) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
