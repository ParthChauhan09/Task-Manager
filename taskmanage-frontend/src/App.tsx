import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Plus,
  Calendar,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Inbox,
  Trash2,
  Menu,
  LogOut,
} from "lucide-react";

import { useOrganizations } from "./hooks/useOrganizations";
import { useAuth } from "./context/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { Sidebar } from "./components/Sidebar";
import { TaskCard } from "./components/TaskCard";
import { CustomCursor } from "./components/CustomCursor";
import { formatDateLabel, sortDatesChronologically } from "./utils/dateHelpers";
import { Priority, Task } from "./types";
import {
  OrgDialog,
  DateDialog,
  TaskDialog,
  ConfirmDialog,
} from "./components/Dialogs";

export default function App() {
  const { user, isLoading: authLoading, logout } = useAuth();

  // Show auth screen while session is being restored or user is not logged in
  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return <Dashboard onLogout={logout} />;
}

// ── Dashboard — only rendered when user is authenticated ─────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const {
    organizations,
    isHydrated,
    createOrg,
    renameOrg,
    deleteOrg,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  } = useOrganizations();

  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // Dialog states
  const [orgDialog, setOrgDialog] = useState<{
    isOpen: boolean; isEdit: boolean; initialName?: string; targetId?: string;
  }>({ isOpen: false, isEdit: false });

  const [dateDialog, setDateDialog] = useState<{ isOpen: boolean }>({ isOpen: false });

  const [taskDialog, setTaskDialog] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    initialValues?: { title: string; description?: string; date: string; priority: Priority };
    targetTaskId?: string;
    prepopulatedDate?: string;
  }>({ isOpen: false, isEdit: false });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Resolve active org
  const activeOrg = useMemo(() => {
    if (!isHydrated || organizations.length === 0) return null;
    const found = organizations.find((o) => o.id === activeOrgId);
    if (found) return found;
    setActiveOrgId(organizations[0].id);
    return organizations[0];
  }, [isHydrated, organizations, activeOrgId]);

  const filteredTasks = useMemo(() => {
    if (!activeOrg) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeOrg.tasks;
    return activeOrg.tasks.filter((task) =>
      task.title.toLowerCase().includes(query) ||
      (task.description?.toLowerCase().includes(query) ?? false) ||
      task.subtasks.some((s) => s.title.toLowerCase().includes(query))
    );
  }, [activeOrg, searchQuery]);

  const groupedTasksMap = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach((task) => {
      if (!groups[task.date]) groups[task.date] = [];
      groups[task.date].push(task);
    });
    return groups;
  }, [filteredTasks]);

  const sortedDates = useMemo(
    () => sortDatesChronologically([...new Set<string>(filteredTasks.map((t) => t.date))]),
    [filteredTasks]
  );

  // ── Org handlers ──────────────────────────────────────────────────────────

  const handleCreateOrganization = async (name: string) => {
    const org = await createOrg(name);
    setActiveOrgId(org.id);
  };

  const handleRenameOrganization = async (id: string, newName: string) => {
    await renameOrg(id, newName);
  };

  const handleDeleteOrganization = (id: string) => {
    const target = organizations.find((o) => o.id === id);
    if (!target) return;
    setConfirmDialog({
      isOpen: true,
      title: "Archive Workspace",
      message: `Are you absolutely sure you want to delete workspace "${target.name}"? All tasks will be permanently deleted.`,
      onConfirm: async () => {
        await deleteOrg(id);
        if (activeOrgId === id) {
          const remaining = organizations.filter((o) => o.id !== id);
          setActiveOrgId(remaining.length > 0 ? remaining[0].id : null);
        }
      },
    });
  };

  // ── Date group handlers ───────────────────────────────────────────────────

  const handleAddDateGroup = (dateStr: string) => {
    setTaskDialog({ isOpen: true, isEdit: false, prepopulatedDate: dateStr });
  };

  const handleDeleteDateGroup = (dateStr: string) => {
    if (!activeOrg) return;
    const taskCount = activeOrg.tasks.filter((t) => t.date === dateStr).length;
    setConfirmDialog({
      isOpen: true,
      title: "Delete Date Group",
      message: `Delete "${formatDateLabel(dateStr)}" and its ${taskCount} task(s)? This is permanent.`,
      onConfirm: async () => {
        const tasksOnDate = activeOrg.tasks.filter((t) => t.date === dateStr);
        await Promise.all(tasksOnDate.map((t) => deleteTask(activeOrg.id, t.id)));
      },
    });
  };

  // ── Task handlers ─────────────────────────────────────────────────────────

  const handleAddOrUpdateTask = async (fields: {
    title: string; description: string; date: string; priority: Priority;
  }) => {
    if (!activeOrg) return;
    if (taskDialog.isEdit && taskDialog.targetTaskId) {
      await updateTask(activeOrg.id, taskDialog.targetTaskId, {
        title: fields.title,
        description: fields.description || undefined,
        date: fields.date,
        priority: fields.priority,
      });
    } else {
      await createTask(activeOrg.id, {
        title: fields.title,
        description: fields.description || undefined,
        date: fields.date,
        priority: fields.priority,
      });
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    if (!activeOrg) return;
    const task = activeOrg.tasks.find((t) => t.id === taskId);
    if (!task) return;
    await toggleTaskComplete(activeOrg.id, taskId, task.completed);
  };

  const handleTriggerEditTask = (task: Task) => {
    setTaskDialog({
      isOpen: true,
      isEdit: true,
      targetTaskId: task.id,
      initialValues: {
        title: task.title,
        description: task.description,
        date: task.date,
        priority: task.priority,
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!activeOrg) return;
    const target = activeOrg.tasks.find((t) => t.id === taskId);
    if (!target) return;
    setConfirmDialog({
      isOpen: true,
      title: "Delete Task",
      message: `Are you sure you want to delete "${target.title}"?`,
      onConfirm: async () => {
        await deleteTask(activeOrg.id, taskId);
      },
    });
  };

  // ── Subtask handlers ──────────────────────────────────────────────────────

  const handleAddSubtask = async (taskId: string, title: string) => {
    if (!activeOrg) return;
    await createSubtask(activeOrg.id, taskId, title);
  };

  const handleToggleSubtaskComplete = async (taskId: string, subtaskId: string) => {
    if (!activeOrg) return;
    const task = activeOrg.tasks.find((t) => t.id === taskId);
    const sub = task?.subtasks.find((s) => s.id === subtaskId);
    if (!sub) return;
    await updateSubtask(activeOrg.id, taskId, subtaskId, { completed: !sub.completed });
  };

  const handleEditSubtaskTitle = async (taskId: string, subtaskId: string, newTitle: string) => {
    if (!activeOrg) return;
    await updateSubtask(activeOrg.id, taskId, subtaskId, { title: newTitle });
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    if (!activeOrg) return;
    await deleteSubtask(activeOrg.id, taskId, subtaskId);
  };

  const toggleCollapseDate = (dateStr: string) => {
    setCollapsedDates((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  // Loading spinner while fetching orgs from API
  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full"
        />
        <h4 className="font-display font-medium text-slate-600 text-sm">Loading your workspaces...</h4>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      <CustomCursor />

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar
          organizations={organizations}
          activeOrgId={activeOrgId}
          onSelectOrg={(id) => { setActiveOrgId(id); setSearchQuery(""); }}
          onCreateOrg={() => setOrgDialog({ isOpen: true, isEdit: false })}
          onRenameOrg={(id, currentName) =>
            setOrgDialog({ isOpen: true, isEdit: true, initialName: currentName, targetId: id })
          }
          onDeleteOrg={handleDeleteOrganization}
          onLogout={onLogout}
        />
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed inset-y-0 left-0 w-72 h-full z-50 md:hidden shadow-2xl flex"
            >
              <Sidebar
                organizations={organizations}
                activeOrgId={activeOrgId}
                onSelectOrg={(id) => { setActiveOrgId(id); setSearchQuery(""); setIsMobileSidebarOpen(false); }}
                onCreateOrg={() => { setOrgDialog({ isOpen: true, isEdit: false }); setIsMobileSidebarOpen(false); }}
                onRenameOrg={(id, currentName) => {
                  setOrgDialog({ isOpen: true, isEdit: true, initialName: currentName, targetId: id });
                  setIsMobileSidebarOpen(false);
                }}
                onDeleteOrg={(id) => { handleDeleteOrganization(id); setIsMobileSidebarOpen(false); }}
                onLogout={onLogout}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/40 overflow-hidden font-sans">
        {activeOrg ? (
          <>
            {/* Top bar */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  id="mobile-hamburger-menu-btn"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div
                  className="flex flex-col text-left group cursor-pointer min-w-0"
                  onClick={() => setOrgDialog({ isOpen: true, isEdit: true, initialName: activeOrg.name, targetId: activeOrg.id })}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {activeOrg.name}
                    </h2>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to Rename
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 tracking-wide mt-0.5">
                    Workspace Index // {activeOrg.tasks.length} standard commitments
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full max-w-xs sm:w-60">
                  <input
                    id="search-tasks-field"
                    type="text"
                    placeholder="Search tasks, descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 text-xs border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-3 py-2.5 h-10 focus:outline-none focus:border-slate-400 transition-all focus:ring-1 focus:ring-slate-300"
                  />
                  <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                  {searchQuery && (
                    <button id="clear-search-btn" onClick={() => setSearchQuery("")} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  id="header-add-date-btn"
                  onClick={() => setDateDialog({ isOpen: true })}
                  className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Add Date
                </button>
                <button
                  id="header-create-task-btn"
                  onClick={() => setTaskDialog({ isOpen: true, isEdit: false })}
                  className="cursor-pointer h-10 px-5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Plan Task
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10 relative z-10 bg-slate-50/20">
              {searchQuery && (
                <div className="flex items-center gap-2 mb-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  <Filter className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    Filtering: <strong className="text-slate-900">"{searchQuery}"</strong> ({filteredTasks.length} matches)
                  </span>
                  <button id="search-filter-clear" onClick={() => setSearchQuery("")} className="ml-auto text-indigo-600 hover:text-indigo-500 font-semibold">
                    Clear Filter
                  </button>
                </div>
              )}

              {sortedDates.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <Inbox className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-display font-black text-lg text-slate-900 tracking-tight">
                    {searchQuery ? "No matching schedules found" : "Workspace is wide open"}
                  </h3>
                  <p className="max-w-xs text-xs text-slate-400 font-sans mt-2.5 leading-relaxed">
                    {searchQuery
                      ? "Refine your terms or clear filters to recover missing tasks."
                      : "Add a date or draft your first task to get started."}
                  </p>
                  {!searchQuery && (
                    <div className="flex gap-2.5 mt-6">
                      <button
                        id="empty-dashboard-add-date"
                        onClick={() => setDateDialog({ isOpen: true })}
                        className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                      >
                        + Add Calendar Date
                      </button>
                      <button
                        id="empty-dashboard-add-task"
                        onClick={() => setTaskDialog({ isOpen: true, isEdit: false })}
                        className="cursor-pointer h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
                      >
                        + Draft Initial Task
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                sortedDates.map((dateStr, index) => {
                  const tasksInDate = groupedTasksMap[dateStr] || [];
                  const isCollapsed = !!collapsedDates[dateStr];
                  const totalCount = tasksInDate.length;
                  const completeCount = tasksInDate.filter((t) => t.completed).length;
                  const dateProgressPercent = totalCount > 0 ? (completeCount / totalCount) * 100 : 0;

                  return (
                    <motion.div
                      key={dateStr}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          <button
                            id={`collapse-date-btn-${dateStr}`}
                            onClick={() => toggleCollapseDate(dateStr)}
                            className="cursor-pointer p-1 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
                          >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <h3 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                            {formatDateLabel(dateStr)}
                          </h3>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                            {completeCount} / {totalCount} Complete
                          </span>
                          {totalCount > 0 && (
                            <div className="w-16 hidden sm:block bg-slate-200 rounded-full h-1 overflow-hidden">
                              <div className="bg-slate-900 h-full transition-all duration-300" style={{ width: `${dateProgressPercent}%` }} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            id={`add-task-to-date-${dateStr}`}
                            onClick={() => handleAddDateGroup(dateStr)}
                            className="cursor-pointer p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`delete-date-group-${dateStr}`}
                            onClick={() => handleDeleteDateGroup(dateStr)}
                            className="cursor-pointer p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 py-1">
                              {tasksInDate.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  onToggleComplete={handleToggleTaskComplete}
                                  onEditTask={handleTriggerEditTask}
                                  onDeleteTask={handleDeleteTask}
                                  onAddSubtask={handleAddSubtask}
                                  onToggleSubtask={handleToggleSubtaskComplete}
                                  onEditSubtask={handleEditSubtaskTitle}
                                  onDeleteSubtask={handleDeleteSubtask}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/55 relative">
            <button
              id="mobile-hamburger-empty-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="absolute top-6 left-6 cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 focus:outline-none transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Sparkles className="h-12 w-12 text-slate-800 mb-4 animate-pulse" />
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight uppercase">
              Start taskManage
            </h2>
            <p className="max-w-md text-xs text-slate-500 font-sans mt-3 leading-relaxed">
              Create a workspace to start planning tasks and tracking deadlines.
            </p>
            <button
              id="global-create-workspace-btn"
              onClick={() => setOrgDialog({ isOpen: true, isEdit: false })}
              className="cursor-pointer mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              + Create Workspace
            </button>
            <button
              onClick={onLogout}
              className="cursor-pointer mt-3 text-xs text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <OrgDialog
        isOpen={orgDialog.isOpen}
        onClose={() => setOrgDialog({ isOpen: false, isEdit: false })}
        onSubmit={(name) => {
          if (orgDialog.isEdit && orgDialog.targetId) {
            handleRenameOrganization(orgDialog.targetId, name);
          } else {
            handleCreateOrganization(name);
          }
        }}
        initialValue={orgDialog.initialName}
        isEdit={orgDialog.isEdit}
      />

      <DateDialog
        isOpen={dateDialog.isOpen}
        onClose={() => setDateDialog({ isOpen: false })}
        onSubmit={handleAddDateGroup}
      />

      <TaskDialog
        isOpen={taskDialog.isOpen}
        onClose={() => setTaskDialog({ isOpen: false, isEdit: false })}
        onSubmit={handleAddOrUpdateTask}
        initialValues={
          taskDialog.isEdit
            ? taskDialog.initialValues
            : taskDialog.prepopulatedDate
            ? { title: "", date: taskDialog.prepopulatedDate, priority: "medium" }
            : undefined
        }
        isEdit={taskDialog.isEdit}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
}
