"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

const UNITS = ["G", "KG", "ML", "L", "PCS", "DOZEN", "BOX"] as const;

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantityOnHand: string;
  reorderLevel: string;
  isLowStock: boolean;
}

export default function InventoryPage() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.user?.role);
  const canManage = role === "SUPER_ADMIN" || role === "ADMIN";

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: "", unit: "KG", reorderLevel: "0" });
  const [adjusting, setAdjusting] = useState<Record<string, string>>({});

  function load() {
    if (!token) return;
    api.get<InventoryItem[]>("/inventory", token).then(setItems).catch(() => {});
  }

  useEffect(load, [token]);

  async function createItem() {
    if (!token || !newItem.name) return;
    setError(null);
    try {
      await api.post(
        "/inventory",
        { name: newItem.name, unit: newItem.unit, reorderLevel: Number(newItem.reorderLevel) },
        token,
      );
      setNewItem({ name: "", unit: "KG", reorderLevel: "0" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create item");
    }
  }

  async function adjust(id: string, type: "STOCK_IN" | "STOCK_OUT") {
    if (!token) return;
    const quantity = Number(adjusting[id] ?? 0);
    if (!quantity || quantity <= 0) return;
    setError(null);
    try {
      await api.patch(`/inventory/${id}/adjust`, { type, quantity }, token);
      setAdjusting((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to adjust stock");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Inventory</h1>
      <p className="mt-1 text-sm text-neutral-500">Stock levels, reorder points, and stock-in/stock-out movements.</p>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {canManage && (
        <Card className="mt-6 max-w-xl">
          <p className="text-xs font-medium text-neutral-400">New inventory item</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <input
              placeholder="Name"
              value={newItem.name}
              onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
              className="col-span-3 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500 sm:col-span-1"
            />
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem((prev) => ({ ...prev, unit: e.target.value }))}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Reorder level"
              value={newItem.reorderLevel}
              onChange={(e) => setNewItem((prev) => ({ ...prev, reorderLevel: e.target.value }))}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>
          <button
            onClick={createItem}
            className="mt-3 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400"
          >
            Add item
          </button>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className={item.isLowStock ? "border-amber-500/60" : undefined}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-white">{item.name}</p>
              {item.isLowStock && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Low stock
                </span>
              )}
            </div>
            <p className="mt-2 text-2xl font-semibold text-white">
              {Number(item.quantityOnHand).toLocaleString()} <span className="text-sm text-neutral-500">{item.unit}</span>
            </p>
            <p className="text-xs text-neutral-500">Reorder at {Number(item.reorderLevel).toLocaleString()} {item.unit}</p>

            <div className="mt-3 flex gap-2">
              <input
                type="number"
                placeholder="Qty"
                value={adjusting[item.id] ?? ""}
                onChange={(e) => setAdjusting((prev) => ({ ...prev, [item.id]: e.target.value }))}
                className="w-20 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-white outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => adjust(item.id, "STOCK_IN")}
                className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-emerald-400"
              >
                Stock in
              </button>
              <button
                onClick={() => adjust(item.id, "STOCK_OUT")}
                className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-800"
              >
                Stock out
              </button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-neutral-500">No inventory items yet.</p>}
      </div>
    </div>
  );
}
