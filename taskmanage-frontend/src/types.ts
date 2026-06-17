/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = "low" | "medium" | "high";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  priority: Priority;
  completed: boolean;
  createdAt: string;
  subtasks: Subtask[];
}

export interface Organization {
  id: string;
  name: string;
  tasks: Task[];
}
