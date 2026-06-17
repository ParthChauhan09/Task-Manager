import api from "./axios";
import { Task, Subtask, Priority } from "../types";

export const tasksApi = {
  // ── Tasks ────────────────────────────────────────────────────────────────

  getAll: async (orgId: string): Promise<Task[]> => {
    const res = await api.get<Task[]>(`/organizations/${orgId}/tasks`);
    return res.data.map(normalizeTask);
  },

  create: async (
    orgId: string,
    fields: { title: string; description?: string; date: string; priority: Priority }
  ): Promise<Task> => {
    const res = await api.post<Task>(`/organizations/${orgId}/tasks`, fields);
    return normalizeTask(res.data);
  },

  update: async (
    orgId: string,
    taskId: string,
    fields: Partial<{ title: string; description: string; date: string; priority: Priority; completed: boolean }>
  ): Promise<Task> => {
    const res = await api.patch<Task>(`/organizations/${orgId}/tasks/${taskId}`, fields);
    return normalizeTask(res.data);
  },

  remove: async (orgId: string, taskId: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}/tasks/${taskId}`);
  },

  // ── Subtasks ─────────────────────────────────────────────────────────────

  createSubtask: async (orgId: string, taskId: string, title: string): Promise<Subtask> => {
    const res = await api.post<Subtask>(
      `/organizations/${orgId}/tasks/${taskId}/subtasks`,
      { title }
    );
    return normalizeSub(res.data);
  },

  updateSubtask: async (
    orgId: string,
    taskId: string,
    subtaskId: string,
    fields: Partial<{ title: string; completed: boolean }>
  ): Promise<Subtask> => {
    const res = await api.patch<Subtask>(
      `/organizations/${orgId}/tasks/${taskId}/subtasks/${subtaskId}`,
      fields
    );
    return normalizeSub(res.data);
  },

  removeSubtask: async (orgId: string, taskId: string, subtaskId: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}/tasks/${taskId}/subtasks/${subtaskId}`);
  },
};

function normalizeTask(task: any): Task {
  return {
    id: task._id ?? task.id,
    title: task.title,
    description: task.description,
    date: task.date,
    priority: task.priority,
    completed: task.completed,
    createdAt: task.createdAt,
    subtasks: (task.subtasks ?? []).map(normalizeSub),
  };
}

function normalizeSub(s: any): Subtask {
  return {
    id: s._id ?? s.id,
    title: s.title,
    completed: s.completed,
  };
}
