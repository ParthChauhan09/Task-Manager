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
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-[#5856D6] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1C1C1E] font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E5E5EA] bg-white text-[11px] font-medium tracking-[0.25em] uppercase text-[#8E8E93]">
              <Shield className="h-3.5 w-3.5 text-[#5856D6]" />
              Admin View
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#1C1C1E] mt-3.5">
              Hello, {user.name}
            </h1>
            <p className="text-sm text-[#8E8E93] mt-1.5">
              You can see every user, workspace, and task in the system.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="cursor-pointer inline-flex items-center gap-2 h-10 px-5 rounded-full border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-[#1C1C1E] text-xs font-medium transition-colors shadow-sm shadow-[#1C1C1E]/02"
          >
            <LogOut className="h-3.5 w-3.5 text-[#8E8E93]" />
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Users" value={overview?.users.length ?? 0} icon={<Users className="h-4 w-4" />} />
          <StatCard label="Workspaces" value={overview?.organizations.length ?? 0} icon={<FolderKanban className="h-4 w-4" />} />
          <StatCard label="Tasks" value={totalTasks} icon={<CalendarDays className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="bg-white border border-[#E5E5EA]/60 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] xl:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">Users</h2>
              <span className="text-[10px] font-medium text-[#8E8E93] uppercase tracking-wider bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                {overview?.users.length ?? 0} total
              </span>
            </div>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              {overview?.users.map((item) => (
                <div key={item.id} className="rounded-[20px] border border-[#E5E5EA]/60 bg-[#F5F5F7]/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#1C1C1E]">{item.name}</p>
                      <p className="text-xs text-[#8E8E93] mt-0.5">{item.email}</p>
                    </div>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full ${item.role === "admin" ? "bg-[#5856D6] text-white shadow-sm" : "bg-[#E5E5EA] text-[#8E8E93]"}`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-[#E5E5EA]/60 rounded-[28px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1C1C1E]">All Workspaces</h2>
              <span className="text-[10px] font-medium text-[#8E8E93] uppercase tracking-wider bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                {totalCompleted}/{totalTasks} complete
              </span>
            </div>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {overview?.organizations.map((org) => (
                <details key={org.id} className="group rounded-[20px] border border-[#E5E5EA]/60 bg-[#F5F5F7]/70 p-4 transition-all duration-200">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#1C1C1E]">{org.name}</p>
                      <p className="text-xs text-[#8E8E93] mt-0.5">
                        {org.owner?.name || "Unknown owner"} • {org.tasks.length} tasks
                      </p>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#8E8E93] group-open:text-[#1C1C1E]">
                      View tasks
                    </span>
                  </summary>
                  <div className="mt-4 space-y-2">
                    {org.tasks.map((task) => (
                      <div key={task.id} className="rounded-[16px] bg-white border border-[#E5E5EA]/60 px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1C1C1E] truncate">{task.title}</p>
                            <p className="text-[11px] text-[#8E8E93] mt-0.5">
                              {task.date} • {task.priority} • {task.subtasks.length} subtasks
                            </p>
                          </div>
                          <span className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-full ${task.completed ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#F5F5F7] text-[#8E8E93]"}`}>
                            {task.completed ? "done" : "open"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {org.tasks.length === 0 ? (
                      <p className="text-xs text-[#8E8E93] italic">No tasks in this workspace.</p>
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
    <div className="bg-white border border-[#E5E5EA]/60 rounded-[24px] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#8E8E93]">{label}</p>
          <p className="font-display text-3xl font-semibold tracking-tight mt-2 text-[#1C1C1E]">{value}</p>
        </div>
        <div className="h-11 w-11 rounded-full bg-[#5856D6] text-white flex items-center justify-center shadow-sm shadow-[#5856D6]/15">
          {icon}
        </div>
      </div>
    </div>
  );
}
