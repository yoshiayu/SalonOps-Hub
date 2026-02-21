import { NextResponse, type NextRequest } from "next/server";
import { createImportJob } from "@/lib/server/repository";
import { parseCsvFile, validateSalesRows } from "@/lib/validation/csv";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "file is required" }, { status: 400 });
  }

  try {
    const rows = await parseCsvFile(file);
    const validated = validateSalesRows(rows);
    const job = createImportJob({
      fileName: file.name,
      totalRows: rows.length,
      validRows: validated.validRows.length,
      errors: validated.errors
    });
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "invalid csv format"
      },
      { status: 400 }
    );
  }
}
