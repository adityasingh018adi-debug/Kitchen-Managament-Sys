"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";
import { CameraCapture } from "@/components/camera-capture";

interface Employee {
  id: string;
  name: string;
  employeeCode: string;
  status: "ACTIVE" | "INACTIVE";
  department: { name: string };
  faceEmbeddingId: string | null;
}

export default function EmployeesPage() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "SUPER_ADMIN" || role === "ADMIN";
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    if (!token) return;
    api.get<Employee[]>("/employees", token).then(setEmployees).catch(() => {});
  }

  useEffect(load, [token]);

  async function onCaptured(employeeId: string, photoUrl: string) {
    if (!token) return;
    try {
      await api.patch(`/employees/${employeeId}/face-enroll`, { photoUrl }, token);
      setMessage("Face enrolled successfully.");
      setEnrollingId(null);
      load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Enrollment failed");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Employees</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Full employee directory across all departments. Face enrollment uses a mocked provider —
        swap <code className="text-neutral-400">FACE_RECOGNITION_PROVIDER</code> for a real SDK to go live.
      </p>

      {message && <p className="mt-3 text-sm text-violet-400">{message}</p>}

      <div className="mt-6 space-y-2">
        {employees.map((employee) => (
          <Card key={employee.id} className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{employee.name}</p>
                <p className="text-xs text-neutral-500">{employee.employeeCode} · {employee.department.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={
                    employee.faceEmbeddingId
                      ? "rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-400"
                      : "rounded-full bg-neutral-700/40 px-2 py-1 text-xs text-neutral-400"
                  }
                >
                  {employee.faceEmbeddingId ? "Face enrolled" : "No face data"}
                </span>
                <span
                  className={
                    employee.status === "ACTIVE"
                      ? "rounded-full bg-violet-500/10 px-2 py-1 text-xs text-violet-400"
                      : "rounded-full bg-neutral-700/40 px-2 py-1 text-xs text-neutral-400"
                  }
                >
                  {employee.status}
                </span>
                {canManage && (
                  <button
                    onClick={() => setEnrollingId(enrollingId === employee.id ? null : employee.id)}
                    className="rounded-lg border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
                  >
                    {enrollingId === employee.id ? "Close" : "Enroll face"}
                  </button>
                )}
              </div>
            </div>
            {enrollingId === employee.id && token && (
              <div className="mt-3 border-t border-neutral-800 pt-3">
                <CameraCapture
                  token={token}
                  label="Use this photo"
                  onUploaded={(url) => onCaptured(employee.id, url)}
                  onError={setMessage}
                />
              </div>
            )}
          </Card>
        ))}
        {employees.length === 0 && <p className="text-sm text-neutral-500">No employees yet.</p>}
      </div>
    </div>
  );
}
