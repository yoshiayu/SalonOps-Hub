"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1f2937_0%,#0f172a_45%,#09090b_100%)] p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-white">SalonOps Hub ログイン</CardTitle>
          <CardDescription>Google OAuth または開発用ログインで認証します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            Google でログイン
          </Button>

          <div className="rounded-md border border-border p-3">
            <p className="mb-2 text-sm text-muted-foreground">開発環境用</p>
            <form
              className="space-y-3"
              onSubmit={async (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                await signIn("credentials", {
                  email: String(formData.get("email") || "admin@salonops.local"),
                  role: String(formData.get("role") || "Admin"),
                  callbackUrl: "/dashboard"
                });
              }}
            >
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue="admin@salonops.local" />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" name="role" defaultValue="Admin" />
              </div>
              <Button type="submit" variant="secondary" className="w-full">
                開発ログイン
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
