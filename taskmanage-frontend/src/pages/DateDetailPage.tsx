import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Calendar } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { TaskCard } from "../components/TaskCard";
import { DashboardDialogs } from "../components/dashboard/DashboardDialogs";
import { DateCapsuleStrip } from "../components/dashboard/DateCapsuleStrip";
import { CustomCursor } from "../components/CustomCursor";
import { formatDateLabel, sortDatesChronologically } from "../utils/dateHelpers";
import { Task } from "../types";
import { useMemo, useEffect } from "react";

interface DateDetailPageProps {
  onLogout: () => void;
}

export function DateDetailPage({ onLogout: _ }: DateDetailPageProps) {
  const { orgId, date } = useParams<{ orgId: string; date: string }>();
  const navigate = useNavigate();

  // Reuse the same dashboard hook so all handlers + dialogs work identically
  const dash = useDashboard(orgId);

  // Esc → go back to dashboard (only when no dialog is open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      
      // Don't navigate if user is typing
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Check if task detail modal or context menu is open
      const isCardOverlayOpen = document.querySelector('.z-\\[100\\]') || document.querySelector('.z-\\[70\\]');
      if (isCardOverlayOpen) return;

      const anyDialogOpen =
        dash.orgDialog.isOpen ||
        dash.dateDialog.isOpen ||
        dash.moveTaskDateDialog.isOpen ||
        dash.taskDialog.isOpen ||
        dash.confirmDialog.isOpen;
      if (!anyDialogOpen) navigate("/");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, dash.orgDialog.isOpen, dash.dateDialog.isOpen, dash.moveTaskDateDialog.isOpen, dash.taskDialog.isOpen, dash.confirmDialog.isOpen]);

  const org = useMemo(
    () => dash.organizations.find((o) => o.id === orgId) ?? null,
    [dash.organizations, orgId]
  );

  const tasksOnDate: Task[] = useMemo(
    () => (org ? org.tasks.filter((t) => t.date === date) : []),
    [org, date]
  );

  // All dates for this org — for the capsule strip
  const allDates = useMemo(() => {
    if (!org) return [];
    return sortDatesChronologically([...new Set(org.tasks.map((t) => t.date))]);
  }, [org]);

  const tasksByDate = useMemo(() => {
    if (!org) return {};
    const map: Record<string, Task[]> = {};
    org.tasks.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return map;
  }, [org]);

  const totalCount = tasksOnDate.length;
  const doneCount = tasksOnDate.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  if (!dash.isHydrated) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!org || !date) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-500">Workspace or date not found.</p>
        <button onClick={() => navigate("/")} className="text-xs font-semibold text-slate-900 underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <CustomCursor />

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4">
          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <h1 className="font-display text-lg sm:text-xl font-black tracking-tight text-slate-900 truncate">
                  {formatDateLabel(date)}
                </h1>
              </div>
              <p className="text-[11px] font-mono text-slate-400 tracking-wide mt-0.5">
                {org.name} · {doneCount}/{totalCount} complete
              </p>
            </div>
          </div>

          {/* Progress + add task */}
          <div className="flex items-center gap-3 shrink-0">
            {totalCount > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-slate-900 rounded-full"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{Math.round(progressPercent)}%</span>
              </div>
            )}
            <button
              onClick={() => dash.setTaskDialog({ isOpen: true, isEdit: false, prepopulatedDate: date })}
              className="cursor-pointer h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Date capsule strip — navigate between dates */}
        <DateCapsuleStrip
          orgId={orgId!}
          dates={allDates}
          tasksByDate={tasksByDate}
          activeDateStr={date}
        />
      </div>

      {/* Task grid */}
      <div className="px-4 sm:px-8 py-8">
        {tasksOnDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <Calendar className="h-7 w-7 text-slate-300" />
            </div>
            <h3 className="font-display font-black text-lg text-slate-900 tracking-tight">No tasks for this date</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              Add a task to get started on this day.
            </p>
            <button
              onClick={() => dash.setTaskDialog({ isOpen: true, isEdit: false, prepopulatedDate: date })}
              className="cursor-pointer mt-5 h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all"
            >
              + Add First Task
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8"
          >
            {tasksOnDate.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={dash.handleToggleTaskComplete}
                onEditTask={dash.handleTriggerEditTask}
                onMoveTaskDate={dash.handleTriggerMoveTaskDate}
                onDeleteTask={dash.handleDeleteTask}
                onAddSubtask={dash.handleAddSubtask}
                onToggleSubtask={dash.handleToggleSubtask}
                onEditSubtask={dash.handleEditSubtask}
                onDeleteSubtask={dash.handleDeleteSubtask}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Reuse same dialogs — they work with any orgId via useDashboard */}
      <DashboardDialogs
        orgDialog={dash.orgDialog}
        setOrgDialog={dash.setOrgDialog}
        dateDialog={dash.dateDialog}
        setDateDialog={dash.setDateDialog}
        moveTaskDateDialog={dash.moveTaskDateDialog}
        setMoveTaskDateDialog={dash.setMoveTaskDateDialog}
        taskDialog={dash.taskDialog}
        setTaskDialog={dash.setTaskDialog}
        confirmDialog={dash.confirmDialog}
        setConfirmDialog={dash.setConfirmDialog}
        onSubmitOrg={(name) => {
          if (dash.orgDialog.isEdit && dash.orgDialog.targetId) {
            dash.handleRenameOrg(dash.orgDialog.targetId, name);
          } else {
            dash.handleCreateOrg(name);
          }
        }}
        onSubmitDate={dash.handleAddDateGroup}
        onSubmitMoveTaskDate={dash.handleMoveTaskDate}
        onSubmitTask={dash.handleAddOrUpdateTask}
      />
    </div>
  );
}
