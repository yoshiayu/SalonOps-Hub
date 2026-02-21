import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      {
        id: "anonymous",
        email: "anonymous@local",
        name: "anonymous",
        role: "Viewer",
        scope: "company"
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      id: session.user.email,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      role: session.user.role,
      scope: session.user.scope
    },
    { status: 200 }
  );
}
