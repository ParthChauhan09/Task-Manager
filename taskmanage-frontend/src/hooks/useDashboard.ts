import { useState, useMemo } from "react";
import { Priority, Task, Organization } from "../types";
import { useOrganizations } from "./useOrganizations";
import { formatDateLabel } from "../utils/dateHelpers";

export interface OrgDialogState {
  isOpen: boolean;
  isEdit: boolean;
  initialName?: string;
  targetId?: string;
}

export interface TaskDialogState {
  isOpen: boolean;
  isEdit: boolean;
  initialValues?: { title: string; description?: string; date: string; priority: Priority };
  targetTaskId?: string;
  prepopulatedDate?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export function useDashboard() {
  const orgStore = useOrganizations();
  const { organizations, createOrg, renameOrg, deleteOrg, createTask, updateTask, deleteTask, toggleTaskComplete, createSubtask, updateSubtask, deleteSubtask } = orgStore;

  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const [orgDialog, setOrgDialog] = useState<OrgDialogState>({ isOpen: false, isEdit: false });
  const [dateDialog, setDateDialog] = useState<{ isOpen: boolean }>({ isOpen: false });
  const [taskDialog, setTaskDialog] = useState<TaskDialogState>({ isOpen: false, isEdit: false });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false, title: "", message: "", onConfirm: () => { },
  });

  const activeOrg = useMemo((): Organization | null => {
    if (!orgStore.isHydrated || organizations.length === 0) return null;
    const found = organizations.find((o) => o.id === activeOrgId);
    if (found) return found;
    setActiveOrgId(organizations[0].id);
    return organizations[0];
  }, [orgStore.isHydrated, organizations, activeOrgId]);

  // ── Org handlers ────────────────────────────────────────────────────────

  const handleCreateOrg = async (name: string) => {
    const org = await createOrg(name);
    setActiveOrgId(org.id);
  };

  const handleRenameOrg = async (id: string, name: string) => {
    await renameOrg(id, name);
  };

  const handleDeleteOrg = (id: string) => {
    const target = organizations.find((o) => o.id === id);
    if (!target) return;
    setConfirmDialog({
      isOpen: true,
      title: "Archive Workspace",
      message: `Delete workspace "${target.name}"? All tasks will be permanently deleted.`,
      onConfirm: async () => {
        await deleteOrg(id);
        if (activeOrgId === id) {
          const rest = organizations.filter((o) => o.id !== id);
          setActiveOrgId(rest.length > 0 ? rest[0].id : null);
        }
      },
    });
  };

  // ── Date group handlers ──────────────────────────────────────────────────

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

  // ── Task handlers ────────────────────────────────────────────────────────

  const handleAddOrUpdateTask = async (fields: { title: string; description: string; date: string; priority: Priority }) => {
    if (!activeOrg) return;
    if (taskDialog.isEdit && taskDialog.targetTaskId) {
      await updateTask(activeOrg.id, taskDialog.targetTaskId, { ...fields, description: fields.description || undefined });
    } else {
      await createTask(activeOrg.id, { ...fields, description: fields.description || undefined });
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    if (!activeOrg) return;
    const task = activeOrg.tasks.find((t) => t.id === taskId);
    if (task) await toggleTaskComplete(activeOrg.id, taskId, task.completed);
  };

  const handleTriggerEditTask = (task: Task) => {
    setTaskDialog({
      isOpen: true, isEdit: true, targetTaskId: task.id,
      initialValues: { title: task.title, description: task.description, date: task.date, priority: task.priority },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!activeOrg) return;
    const target = activeOrg.tasks.find((t) => t.id === taskId);
    if (!target) return;
    setConfirmDialog({
      isOpen: true, title: "Delete Task",
      message: `Are you sure you want to delete "${target.title}"?`,
      onConfirm: async () => { await deleteTask(activeOrg.id, taskId); },
    });
  };

  // ── Subtask handlers ─────────────────────────────────────────────────────

  const handleAddSubtask = async (taskId: string, title: string) => {
    if (activeOrg) await createSubtask(activeOrg.id, taskId, title);
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!activeOrg) return;
    const sub = activeOrg.tasks.find((t) => t.id === taskId)?.subtasks.find((s) => s.id === subtaskId);
    if (sub) await updateSubtask(activeOrg.id, taskId, subtaskId, { completed: !sub.completed });
  };

  const handleEditSubtask = async (taskId: string, subtaskId: string, title: string) => {
    if (activeOrg) await updateSubtask(activeOrg.id, taskId, subtaskId, { title });
  };

  const handleDeleteSubtask = async (taskId: string, subtaskId: string) => {
    if (activeOrg) await deleteSubtask(activeOrg.id, taskId, subtaskId);
  };

  const toggleCollapseDate = (dateStr: string) => {
    setCollapsedDates((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const collapseAll = (dates: string[]) => {
    const allCollapsed = dates.every((d) => collapsedDates[d]);
    if (allCollapsed) {
      // all already collapsed → expand all
      setCollapsedDates({});
    } else {
      // collapse all
      setCollapsedDates(Object.fromEntries(dates.map((d) => [d, true])));
    }
  };

  return {
    // data
    organizations,
    isHydrated: orgStore.isHydrated,
    activeOrg,
    activeOrgId,
    setActiveOrgId,
    searchQuery,
    setSearchQuery,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    collapsedDates,
    toggleCollapseDate,
    collapseAll,
    // dialogs
    orgDialog, setOrgDialog,
    dateDialog, setDateDialog,
    taskDialog, setTaskDialog,
    confirmDialog, setConfirmDialog,
    // handlers
    handleCreateOrg,
    handleRenameOrg,
    handleDeleteOrg,
    handleAddDateGroup,
    handleDeleteDateGroup,
    handleAddOrUpdateTask,
    handleToggleTaskComplete,
    handleTriggerEditTask,
    handleDeleteTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleEditSubtask,
    handleDeleteSubtask,
  };
}
