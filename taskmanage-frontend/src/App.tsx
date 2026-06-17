/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Plus, 
  Calendar, 
  Filter, 
  CheckCircle, 
  Clock, 
  X, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  Inbox,
  AlertCircle,
  Trash2,
  Menu
} from "lucide-react";

import { useLocalStorage } from "./hooks/useLocalStorage";
import { Sidebar } from "./components/Sidebar";
import { TaskCard } from "./components/TaskCard";
import { CustomCursor } from "./components/CustomCursor";
import { formatDateLabel, sortDatesChronologically } from "./utils/dateHelpers";
import { Priority, Task, Subtask, Organization } from "./types";
import { 
  OrgDialog, 
  DateDialog, 
  TaskDialog, 
  ConfirmDialog 
} from "./components/Dialogs";

export default function App() {
  const { organizations, setOrganizations, isHydrated } = useLocalStorage();
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Track collapsed state for date groups: Record<date_string, boolean>
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  // Dynamic Dialog Visibility States
  const [orgDialog, setOrgDialog] = useState<{ isOpen: boolean; isEdit: boolean; initialName?: string; targetId?: string }>({
    isOpen: false,
    isEdit: false,
  });
  
  const [dateDialog, setDateDialog] = useState<{ isOpen: boolean }>({ isOpen: false });
  
  const [taskDialog, setTaskDialog] = useState<{ 
    isOpen: boolean; 
    isEdit: boolean; 
    initialValues?: { title: string; description?: string; date: string; priority: Priority };
    targetTaskId?: string;
    prepopulatedDate?: string;
  }>({
    isOpen: false,
    isEdit: false,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Automatically select the first organization if none is active on load
  const activeOrg = useMemo(() => {
    if (!isHydrated || organizations.length === 0) return null;
    
    // Fallback if activeOrgId is null or stale
    const found = organizations.find((o) => o.id === activeOrgId);
    if (found) return found;
    
    // Set first as default
    setActiveOrgId(organizations[0].id);
    return organizations[0];
  }, [isHydrated, organizations, activeOrgId]);

  // Compute tasks filtered by searchQuery
  const filteredTasks = useMemo(() => {
    if (!activeOrg) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeOrg.tasks;

    return activeOrg.tasks.filter((task) => {
      const matchesTaskTitle = task.title.toLowerCase().includes(query);
      const matchesTaskDesc = task.description?.toLowerCase().includes(query) || false;
      const matchesSubtasks = task.subtasks.some((sub) => sub.title.toLowerCase().includes(query));
      return matchesTaskTitle || matchesTaskDesc || matchesSubtasks;
    });
  }, [activeOrg, searchQuery]);

  // Group filtered tasks by their dates (including any empty custom dates created by user)
  const groupedTasksMap = useMemo(() => {
    if (!activeOrg) return {};
    
    const groups: Record<string, Task[]> = {};
    
    // 1. Initialize empty groups for any explicitly added empty customDates
    if (activeOrg.tasks.length === 0 && activeOrg.id) {
      // Just support empty states cleanly
    }

    // 2. Put tasks in corresponding groups
    filteredTasks.forEach((task) => {
      if (!groups[task.date]) {
        groups[task.date] = [];
      }
      groups[task.date].push(task);
    });

    return groups;
  }, [activeOrg, filteredTasks]);

  // Unified sorted timelines of calendar date strings
  const sortedDates = useMemo(() => {
    if (!activeOrg) return [];
    
    // Collect all unique date strings across current tasks
    const datesSet = new Set<string>(filteredTasks.map((t) => t.date));
    
    // If a search is NOT active, also merge in empty dates explicitly scheduled to demonstrate them
    if (!searchQuery.trim()) {
      // We can map mock schedules or custom registered schedules if trackable in runtime,
      // but otherwise unique task dates map directly.
    }

    return sortDatesChronologically(Array.from(datesSet));
  }, [activeOrg, filteredTasks, searchQuery]);

  // State modification functions:
  
  // Organization Handlers
  const handleCreateOrganization = (name: string) => {
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name,
      tasks: [],
    };
    const updated = [...organizations, newOrg];
    setOrganizations(updated);
    setActiveOrgId(newOrg.id); // Fast transition straight to the new organization!
  };

  const handleRenameOrganization = (id: string, newName: string) => {
    const updated = organizations.map((o) => {
      if (o.id === id) {
        return { ...o, name: newName };
      }
      return o;
    });
    setOrganizations(updated);
  };

  const handleDeleteOrganization = (id: string) => {
    const target = organizations.find((o) => o.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: "Archive Workspace",
      message: `Are you absolutely sure you want to delete workspace "${target.name}"? All associated tasks and subtasks will be permanently deleted.`,
      onConfirm: () => {
        const updated = organizations.filter((o) => o.id !== id);
        setOrganizations(updated);
        if (activeOrgId === id) {
          setActiveOrgId(updated.length > 0 ? updated[0].id : null);
        }
      },
    });
  };

  // Date Headers Actions
  const handleAddDateGroup = (dateStr: string) => {
    if (!activeOrg) return;
    
    // Since dates belong to tasks, adding a Date Group pre-opens a quick task dialog pinned to that date!
    // This immediately satisfies the "add task to date" mapping in a single friction-free action sequence.
    setTaskDialog({
      isOpen: true,
      isEdit: false,
      prepopulatedDate: dateStr,
    });
  };

  const handleDeleteDateGroup = (dateStr: string) => {
    if (!activeOrg) return;

    const taskCount = activeOrg.tasks.filter((t) => t.date === dateStr).length;

    setConfirmDialog({
      isOpen: true,
      title: `Delete Date Group`,
      message: `Deletions are permanent. Delete "${formatDateLabel(dateStr)}" and its ${taskCount} associated tasks?`,
      onConfirm: () => {
        const updatedOrgs = organizations.map((o) => {
          if (o.id === activeOrg.id) {
            return {
              ...o,
              tasks: o.tasks.filter((t) => t.date !== dateStr),
            };
          }
          return o;
        });
        setOrganizations(updatedOrgs);
      },
    });
  };

  // Tasks Actions
  const handleAddOrUpdateTask = (fields: {
    title: string;
    description: string;
    date: string;
    priority: Priority;
  }) => {
    if (!activeOrg) return;

    if (taskDialog.isEdit && taskDialog.targetTaskId) {
      // UPDATE Task
      const updatedOrgs = organizations.map((o) => {
        if (o.id === activeOrg.id) {
          return {
            ...o,
            tasks: o.tasks.map((t) => {
              if (t.id === taskDialog.targetTaskId) {
                return {
                  ...t,
                  title: fields.title,
                  description: fields.description || undefined,
                  date: fields.date,
                  priority: fields.priority,
                };
              }
              return t;
            }),
          };
        }
        return o;
      });
      setOrganizations(updatedOrgs);
    } else {
      // CREATE Task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: fields.title,
        description: fields.description || undefined,
        date: fields.date,
        priority: fields.priority,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: [],
      };
      
      const updatedOrgs = organizations.map((o) => {
        if (o.id === activeOrg.id) {
          return {
            ...o,
            tasks: [...o.tasks, newTask],
          };
        }
        return o;
      });
      setOrganizations(updatedOrgs);
    }
  };

  const handleToggleTaskComplete = (taskId: string) => {
    if (!activeOrg) return;
    const updatedOrgs = organizations.map((o) => {
      if (o.id === activeOrg.id) {
        return {
          ...o,
          tasks: o.tasks.map((t) => {
            if (t.id === taskId) {
              const nextComplete = !t.completed;
              // If task completed, complete all its subtasks too! (Great UX)
              const updatedSubtasks = t.subtasks.map((sub) => ({
                ...sub,
                completed: nextComplete,
              }));
              return { ...t, completed: nextComplete, subtasks: updatedSubtasks };
            }
            return t;
          }),
        };
      }
      return o;
    });
    setOrganizations(updatedOrgs);
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
    const targetTask = activeOrg.tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    // Inline prompt confirm or full Dialog depending on severity
    setConfirmDialog({
      isOpen: true,
      title: "Delete Task",
      message: `Are you sure you want to delete task "${targetTask.title}"?`,
      onConfirm: () => {
        const updatedOrgs = organizations.map((o) => {
          if (o.id === activeOrg.id) {
            return {
              ...o,
              tasks: o.tasks.filter((t) => t.id !== taskId),
            };
          }
          return o;
        });
        setOrganizations(updatedOrgs);
      },
    });
  };

  // Subtask Actions Handlers
  const handleAddSubtask = (taskId: string, title: string) => {
    if (!activeOrg) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      title,
      completed: false,
    };

    const updatedOrgs = organizations.map((o) => {
      if (o.id === activeOrg.id) {
        return {
          ...o,
          tasks: o.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks: [...t.subtasks, newSub],
                // If the parent task was logged complete, mark it incomplete so user can perform the new subtask!
                completed: false,
              };
            }
            return t;
          }),
        };
      }
      return o;
    });
    setOrganizations(updatedOrgs);
  };

  const handleToggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    if (!activeOrg) return;
    const updatedOrgs = organizations.map((o) => {
      if (o.id === activeOrg.id) {
        return {
          ...o,
          tasks: o.tasks.map((t) => {
            if (t.id === taskId) {
              const updatedSubs = t.subtasks.map((sub) => {
                if (sub.id === subtaskId) {
                  return { ...sub, completed: !sub.completed };
                }
                return sub;
              });
              
              // Automatically mark parent complete if ALL subtasks are complete in this action!
              const allSubsComplete = updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
              
              return { 
                ...t, 
                subtasks: updatedSubs,
                completed: allSubsComplete ? true : t.completed
              };
            }
            return t;
          }),
        };
      }
      return o;
    });
    setOrganizations(updatedOrgs);
  };

  const handleEditSubtaskTitle = (taskId: string, subtaskId: string, newTitle: string) => {
    if (!activeOrg) return;
    const updatedOrgs = organizations.map((o) => {
      if (o.id === activeOrg.id) {
        return {
          ...o,
          tasks: o.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks: t.subtasks.map((sub) => {
                  if (sub.id === subtaskId) {
                    return { ...sub, title: newTitle };
                  }
                  return sub;
                }),
              };
            }
            return t;
          }),
        };
      }
      return o;
    });
    setOrganizations(updatedOrgs);
  };

  const handleDeleteSubtask = (taskId: string, subtaskId: string) => {
    if (!activeOrg) return;
    const updatedOrgs = organizations.map((o) => {
      if (o.id === activeOrg.id) {
        return {
          ...o,
          tasks: o.tasks.map((t) => {
            if (t.id === taskId) {
              return {
                ...t,
                subtasks: t.subtasks.filter((sub) => sub.id !== subtaskId),
              };
            }
            return t;
          }),
        };
      }
      return o;
    });
    setOrganizations(updatedOrgs);
  };

  const toggleCollapseDate = (dateStr: string) => {
    setCollapsedDates((prev) => ({
      ...prev,
      [dateStr]: !prev[dateStr],
    }));
  };

  // Simple spinner when local storage is loading
  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 font-sans">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full mb-4"
        />
        <h4 className="font-display font-medium text-slate-600">Synchronizing Local Drive...</h4>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      <CustomCursor />

      {/* 1. DESKTOP LEFT SIDEBAR PANEL */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar
          organizations={organizations}
          activeOrgId={activeOrgId}
          onSelectOrg={(id) => {
            setActiveOrgId(id);
            setSearchQuery(""); // Clear search to make organization switching ultra fresh!
          }}
          onCreateOrg={() => setOrgDialog({ isOpen: true, isEdit: false })}
          onRenameOrg={(id, currentName) => {
            setOrgDialog({ isOpen: true, isEdit: true, initialName: currentName, targetId: id });
          }}
          onDeleteOrg={handleDeleteOrganization}
        />
      </div>

      {/* MOBILE SIDEBAR SLIDING PANEL */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="fixed inset-y-0 left-0 w-72 h-full z-50 md:hidden shadow-2xl flex"
            >
              <Sidebar
                organizations={organizations}
                activeOrgId={activeOrgId}
                onSelectOrg={(id) => {
                  setActiveOrgId(id);
                  setSearchQuery(""); 
                  setIsMobileSidebarOpen(false); // Auto-close drawer on selection!
                }}
                onCreateOrg={() => {
                  setOrgDialog({ isOpen: true, isEdit: false });
                  setIsMobileSidebarOpen(false);
                }}
                onRenameOrg={(id, currentName) => {
                  setOrgDialog({ isOpen: true, isEdit: true, initialName: currentName, targetId: id });
                  setIsMobileSidebarOpen(false);
                }}
                onDeleteOrg={(id) => {
                  handleDeleteOrganization(id);
                  setIsMobileSidebarOpen(false);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. DYNAMIC MAIN CONTENT DASHBOARD */}
      <div className="flex-1 flex flex-col h-full bg-slate-50/40 overflow-hidden font-sans">
        {activeOrg ? (
          <>
            {/* Top Workspace Dashboard Banner */}
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between z-10">
              {/* Org Header title details */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Hamburger Menu Toggle Button */}
                <button
                  id="mobile-hamburger-menu-btn"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
                  title="Toggle Workspaces"
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

              {/* Filtering + Addition controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search query field */}
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
                    <button
                      id="clear-search-btn"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Create Schedule Button */}
                <button
                  id="header-add-date-btn"
                  onClick={() => setDateDialog({ isOpen: true })}
                  className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Add Date
                </button>

                {/* Add Task Button */}
                <button
                  id="header-create-task-btn"
                  onClick={() => setTaskDialog({ isOpen: true, isEdit: false })}
                  className="cursor-pointer h-10 px-5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-slate-200 transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Plan Task
                </button>
              </div>
            </div>

            {/* Timelines content areas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10 relative z-10 bg-slate-50/20">
              
              {/* Clean search information */}
              {searchQuery && (
                <div className="flex items-center gap-2 mb-2 p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                  <Filter className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    Filtering by query: <strong className="text-slate-900">"{searchQuery}"</strong> ({filteredTasks.length} matches across database)
                  </span>
                  <button
                    id="search-filter-clear"
                    onClick={() => setSearchQuery("")}
                    className="ml-auto text-indigo-600 hover:text-indigo-500 font-semibold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}

              {/* Main Timeline Render */}
              {sortedDates.length === 0 ? (
                /* Empty Workspace Content Indicator */
                <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-450 mb-4 shadow-sm">
                    <Inbox className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-display font-black text-lg text-slate-900 tracking-tight">
                    {searchQuery ? "No matching schedules found" : "Workspace is wide open"}
                  </h3>
                  <p className="max-w-xs text-xs text-slate-400 font-sans mt-2.5 leading-relaxed">
                    {searchQuery 
                      ? "Refine your terms or clear filters to recover missing tasks."
                      : "Pioneer this space by adding calendar schedules or drafting action boards."}
                  </p>
                  
                  {!searchQuery && (
                    <div className="flex gap-2.5 mt-6">
                      <button
                        id="empty-dashboard-add-date"
                        onClick={() => setDateDialog({ isOpen: true })}
                        className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-750 font-semibold rounded-xl text-xs transition-colors"
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
                /* Interactive Date Sections List */
                sortedDates.map((dateStr, index) => {
                  const tasksInDate = groupedTasksMap[dateStr] || [];
                  const isCollapsed = !!collapsedDates[dateStr];
                  
                  // Progress metrics per date
                  const totalCount = tasksInDate.length;
                  const completeCount = tasksInDate.filter(t => t.completed).length;
                  const dateProgressPercent = totalCount > 0 ? (completeCount / totalCount) * 105 : 0;

                  return (
                    <motion.div
                      key={dateStr}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      className="space-y-4"
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-3">
                          {/* Collapse switch icon */}
                          <button
                            id={`collapse-date-btn-${dateStr}`}
                            onClick={() => toggleCollapseDate(dateStr)}
                            className="cursor-pointer p-1 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>

                          {/* Date String */}
                          <h3 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                            {formatDateLabel(dateStr)}
                          </h3>

                          {/* Task count & stats per date block */}
                          <span className="text-[10px] bg-slate-200 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-transparent font-mono">
                            {completeCount} / {totalCount} Complete
                          </span>

                          {/* Inline glowing progress dot */}
                          {totalCount > 0 && (
                            <div className="w-16 hidden sm:block bg-slate-200 rounded-full h-1 overflow-hidden">
                              <div 
                                className="bg-slate-900 h-full transition-all duration-300"
                                style={{ width: `${dateProgressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Date Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Add task to this specific date */}
                          <button
                            id={`add-task-to-date-${dateStr}`}
                            onClick={() => handleAddDateGroup(dateStr)}
                            title="Add task in this timeline"
                            className="cursor-pointer p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 hover:border-slate-300 transition-all flex items-center justify-center"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete everything under this date group */}
                          <button
                            id={`delete-date-group-${dateStr}`}
                            onClick={() => handleDeleteDateGroup(dateStr)}
                            title="Delete Schedule Segment"
                            className="cursor-pointer p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-red-600 hover:border-slate-300 transition-all flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Display grid of tasks */}
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xlg:grid-cols-3 gap-4 pl-0 py-1">
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
          /* Empty workspace splash overall fallback */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/55 relative">
            {/* Mobile Hamburger Menu Toggle Button on empty state */}
            <button
              id="mobile-hamburger-empty-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="absolute top-6 left-6 cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 focus:outline-none transition-colors"
              title="Toggle Workspaces"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Sparkles className="h-12 w-12 text-slate-800 mb-4 animate-pulse animate-bounce" />
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight uppercase">
              Start taskManage
            </h2>
            <p className="max-w-md text-xs text-slate-500 font-sans mt-3 leading-relaxed">
              Create separate organizations to categorize your tasks, plan deadlines, and track incremental subtasks down to the last action loop.
            </p>
            <button
              id="global-create-workspace-btn"
              onClick={() => setOrgDialog({ isOpen: true, isEdit: false })}
              className="cursor-pointer mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              + Create Workspace
            </button>
          </div>
        )}
      </div>

      {/* 3. FLOATING FORM POPUP MODALS */}
      
      {/* A. Organization modal */}
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

      {/* B. Date picker dialog */}
      <DateDialog
        isOpen={dateDialog.isOpen}
        onClose={() => setDateDialog({ isOpen: false })}
        onSubmit={handleAddDateGroup}
      />

      {/* C. Complete edit/create task manager */}
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

      {/* D. Warning confirm backdrop */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
}
