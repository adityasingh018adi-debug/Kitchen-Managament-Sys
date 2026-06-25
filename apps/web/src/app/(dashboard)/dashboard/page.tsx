"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { StatCard } from "@/components/card";

interface DashboardSummary {
  tasksToday: number;
  completedTasksToday: number;
  lateAttendanceToday: number;
  pendingTasksCount: number;
  averageQualityScoreToday: number | null;
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<DashboardSummary>("/dashboard/summary", token).then(setSummary).catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">Today&apos;s kitchen at a glance.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Tasks Today" value={summary?.tasksToday ?? "—"} />
        <StatCard label="Completed Tasks" value={summary?.completedTasksToday ?? "—"} />
        <StatCard label="Late Punch-ins" value={summary?.lateAttendanceToday ?? "—"} />
        <StatCard label="Pending Tasks" value={summary?.pendingTasksCount ?? "—"} />
        <StatCard
          label="Avg Quality Score"
          value={summary?.averageQualityScoreToday != null ? `${Math.round(summary.averageQualityScoreToday)}%` : "—"}
        />
      </div>
    </div>
  );
}
