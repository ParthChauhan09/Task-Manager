import api from "./axios";
import { Organization } from "../types";

export const orgsApi = {
  getAll: async (): Promise<Organization[]> => {
    const res = await api.get<Organization[]>("/organizations");
    // MongoDB returns _id — normalize to id for the frontend
    return res.data.map(normalizeOrg);
  },

  create: async (name: string): Promise<Organization> => {
    const res = await api.post<Organization>("/organizations", { name });
    return normalizeOrg(res.data);
  },

  rename: async (orgId: string, name: string): Promise<Organization> => {
    const res = await api.patch<Organization>(`/organizations/${orgId}`, { name });
    return normalizeOrg(res.data);
  },

  remove: async (orgId: string): Promise<void> => {
    await api.delete(`/organizations/${orgId}`);
  },
};

// Mongo sends _id — map to id so the frontend types stay consistent
function normalizeOrg(org: any): Organization {
  return {
    id: org._id ?? org.id,
    name: org.name,
    tasks: (org.tasks ?? []).map(normalizeTask),
  };
}

function normalizeTask(task: any) {
  return {
    id: task._id ?? task.id,
    title: task.title,
    description: task.description,
    date: task.date,
    priority: task.priority,
    completed: task.completed,
    createdAt: task.createdAt,
    subtasks: (task.subtasks ?? []).map((s: any) => ({
      id: s._id ?? s.id,
      title: s.title,
      completed: s.completed,
    })),
  };
}
