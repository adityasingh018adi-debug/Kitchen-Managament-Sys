"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  channel: string;
  status: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const token = useAuthStore((state) => state.token);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!token) return;
    api.get<NotificationItem[]>("/notifications", token).then(setItems).catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Notifications</h1>
      <p className="mt-1 text-sm text-neutral-500">In-app alerts. Push/Email/WhatsApp channels are stubbed pending credentials.</p>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <span className="text-xs text-neutral-500">{item.channel} · {item.status}</span>
            </div>
            <p className="mt-1 text-sm text-neutral-400">{item.body}</p>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No notifications yet.</p>}
      </div>
    </div>
  );
}
