"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface Department {
  id: string;
  name: string;
}

interface IngredientRow {
  name: string;
  quantity: string;
  unit: string;
}

const UNITS = ["G", "KG", "ML", "L", "PCS", "DOZEN", "BOX"];

export default function NewRecipePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [batchSize, setBatchSize] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("portion");
  const [method, setMethod] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ name: "", quantity: "", unit: "G" }]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<Department[]>("/departments", token).then(setDepartments).catch(() => {});
  }, [token]);

  function updateIngredient(index: number, patch: Partial<IngredientRow>) {
    setIngredients((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const recipe = await api.post<{ id: string }>(
        "/recipes",
        {
          name,
          category,
          departmentId,
          method,
          batchSize,
          yieldUnit,
          ingredients: ingredients
            .filter((row) => row.name && row.quantity)
            .map((row) => ({ name: row.name, quantity: Number(row.quantity), unit: row.unit })),
        },
        token,
      );
      router.push(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create recipe");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white">New Recipe</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="space-y-4">
          <Field label="Recipe Name">
            <Input value={name} onChange={setName} required />
          </Field>
          <Field label="Category">
            <Input value={category} onChange={setCategory} required />
          </Field>
          <Field label="Department">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="" disabled>Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Batch Size (reference yield)">
              <input
                type="number"
                min={1}
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="Yield Unit">
              <Input value={yieldUnit} onChange={setYieldUnit} />
            </Field>
          </div>
          <Field label="Method">
            <textarea
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              required
              rows={4}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            />
          </Field>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Ingredients</h2>
            <button
              type="button"
              onClick={() => setIngredients((rows) => [...rows, { name: "", quantity: "", unit: "G" }])}
              className="text-xs text-emerald-400 hover:underline"
            >
              + Add ingredient
            </button>
          </div>
          {ingredients.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_100px_90px] gap-2">
              <input
                placeholder="Ingredient name"
                value={row.name}
                onChange={(e) => updateIngredient(index, { name: e.target.value })}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
              <input
                placeholder="Qty"
                type="number"
                value={row.quantity}
                onChange={(e) => updateIngredient(index, { quantity: e.target.value })}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
              <select
                value={row.unit}
                onChange={(e) => updateIngredient(index, { unit: e.target.value })}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          ))}
        </Card>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Create Recipe"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-neutral-400">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
    />
  );
}
