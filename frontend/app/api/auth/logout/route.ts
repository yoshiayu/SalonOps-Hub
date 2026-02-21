import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/api/auth/signout?callbackUrl=/auth", url));
}
