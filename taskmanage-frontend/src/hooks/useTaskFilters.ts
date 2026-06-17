import { useMemo } from "react";
import { Organization, Task } from "../types";
import { sortDatesChronologically } from "../utils/dateHelpers";

export function useTaskFilters(activeOrg: Organization | null, searchQuery: string) {
  const filteredTasks = useMemo((): Task[] => {
    if (!activeOrg) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return activeOrg.tasks;
    return activeOrg.tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description?.toLowerCase().includes(query) ?? false) ||
        task.subtasks.some((s) => s.title.toLowerCase().includes(query))
    );
  }, [activeOrg, searchQuery]);

  const groupedTasksMap = useMemo((): Record<string, Task[]> => {
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

  return { filteredTasks, groupedTasksMap, sortedDates };
}
