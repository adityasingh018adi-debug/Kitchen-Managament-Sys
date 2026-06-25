"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface AdminUser {
  id: string;
  username: string;
  role: "SUPER_ADMIN" | "ADMIN" | "STAFF";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user: { username: string } | null;
}

const ROLES: AdminUser["role"][] = ["SUPER_ADMIN", "ADMIN", "STAFF"];

export default function AdminPage() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);
  const isSuperAdmin = role === "SUPER_ADMIN";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newRole, setNewRole] = useState<AdminUser["role"]>("STAFF");
  const [error, setError] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState("");

  function loadUsers() {
    if (!token) return;
    api.get<AdminUser[]>("/admin/users", token).then(setUsers).catch(() => {});
  }

  function loadLogs() {
    if (!token) return;
    const qs = entityFilter ? `?entity=${encodeURIComponent(entityFilter)}` : "";
    api.get<AuditLogEntry[]>(`/admin/audit-logs${qs}`, token).then(setLogs).catch(() => {});
  }

  useEffect(() => {
    if (!isSuperAdmin) return;
    loadUsers();
    loadLogs();
  }, [token, isSuperAdmin]);

  async function createUser() {
    if (!token || !username || !password) return;
    setError(null);
    try {
      await api.post("/admin/users", { username, password, role: newRole }, token);
      setUsername("");
      setPassword("");
      setNewRole("STAFF");
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create user");
    }
  }

  async function toggleActive(user: AdminUser) {
    if (!token) return;
    try {
      await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive }, token);
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function changeRole(user: AdminUser, value: AdminUser["role"]) {
    if (!token) return;
    try {
      await api.patch(`/admin/users/${user.id}`, { role: value }, token);
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  if (!isSuperAdmin) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
        <p className="mt-2 text-sm text-neutral-500">Only Super Admins can access user management and audit logs.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Admin Panel</h1>
      <p className="mt-1 text-sm text-neutral-500">Manage users, roles, and review the audit log.</p>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-white">Users</p>
          <div className="mt-3 space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2">
                <div>
                  <p className="text-sm text-white">{user.username}</p>
                  <p className="text-xs text-neutral-500">
                    {user.lastLoginAt ? `Last login ${new Date(user.lastLoginAt).toLocaleString()}` : "Never logged in"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user, e.target.value as AdminUser["role"])}
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => toggleActive(user)}
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      user.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-700/40 text-neutral-400"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-sm text-neutral-500">No users yet.</p>}
          </div>

          <p className="mt-5 text-xs font-medium text-neutral-400">Create user</p>
          <div className="mt-2 space-y-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password (min 8 chars)"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminUser["role"])}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              onClick={createUser}
              className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400"
            >
              Create user
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">Audit log</p>
            <div className="flex gap-2">
              <input
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                placeholder="Filter by entity (e.g. User)"
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                onClick={loadLogs}
                className="rounded-lg border border-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Filter
              </button>
            </div>
          </div>
          <div className="mt-3 max-h-96 space-y-1 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-neutral-800 px-3 py-2 text-xs">
                <p className="text-neutral-200">
                  <span className="font-medium text-white">{log.action}</span> · {log.entity}
                  {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                </p>
                <p className="text-neutral-500">
                  {log.user?.username ?? "system"} · {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {logs.length === 0 && <p className="text-sm text-neutral-500">No audit log entries yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
