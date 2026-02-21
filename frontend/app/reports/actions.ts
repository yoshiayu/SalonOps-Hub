"use server";

import { z } from "zod";
import { createReport } from "@/lib/server/repository";

const payloadSchema = z.object({
  scope: z.enum(["company", "biz", "store"]),
  period: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  recipients: z.array(z.string().email()).min(1)
});

export async function generateReportAction(input: unknown) {
  const payload = payloadSchema.parse(input);
  const report = createReport(payload);
  return report;
}
