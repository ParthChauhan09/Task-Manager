import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Shield, Users, FolderKanban, CalendarDays, LogOut } from "lucide-react";
import { adminApi, AdminOverview } from "../../api/adminApi";
import { AuthUser } from "../../api/authApi";

interface AdminDashboardProps {
  user: AuthUser;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminApi
      .overview()
      .then((data) => setOverview(data))
      .finally(() => setIsLoading(false));
  }, []);

  const totalTasks = overview?.organizations.reduce((sum, org) => sum + org.tasks.length, 0) ?? 0;
  const totalCompleted = overview?.organizations.reduce(
    (sum, org) => sum + org.tasks.filter((task) => task.completed).length,
    0
  ) ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-500">
              <Shield className="h-3.5 w-3.5 text-slate-700" />
              Admin View
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight mt-3">
              Hello, {user.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              You can see every user, workspace, and task in the system.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="cursor-pointer inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Users" value={overview?.users.length ?? 0} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Workspaces" value={overview?.organizations.length ?? 0} icon={<FolderKanban className="h-4 w-4" />} />
          <StatCard label="Tasks" value={totalTasks} icon={<CalendarDays className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm xl:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Users</h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {overview?.users.length ?? 0} total
              </span>
            </div>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {overview?.users.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.email}</p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${item.role === "admin" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">All Workspaces</h2>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {totalCompleted}/{totalTasks} complete
              </span>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {overview?.organizations.map((org) => (
                <details key={org.id} className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{org.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {org.owner?.name || "Unknown owner"} • {org.tasks.length} tasks
                      </p>
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 group-open:text-slate-600">
                      View tasks
                    </span>
                  </summary>
                  <div className="mt-4 space-y-2">
                    {org.tasks.map((task) => (
                      <div key={task.id} className="rounded-xl bg-white border border-slate-200 px-3 py-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {task.date} • {task.priority} • {task.subtasks.length} subtasks
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${task.completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                            {task.completed ? "done" : "open"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {org.tasks.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No tasks in this workspace.</p>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="font-display text-3xl font-black tracking-tight mt-2 text-slate-900">{value}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
