"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

export default function WhatsappPage() {
  const token = useAuthStore((state) => state.token);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!token) return;
    api.get<NotificationItem[]>("/notifications/whatsapp", token).then(setItems).catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">WhatsApp Integration</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Every alert routed to the WhatsApp channel (late punch-ins, etc.). The send step is a no-op stub
        pending a WhatsApp Cloud API token — every entry below shows status <span className="text-amber-400">FAILED</span> until
        real credentials are wired into <code className="text-neutral-400">WhatsAppChannel</code>.
      </p>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.status === "SENT" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-400">{item.body}</p>
            <p className="mt-1 text-xs text-neutral-600">{new Date(item.createdAt).toLocaleString()}</p>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No WhatsApp-routed alerts yet.</p>}
      </div>
    </div>
  );
}
