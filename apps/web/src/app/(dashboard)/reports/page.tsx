"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const REPORTS = [
  { key: "tasks.csv", label: "Task Report (CSV)", ranged: true },
  { key: "tasks.pdf", label: "Task Report (PDF)", ranged: true },
  { key: "attendance.csv", label: "Attendance Report (CSV)", ranged: true },
  { key: "inventory.csv", label: "Inventory Report (CSV)", ranged: false },
];

export default function ReportsPage() {
  const token = useAuthStore((state) => state.token);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  async function download(key: string, ranged: boolean) {
    if (!token) return;
    setError(null);
    setDownloading(key);
    try {
      const params = ranged && (from || to)
        ? `?${new URLSearchParams({ ...(from ? { from } : {}), ...(to ? { to } : {}) })}`
        : "";
      const response = await fetch(`${API_BASE_URL}/reports/${key}${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to generate report");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${key.replace(".", "-report.")}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Reports</h1>
      <p className="mt-1 text-sm text-neutral-500">Export task, attendance, and inventory data as CSV or PDF.</p>

      <Card className="mt-6 max-w-md">
        <p className="text-xs font-medium text-neutral-400">Date range (optional, applies to task/attendance reports)</p>
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
        </div>
      </Card>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.key} className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">{report.label}</span>
            <button
              onClick={() => download(report.key, report.ranged)}
              disabled={downloading === report.key}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
            >
              {downloading === report.key ? "Generating…" : "Download"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
