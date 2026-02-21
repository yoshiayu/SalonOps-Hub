import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/dashboard", url));
}
