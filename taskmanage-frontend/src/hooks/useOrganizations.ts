import { useState, useEffect } from "react";
import { Organization, Priority } from "../types";
import { orgsApi } from "../api/orgsApi";
import { tasksApi } from "../api/tasksApi";

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load all orgs (with their tasks) on mount
  useEffect(() => {
    orgsApi.getAll()
      .then((orgs) => {
        setOrganizations(orgs);
        setIsHydrated(true);
      })
      .catch(() => setIsHydrated(true));
  }, []);

  // ── Organizations ───────────────────────────────────────────────────────

  const createOrg = async (name: string) => {
    const org = await orgsApi.create(name);
    setOrganizations((prev) => [...prev, org]);
    return org;
  };

  const renameOrg = async (orgId: string, name: string) => {
    const updated = await orgsApi.rename(orgId, name);
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, name: updated.name } : o))
    );
  };

  const deleteOrg = async (orgId: string) => {
    await orgsApi.remove(orgId);
    setOrganizations((prev) => prev.filter((o) => o.id !== orgId));
  };

  // ── Tasks ───────────────────────────────────────────────────────────────

  const createTask = async (
    orgId: string,
    fields: { title: string; description?: string; date: string; priority: Priority }
  ) => {
    const task = await tasksApi.create(orgId, fields);
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, tasks: [...o.tasks, task] } : o))
    );
    return task;
  };

  const updateTask = async (
    orgId: string,
    taskId: string,
    fields: Partial<{ title: string; description: string; date: string; priority: Priority; completed: boolean }>
  ) => {
    const updated = await tasksApi.update(orgId, taskId, fields);
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, tasks: o.tasks.map((t) => (t.id === taskId ? updated : t)) }
          : o
      )
    );
    return updated;
  };

  const deleteTask = async (orgId: string, taskId: string) => {
    await tasksApi.remove(orgId, taskId);
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId ? { ...o, tasks: o.tasks.filter((t) => t.id !== taskId) } : o
      )
    );
  };

  const toggleTaskComplete = async (orgId: string, taskId: string, currentCompleted: boolean) => {
    const completed = !currentCompleted;
    const updated = await tasksApi.update(orgId, taskId, { completed });
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? { ...o, tasks: o.tasks.map((t) => (t.id === taskId ? updated : t)) }
          : o
      )
    );
  };

  // ── Subtasks ────────────────────────────────────────────────────────────

  const createSubtask = async (orgId: string, taskId: string, title: string) => {
    const sub = await tasksApi.createSubtask(orgId, taskId, title);
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
            ...o,
            tasks: o.tasks.map((t) =>
              t.id === taskId
                ? { ...t, subtasks: [...t.subtasks, sub], completed: false }
                : t
            ),
          }
          : o
      )
    );
  };

  const updateSubtask = async (
    orgId: string,
    taskId: string,
    subtaskId: string,
    fields: Partial<{ title: string; completed: boolean }>
  ) => {
    const updated = await tasksApi.updateSubtask(orgId, taskId, subtaskId, fields);
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
            ...o,
            tasks: o.tasks.map((t) => {
              if (t.id !== taskId) return t;
              const updatedSubs = t.subtasks.map((s) =>
                s.id === subtaskId ? updated : s
              );
              const allDone =
                updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
              return { ...t, subtasks: updatedSubs, completed: allDone ? true : t.completed };
            }),
          }
          : o
      )
    );
  };

  const deleteSubtask = async (orgId: string, taskId: string, subtaskId: string) => {
    await tasksApi.removeSubtask(orgId, taskId, subtaskId);
    setOrganizations((prev) =>
      prev.map((o) =>
        o.id === orgId
          ? {
            ...o,
            tasks: o.tasks.map((t) =>
              t.id === taskId
                ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
                : t
            ),
          }
          : o
      )
    );
  };

  return {
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
  };
}
