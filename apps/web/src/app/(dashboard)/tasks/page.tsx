"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface TaskItem {
  id: string;
  title: string;
  priority: string;
  status: "PENDING" | "WORKING" | "COMPLETED" | "CANCELLED";
  startedAt: string | null;
  finishedAt: string | null;
  department: { name: string };
  assignments: { employee: { name: string } }[];
}

const COLUMNS: TaskItem["status"][] = ["PENDING", "WORKING", "COMPLETED", "CANCELLED"];

export default function TasksPage() {
  const token = useAuthStore((state) => state.token);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  async function refresh() {
    if (!token) return;
    const data = await api.get<TaskItem[]>("/tasks", token);
    setTasks(data);
  }

  useEffect(() => {
    refresh();
  }, [token]);

  async function startTask(id: string) {
    if (!token) return;
    try {
      await api.patch(`/tasks/${id}/start`, {}, token);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start task");
    }
  }

  async function finishTask(id: string) {
    if (!token) return;
    const proofPhotoUrl = proofUrls[id];
    if (!proofPhotoUrl) {
      setError("Add a photo proof URL before finishing the task.");
      return;
    }
    try {
      await api.patch(`/tasks/${id}/finish`, { proofPhotoUrl }, token);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not finish task");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Daily Task Management</h1>
      <p className="mt-1 text-sm text-neutral-500">Track every task from pending to completed.</p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((status) => (
          <div key={status}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {status} ({tasks.filter((t) => t.status === status).length})
            </h2>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <Card key={task.id}>
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {task.department.name} · {task.priority}
                    </p>
                    {task.assignments.length > 0 && (
                      <p className="mt-1 text-xs text-neutral-400">
                        {task.assignments.map((a) => a.employee.name).join(", ")}
                      </p>
                    )}

                    {task.status === "PENDING" && (
                      <button
                        onClick={() => startTask(task.id)}
                        className="mt-3 w-full rounded-lg bg-emerald-500 py-1.5 text-xs font-medium text-neutral-950 hover:bg-emerald-400"
                      >
                        Start Task
                      </button>
                    )}

                    {task.status === "WORKING" && (
                      <div className="mt-3 space-y-2">
                        <input
                          placeholder="Photo proof URL"
                          value={proofUrls[task.id] ?? ""}
                          onChange={(e) =>
                            setProofUrls((urls) => ({ ...urls, [task.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={() => finishTask(task.id)}
                          className="w-full rounded-lg bg-emerald-500 py-1.5 text-xs font-medium text-neutral-950 hover:bg-emerald-400"
                        >
                          Finish Task
                        </button>
                      </div>
                    )}

                    {task.status === "COMPLETED" && task.startedAt && task.finishedAt && (
                      <p className="mt-2 text-xs text-emerald-400">
                        {Math.round(
                          (new Date(task.finishedAt).getTime() - new Date(task.startedAt).getTime()) / 60000,
                        )}{" "}
                        min
                      </p>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
