"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/card";

interface Recipe {
  id: string;
  name: string;
  category: string;
  batchSize: string;
  yieldUnit: string;
  department: { name: string };
}

export default function RecipesPage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    api.get<Recipe[]>(`/recipes${query}`, token).then(setRecipes).catch(() => {});
  }, [token, search]);

  const canCreate = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Recipe Management</h1>
          <p className="mt-1 text-sm text-neutral-500">Search, view, and scale every recipe.</p>
        </div>
        {canCreate && (
          <Link
            href="/recipes/new"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-emerald-400"
          >
            New Recipe
          </Link>
        )}
      </div>

      <input
        placeholder="Search recipes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <Card className="h-full transition hover:border-emerald-500/40">
              <p className="text-xs uppercase tracking-wide text-neutral-500">{recipe.category}</p>
              <p className="mt-1 text-lg font-semibold text-white">{recipe.name}</p>
              <p className="mt-2 text-sm text-neutral-400">
                {recipe.department.name} · {recipe.batchSize} {recipe.yieldUnit}s
              </p>
            </Card>
          </Link>
        ))}
        {recipes.length === 0 && (
          <p className="text-sm text-neutral-500">No recipes found.</p>
        )}
      </div>
    </div>
  );
}
