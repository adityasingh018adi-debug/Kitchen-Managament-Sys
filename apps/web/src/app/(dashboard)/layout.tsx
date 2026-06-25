import { Sidebar } from "@/components/sidebar";
import { RequireAuth } from "@/components/require-auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-neutral-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
