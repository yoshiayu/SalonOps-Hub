"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function SettingsPage() {
  const [role, setRole] = useState("Manager");
  const [notifyEmail, setNotifyEmail] = useState("ops@salonops.local");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-zinc-400">権限・通知設定の管理</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>権限設定</CardTitle>
          <CardDescription>ロールごとの閲覧範囲を制御します。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              value={role}
              options={[
                { label: "Admin", value: "Admin" },
                { label: "Manager", value: "Manager" },
                { label: "Staff", value: "Staff" },
                { label: "Viewer", value: "Viewer" }
              ]}
              onChange={(event) => setRole(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>通知先メール</Label>
            <Input value={notifyEmail} onChange={(event) => setNotifyEmail(event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Slack / Chat Webhook</Label>
            <Input value={slackWebhook} onChange={(event) => setSlackWebhook(event.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={() => {
          setMessage(`保存しました: role=${role}, notify=${notifyEmail}`);
        }}
      >
        保存
      </Button>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    </div>
  );
}
