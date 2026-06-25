import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Organization, Priority, Task, Subtask } from "../types";
import { orgsApi } from "../api/orgsApi";
import { tasksApi } from "../api/tasksApi";

export function useOrganizations() {
  const queryClient = useQueryClient();

  // Load all orgs (with their tasks) using TanStack Query
  const { data: organizations = [], isLoading } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: orgsApi.getAll,
  });

  const isHydrated = !isLoading;

  // ── Organizations Mutations ───────────────────────────────────────────────

  const createOrgMutation = useMutation({
    mutationFn: orgsApi.create,
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);
      
      const newOrg: Organization = {
        id: "temp-org-" + Date.now(),
        name,
        tasks: [],
      };

      queryClient.setQueryData<Organization[]>(["organizations"], (old) => [
        ...(old || []),
        newOrg,
      ]);

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const renameOrgMutation = useMutation({
    mutationFn: ({ orgId, name }: { orgId: string; name: string }) =>
      orgsApi.rename(orgId, name),
    onMutate: async ({ orgId, name }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) => (o.id === orgId ? { ...o, name } : o))
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteOrgMutation = useMutation({
    mutationFn: orgsApi.remove,
    onMutate: async (orgId) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).filter((o) => o.id !== orgId)
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  // ── Tasks Mutations ────────────────────────────────────────────────────────

  const createTaskMutation = useMutation({
    mutationFn: ({
      orgId,
      fields,
    }: {
      orgId: string;
      fields: { title: string; description?: string; date: string; priority: Priority };
    }) => tasksApi.create(orgId, fields),
    onMutate: async ({ orgId, fields }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      const tempTask: Task = {
        id: "temp-task-" + Date.now(),
        title: fields.title,
        description: fields.description,
        date: fields.date,
        priority: fields.priority,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: [],
      };

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
          o.id === orgId ? { ...o, tasks: [...o.tasks, tempTask] } : o
        )
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      orgId,
      taskId,
      fields,
    }: {
      orgId: string;
      taskId: string;
      fields: Partial<{ title: string; description: string; date: string; priority: Priority; completed: boolean }>;
    }) => tasksApi.update(orgId, taskId, fields),
    onMutate: async ({ orgId, taskId, fields }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
          o.id === orgId
            ? {
                ...o,
                tasks: o.tasks.map((t) => (t.id === taskId ? { ...t, ...fields } : t)),
              }
            : o
        )
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: ({ orgId, taskId }: { orgId: string; taskId: string }) =>
      tasksApi.remove(orgId, taskId),
    onMutate: async ({ orgId, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
          o.id === orgId ? { ...o, tasks: o.tasks.filter((t) => t.id !== taskId) } : o
        )
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const toggleTaskCompleteMutation = useMutation({
    mutationFn: ({
      orgId,
      taskId,
      currentCompleted,
    }: {
      orgId: string;
      taskId: string;
      currentCompleted: boolean;
    }) => tasksApi.update(orgId, taskId, { completed: !currentCompleted }),
    onMutate: async ({ orgId, taskId, currentCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
          o.id === orgId
            ? {
                ...o,
                tasks: o.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !currentCompleted } : t
                ),
              }
            : o
        )
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  // ── Subtasks Mutations ─────────────────────────────────────────────────────

  const createSubtaskMutation = useMutation({
    mutationFn: ({ orgId, taskId, title }: { orgId: string; taskId: string; title: string }) =>
      tasksApi.createSubtask(orgId, taskId, title),
    onMutate: async ({ orgId, taskId, title }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      const tempSub: Subtask = {
        id: "temp-subtask-" + Date.now(),
        title,
        completed: false,
      };

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
          o.id === orgId
            ? {
                ...o,
                tasks: o.tasks.map((t) =>
                  t.id === taskId
                    ? { ...t, subtasks: [...t.subtasks, tempSub], completed: false }
                    : t
                ),
              }
            : o
        )
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const updateSubtaskMutation = useMutation({
    mutationFn: ({
      orgId,
      taskId,
      subtaskId,
      fields,
    }: {
      orgId: string;
      taskId: string;
      subtaskId: string;
      fields: Partial<{ title: string; completed: boolean }>;
    }) => tasksApi.updateSubtask(orgId, taskId, subtaskId, fields),
    onMutate: async ({ orgId, taskId, subtaskId, fields }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
          o.id === orgId
            ? {
                ...o,
                tasks: o.tasks.map((t) => {
                  if (t.id !== taskId) return t;
                  const updatedSubs = t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, ...fields } : s
                  );
                  const allDone =
                    updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
                  return {
                    ...t,
                    subtasks: updatedSubs,
                    completed: allDone ? true : t.completed,
                  };
                }),
              }
            : o
        )
      );

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: ({
      orgId,
      taskId,
      subtaskId,
    }: {
      orgId: string;
      taskId: string;
      subtaskId: string;
    }) => tasksApi.removeSubtask(orgId, taskId, subtaskId),
    onMutate: async ({ orgId, taskId, subtaskId }) => {
      await queryClient.cancelQueries({ queryKey: ["organizations"] });
      const previousOrgs = queryClient.getQueryData<Organization[]>(["organizations"]);

      queryClient.setQueryData<Organization[]>(["organizations"], (old) =>
        (old || []).map((o) =>
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

      return { previousOrgs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousOrgs) {
        queryClient.setQueryData(["organizations"], context.previousOrgs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  // ── Callbacks for Backwards Compatibility ────────────────────────────────

  const createOrg = async (name: string) => {
    return createOrgMutation.mutateAsync(name);
  };

  const renameOrg = async (orgId: string, name: string) => {
    return renameOrgMutation.mutateAsync({ orgId, name });
  };

  const deleteOrg = async (orgId: string) => {
    return deleteOrgMutation.mutateAsync(orgId);
  };

  const createTask = async (
    orgId: string,
    fields: { title: string; description?: string; date: string; priority: Priority }
  ) => {
    return createTaskMutation.mutateAsync({ orgId, fields });
  };

  const updateTask = async (
    orgId: string,
    taskId: string,
    fields: Partial<{ title: string; description: string; date: string; priority: Priority; completed: boolean }>
  ) => {
    return updateTaskMutation.mutateAsync({ orgId, taskId, fields });
  };

  const deleteTask = async (orgId: string, taskId: string) => {
    return deleteTaskMutation.mutateAsync({ orgId, taskId });
  };

  const toggleTaskComplete = async (orgId: string, taskId: string, currentCompleted: boolean) => {
    return toggleTaskCompleteMutation.mutateAsync({ orgId, taskId, currentCompleted });
  };

  const createSubtask = async (orgId: string, taskId: string, title: string) => {
    return createSubtaskMutation.mutateAsync({ orgId, taskId, title });
  };

  const updateSubtask = async (
    orgId: string,
    taskId: string,
    subtaskId: string,
    fields: Partial<{ title: string; completed: boolean }>
  ) => {
    return updateSubtaskMutation.mutateAsync({ orgId, taskId, subtaskId, fields });
  };

  const deleteSubtask = async (orgId: string, taskId: string, subtaskId: string) => {
    return deleteSubtaskMutation.mutateAsync({ orgId, taskId, subtaskId });
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
