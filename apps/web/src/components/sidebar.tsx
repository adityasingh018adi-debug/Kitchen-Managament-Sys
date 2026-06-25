"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuthStore } from "@/lib/auth-store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/recipes", label: "Recipe Management" },
  { href: "/recipes", label: "Production Calculator", note: "calculator lives inside a recipe" },
  { href: "/tasks", label: "Daily Tasks" },
  { href: "/attendance", label: "Attendance" },
  { href: "/face-recognition", label: "Face Recognition" },
  { href: "/ai-inspection", label: "AI Food Inspection" },
  { href: "/departments", label: "Departments" },
  { href: "/employees", label: "Employees" },
  { href: "/inventory", label: "Inventory" },
  { href: "/reports", label: "Reports" },
  { href: "/notifications", label: "Notifications" },
  { href: "/whatsapp", label: "WhatsApp" },
  { href: "/ai-analytics", label: "AI Analytics" },
  { href: "/admin", label: "Admin Panel" },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-neutral-800 bg-neutral-950/95">
      <div className="px-5 py-6">
        <p className="text-lg font-semibold text-white">KitchenOS AI</p>
        <p className="text-xs text-neutral-500">Central Kitchen Management</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              "block rounded-lg px-3 py-2 text-sm transition",
              pathname === item.href
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-100",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-neutral-800 p-4">
        <p className="text-sm text-neutral-200">{user?.username}</p>
        <p className="text-xs text-neutral-500">{user?.role}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg border border-neutral-700 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
