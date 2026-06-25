"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  method: string;
  cookingTemp: string | null;
  cookingTimeMinutes: number | null;
  shelfLife: string | null;
  storageMethod: string | null;
  notes: string | null;
  portionSize: string | null;
  batchSize: string;
  yieldUnit: string;
  photoUrl: string | null;
  videoUrl: string | null;
  department: { name: string };
  ingredients: Ingredient[];
}

interface ScaledRecipe {
  scaleFactor: number;
  requestedPortions: number;
  ingredients: { name: string; unit: string; originalQuantity: number; scaledQuantity: number }[];
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const token = useAuthStore((state) => state.token);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [portions, setPortions] = useState<number>(0);
  const [scaled, setScaled] = useState<ScaledRecipe | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    api.get<Recipe>(`/recipes/${id}`, token).then((r) => {
      setRecipe(r);
      setPortions(Number(r.batchSize));
    });
  }, [token, id]);

  async function handleCalculate() {
    if (!token || !id || portions <= 0) return;
    setError(null);
    try {
      const result = await api.get<ScaledRecipe>(`/recipes/${id}/scale?portions=${portions}`, token);
      setScaled(result);
    } catch {
      setError("Could not calculate scaled quantities.");
    }
  }

  if (!recipe) return <p className="text-sm text-neutral-500">Loading…</p>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">{recipe.category} · {recipe.department.name}</p>
          <h1 className="text-2xl font-semibold text-white">{recipe.name}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Reference batch: {recipe.batchSize} {recipe.yieldUnit}s
            {recipe.portionSize ? ` · ${recipe.portionSize}` : ""}
          </p>
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-white">Method</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-neutral-300">{recipe.method}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {recipe.cookingTemp && (
              <div><dt className="text-neutral-500">Cooking Temp</dt><dd className="text-neutral-200">{recipe.cookingTemp}</dd></div>
            )}
            {recipe.cookingTimeMinutes && (
              <div><dt className="text-neutral-500">Cooking Time</dt><dd className="text-neutral-200">{recipe.cookingTimeMinutes} min</dd></div>
            )}
            {recipe.shelfLife && (
              <div><dt className="text-neutral-500">Shelf Life</dt><dd className="text-neutral-200">{recipe.shelfLife}</dd></div>
            )}
            {recipe.storageMethod && (
              <div><dt className="text-neutral-500">Storage</dt><dd className="text-neutral-200">{recipe.storageMethod}</dd></div>
            )}
          </dl>
          {recipe.notes && <p className="mt-4 text-sm text-neutral-400">Notes: {recipe.notes}</p>}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-white">Reference Ingredients</h2>
          <ul className="mt-3 divide-y divide-neutral-800 text-sm">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex justify-between py-2">
                <span className="text-neutral-300">{ingredient.name}</span>
                <span className="text-neutral-500">{ingredient.quantity} {ingredient.unit}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="h-fit">
        <h2 className="text-sm font-semibold text-white">Smart Recipe Calculator</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Enter the portions you need — every ingredient scales automatically.
        </p>

        <label className="mt-4 block text-xs font-medium text-neutral-400">Required Portions</label>
        <input
          type="number"
          min={1}
          value={portions}
          onChange={(e) => setPortions(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
        />
        <button
          onClick={handleCalculate}
          className="mt-3 w-full rounded-lg bg-violet-500 py-2 text-sm font-medium text-neutral-950 hover:bg-violet-400"
        >
          Calculate
        </button>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {scaled && (
          <div className="mt-5">
            <p className="text-xs text-neutral-500">
              Scale factor ×{scaled.scaleFactor.toFixed(2)} for {scaled.requestedPortions} {recipe.yieldUnit}s
            </p>
            <ul className="mt-3 divide-y divide-neutral-800 text-sm">
              {scaled.ingredients.map((ingredient) => (
                <li key={ingredient.name} className="flex justify-between py-2">
                  <span className="text-neutral-300">{ingredient.name}</span>
                  <span className="font-medium text-violet-400">
                    {ingredient.scaledQuantity} {ingredient.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
