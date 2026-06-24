import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Calendar, HelpCircle } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { TaskCard } from "../components/TaskCard";
import { DashboardDialogs } from "../components/dashboard/DashboardDialogs";
import { DateCapsuleStrip } from "../components/dashboard/DateCapsuleStrip";
import { CustomCursor } from "../components/CustomCursor";
import { ShortcutOverlay } from "../components/ShortcutOverlay";
import { GuideModal } from "../components/GuideModal";
import { formatDateLabel, sortDatesChronologically } from "../utils/dateHelpers";
import { Task } from "../types";
import { useMemo, useEffect, useRef, useState } from "react";
import { useGridNavigation } from "../hooks/useGridNavigation";

interface DateDetailPageProps {
  onLogout: () => void;
}

export function DateDetailPage({ onLogout: _ }: DateDetailPageProps) {
  const { orgId, date } = useParams<{ orgId: string; date: string }>();
  const navigate = useNavigate();

  // Reuse the same dashboard hook so all handlers + dialogs work identically
  const dash = useDashboard(orgId);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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

  const gridRef = useRef<HTMLDivElement>(null);
  useGridNavigation(gridRef, ".task-nav-item");

  const datePageShortcuts = [
    {
      keyStr: "p",
      label: "Add Task",
      action: () => dash.setTaskDialog({ isOpen: true, isEdit: false, prepopulatedDate: date }),
    },
    {
      keyStr: "ArrowLeft",
      displayKey: "←",
      label: "Prev Date Group",
      action: () => {
        if (allDates.length <= 1) return;
        const curIdx = allDates.indexOf(date!);
        const prevIdx = (curIdx - 1 + allDates.length) % allDates.length;
        navigate(`/workspace/${orgId}/date/${allDates[prevIdx]}`);
      },
    },
    {
      keyStr: "ArrowRight",
      displayKey: "→",
      label: "Next Date Group",
      action: () => {
        if (allDates.length <= 1) return;
        const curIdx = allDates.indexOf(date!);
        const nextIdx = (curIdx + 1) % allDates.length;
        navigate(`/workspace/${orgId}/date/${allDates[nextIdx]}`);
      },
    },
    {
      keyStr: "d",
      label: "Delete Date Group",
      action: () => dash.handleDeleteDateGroup(date!),
    },
  ];

  const totalCount = tasksOnDate.length;
  const doneCount = tasksOnDate.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  if (!dash.isHydrated) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F7] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-[#5856D6] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!org || !date) {
    return (
      <div className="fixed inset-0 bg-[#F5F5F7] flex flex-col items-center justify-center gap-4 select-none">
        <p className="text-sm text-[#8E8E93]">Workspace or date not found.</p>
        <button onClick={() => navigate("/")} className="text-xs font-semibold text-[#5856D6] hover:underline">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1C1C1E] font-sans select-none">
      <CustomCursor />

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-[#E5E5EA]/60">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4">
          {/* Back + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/")}
              className="cursor-pointer h-9 w-9 rounded-full border border-[#E5E5EA] bg-[#F5F5F7] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]/60 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#8E8E93] shrink-0" />
                <h1 className="font-display text-lg sm:text-xl font-semibold tracking-tight text-[#1C1C1E] truncate">
                  {formatDateLabel(date)}
                </h1>
              </div>
              <p className="text-[11px] text-[#8E8E93] tracking-wide mt-0.5">
                {org.name} · {doneCount}/{totalCount} complete
              </p>
            </div>
          </div>

          {/* Progress + add task */}
          <div className="flex items-center gap-3 shrink-0">
            {totalCount > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-24 bg-[#E5E5EA] rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-[#5856D6] rounded-full"
                  />
                </div>
                <span className="text-[10px] text-[#8E8E93]">{Math.round(progressPercent)}%</span>
              </div>
            )}
            <button
              id="date-page-help-btn"
              onClick={() => setIsGuideOpen(true)}
              title="App Guide"
              className="cursor-pointer h-9 w-9 rounded-full border border-[#E5E5EA] bg-[#F5F5F7] hover:bg-[#E5E5EA]/60 flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => dash.setTaskDialog({ isOpen: true, isEdit: false, prepopulatedDate: date })}
              className="cursor-pointer h-9 px-4 bg-[#5856D6] hover:bg-[#4846B6] text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-[#5856D6]/15 transition-all active:scale-95 animate-checkbox-pop"
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
            <div className="w-14 h-14 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center mb-4 shadow-sm shadow-[#1C1C1E]/02">
              <Calendar className="h-7 w-7 text-[#8E8E93]/60" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[#1C1C1E] tracking-tight">No tasks for this date</h3>
            <p className="text-xs text-[#8E8E93] mt-2 max-w-xs leading-relaxed">
              Add a task to get started on this day.
            </p>
            <button
              onClick={() => dash.setTaskDialog({ isOpen: true, isEdit: false, prepopulatedDate: date })}
              className="cursor-pointer mt-5 h-9 px-4 bg-[#5856D6] hover:bg-[#4846B6] text-white rounded-full text-xs font-medium shadow-sm shadow-[#5856D6]/15 transition-all"
            >
              + Add First Task
            </button>
          </div>
        ) : (
          <motion.div
            ref={gridRef}
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

      <ShortcutOverlay shortcuts={datePageShortcuts} />
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

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
