import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { canGenerateReport, resolveRole } from "@/lib/auth/rbac";
import { createReport } from "@/lib/server/repository";

export const runtime = "edge";

const payloadSchema = z.object({
  scope: z.enum(["company", "biz", "store"]),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recipients: z.array(z.string().email()).min(1)
});

export async function POST(request: NextRequest) {
  const role = resolveRole(request.headers.get("x-role"));
  if (!canGenerateReport(role)) {
    return NextResponse.json({ message: "forbidden" }, { status: 403 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues }, { status: 400 });
  }

  const report = createReport(parsed.data);
  return NextResponse.json(report, { status: 201 });
}
