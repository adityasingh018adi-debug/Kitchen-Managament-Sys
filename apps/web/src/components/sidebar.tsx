"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 py-6"
      >
        <p className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-lg font-semibold text-transparent">
          KitchenOS AI
        </p>
        <p className="text-xs text-neutral-500">Central Kitchen Management</p>
      </motion.div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map((item, index) => {
          const active = pathname === item.href;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.025, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={item.href}
                className={clsx(
                  "relative block rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "text-violet-400" : "text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-100",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-violet-500/10"
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="border-t border-neutral-800 p-4"
      >
        <p className="text-sm text-neutral-200">{user?.username}</p>
        <p className="text-xs text-neutral-500">{user?.role}</p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={logout}
          className="mt-3 w-full rounded-lg border border-neutral-700 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-800"
        >
          Sign out
        </motion.button>
      </motion.div>
    </aside>
  );
}
