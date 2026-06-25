"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";
import { CameraCapture } from "@/components/camera-capture";

interface Employee {
  id: string;
  name: string;
}

interface RecognizeResult {
  matched: boolean;
  employeeId?: string;
  confidence: number;
}

export default function AttendancePage() {
  const token = useAuthStore((state) => state.token);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<Employee[]>("/employees", token).then(setEmployees).catch(() => {});
  }, [token]);

  async function punch(type: "PUNCH_IN" | "PUNCH_OUT") {
    if (!token || !employeeId) return;
    setMessage(null);
    try {
      await api.post("/attendance/punch", { employeeId, type }, token);
      setMessage(`${type === "PUNCH_IN" ? "Punched in" : "Punched out"} successfully.`);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Punch failed");
    }
  }

  async function onScanned(photoUrl: string) {
    if (!token) return;
    try {
      const result = await api.post<RecognizeResult>("/attendance/recognize", { photoUrl }, token);
      if (result.matched && result.employeeId) {
        setEmployeeId(result.employeeId);
        setMessage("Face recognized — employee selected.");
      } else {
        setMessage("No face match (mock provider always misses) — please select your name manually below.");
      }
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Recognition failed");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Attendance Kiosk</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Face recognition is backed by a mocked provider — it always returns no match, so manual
        selection below is the reliable fallback until a real provider is wired in.
      </p>

      <Card className="mt-6 max-w-sm">
        <label className="text-xs font-medium text-neutral-400">Scan face</label>
        <div className="mt-1">
          {scanning ? (
            <CameraCapture token={token ?? ""} label="Scan" onUploaded={onScanned} onError={setMessage} />
          ) : (
            <button
              onClick={() => setScanning(true)}
              className="rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800"
            >
              Start face scan
            </button>
          )}
        </div>

        <label className="mt-4 block text-xs font-medium text-neutral-400">Employee</label>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
        >
          <option value="" disabled>Select employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => punch("PUNCH_IN")}
            className="rounded-lg bg-violet-500 py-2 text-sm font-medium text-neutral-950 hover:bg-violet-400"
          >
            Punch In
          </button>
          <button
            onClick={() => punch("PUNCH_OUT")}
            className="rounded-lg border border-neutral-700 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-800"
          >
            Punch Out
          </button>
        </div>

        {message && <p className="mt-3 text-sm text-neutral-300">{message}</p>}
      </Card>
    </div>
  );
}
