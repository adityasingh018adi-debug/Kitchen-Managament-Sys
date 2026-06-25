"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface Employee {
  id: string;
  name: string;
  employeeCode: string;
  status: "ACTIVE" | "INACTIVE";
  department: { name: string };
}

export default function EmployeesPage() {
  const token = useAuthStore((state) => state.token);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!token) return;
    api.get<Employee[]>("/employees", token).then(setEmployees).catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Employees</h1>
      <p className="mt-1 text-sm text-neutral-500">Full employee directory across all departments.</p>

      <div className="mt-6 space-y-2">
        {employees.map((employee) => (
          <Card key={employee.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-white">{employee.name}</p>
              <p className="text-xs text-neutral-500">{employee.employeeCode} · {employee.department.name}</p>
            </div>
            <span
              className={
                employee.status === "ACTIVE"
                  ? "rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-400"
                  : "rounded-full bg-neutral-700/40 px-2 py-1 text-xs text-neutral-400"
              }
            >
              {employee.status}
            </span>
          </Card>
        ))}
        {employees.length === 0 && <p className="text-sm text-neutral-500">No employees yet.</p>}
      </div>
    </div>
  );
}
