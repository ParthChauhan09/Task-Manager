import api from "./axios";
import { AuthUser } from "./authApi";
import { Organization } from "../types";

export interface AdminOrganization extends Organization {
  owner?: Pick<AuthUser, "id" | "name" | "email" | "role">;
}

export interface AdminOverview {
  users: AuthUser[];
  organizations: AdminOrganization[];
}

export const adminApi = {
  overview: async (): Promise<AdminOverview> => {
    const res = await api.get<AdminOverview>("/admin/overview");
    return normalizeOverview(res.data);
  },

  users: async (): Promise<AuthUser[]> => {
    const res = await api.get<AuthUser[]>("/admin/users");
    return res.data;
  },
};

function normalizeOverview(data: AdminOverview): AdminOverview {
  return {
    users: data.users,
    organizations: data.organizations.map((org) => ({
      ...org,
      id: org.id ?? (org as any)._id,
      owner:
        org.owner && "_id" in (org.owner as any)
          ? {
              id: (org.owner as any)._id,
              name: (org.owner as any).name,
              email: (org.owner as any).email,
              role: (org.owner as any).role,
            }
          : org.owner,
      tasks: (org.tasks ?? []).map((task: any) => ({
        ...task,
        id: task.id ?? task._id,
        subtasks: (task.subtasks ?? []).map((subtask: any) => ({
          ...subtask,
          id: subtask.id ?? subtask._id,
        })),
      })),
    })),
  };
}
