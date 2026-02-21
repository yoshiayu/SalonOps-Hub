import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { canEditItems, resolveRole } from "@/lib/auth/rbac";
import { bulkUpdateItems } from "@/lib/server/repository";

export const runtime = "edge";

const payloadSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["open", "in_progress", "done"])
});

export async function POST(request: NextRequest) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canEditItems(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues }, { status: 400 });
  }

  const updated = bulkUpdateItems(parsed.data.ids, parsed.data.status);
  return NextResponse.json({ updated });
}
