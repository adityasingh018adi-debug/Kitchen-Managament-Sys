"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, StatCard } from "@/components/card";

interface AnalyticsSummary {
  periodDays: number;
  qualityTrend: { date: string; value: number | null }[];
  taskCompletionRate: number | null;
  punctualityRate: number | null;
  sampleSizes: { inspections: number; tasks: number; attendanceEvents: number };
}

export default function AiAnalyticsPage() {
  const token = useAuthStore((state) => state.token);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get<AnalyticsSummary>("/analytics/summary", token).then(setSummary).catch(() => {});
  }, [token]);

  async function ask() {
    if (!token || !question.trim()) return;
    setAsking(true);
    setError(null);
    try {
      const result = await api.post<{ answer: string }>("/analytics/assistant", { question }, token);
      setAnswer(result.answer);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Assistant request failed");
    } finally {
      setAsking(false);
    }
  }

  const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 100)}%`);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">AI Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Real trend data over the last {summary?.periodDays ?? 14} days, plus an AI assistant (currently mocked — connect a real LLM provider for live answers).
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Task completion rate" value={pct(summary?.taskCompletionRate ?? null)} />
        <StatCard label="Punctuality rate" value={pct(summary?.punctualityRate ?? null)} />
        <StatCard label="Quality inspections sampled" value={summary?.sampleSizes.inspections ?? 0} />
      </div>

      {summary && (
        <Card className="mt-6">
          <p className="text-xs font-medium text-neutral-400">Average quality score by day</p>
          <div className="mt-3 flex items-end gap-1">
            {summary.qualityTrend.map((point) => (
              <div key={point.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-emerald-500/70"
                  style={{ height: `${Math.max(4, (point.value ?? 0) * 0.8)}px` }}
                  title={`${point.date}: ${point.value ?? "no data"}`}
                />
                <span className="text-[10px] text-neutral-600">{point.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-6 max-w-xl">
        <p className="text-xs font-medium text-neutral-400">Ask the AI assistant</p>
        <div className="mt-2 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How is task completion trending?"
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
          />
          <button
            onClick={ask}
            disabled={asking}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {asking ? "Asking…" : "Ask"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {answer && (
          <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-neutral-950 p-3 text-xs text-neutral-300">{answer}</pre>
        )}
      </Card>
    </div>
  );
}
