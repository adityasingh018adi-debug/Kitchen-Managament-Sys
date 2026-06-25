"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface Department {
  id: string;
  name: string;
}

export default function DepartmentsPage() {
  const token = useAuthStore((state) => state.token);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (!token) return;
    api.get<Department[]>("/departments", token).then(setDepartments).catch(() => {});
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Departments</h1>
      <p className="mt-1 text-sm text-neutral-500">Each department has its own PIN code, changeable by Admin or Super Admin.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {departments.map((department) => (
          <Card key={department.id}>
            <p className="text-sm font-medium text-white">{department.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
