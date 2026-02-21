import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { canManageMaster, resolveRole } from "@/lib/auth/rbac";
import { updateStore } from "@/lib/server/repository";

export const runtime = "edge";

const updatePayload = z
  .object({
    code: z.string().min(2).optional(),
    name: z.string().min(1).optional(),
    type: z.enum(["DIRECT", "FC"]).optional(),
    area: z.string().min(1).optional(),
    manager: z.string().min(1).optional(),
    businessUnit: z.string().min(1).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "at least one field is required"
  });

export async function PUT(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canManageMaster(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const parsed = updatePayload.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues }, { status: 400 });
  }

  const updated = updateStore(params.storeId, parsed.data);
  if (!updated) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}
