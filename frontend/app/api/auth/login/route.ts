import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get("callbackUrl") ?? "/dashboard";
  return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, url));
}
