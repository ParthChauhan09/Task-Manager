/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  Plus,
  CornerDownRight,
  Check,
  X,
  Edit3,
} from "lucide-react";
import { Task, Subtask, Priority } from "../types";
import { TiltingCard } from "./TiltingCard";
import { motion, AnimatePresence } from "motion/react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;

  // Subtasks actions
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onEditSubtask,
  onDeleteSubtask,
}: TaskCardProps) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const addInputRef = useRef<HTMLInputElement>(null);

  // Subtask progress stats
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const progressPercent =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleCreateSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
      setIsAddingSubtask(false);
    }
  };

  const startEditSubtask = (sub: Subtask) => {
    setEditingSubtaskId(sub.id);
    setEditingSubtaskTitle(sub.title);
  };

  const handleSaveSubtaskEdit = (subId: string) => {
    if (editingSubtaskTitle.trim()) {
      onEditSubtask(task.id, subId, editingSubtaskTitle.trim());
      setEditingSubtaskId(null);
    }
  };

  const priorityColors = {
    low: {
      bg: "bg-slate-100 border-slate-200 text-slate-600",
      glow: "hover:border-slate-300",
    },
    medium: {
      bg: "bg-blue-50 border-blue-100 text-blue-600",
      glow: "hover:border-slate-300",
    },
    high: {
      bg: "bg-red-50 border-red-100 text-red-600",
      glow: "hover:border-slate-300",
    },
  };

  return (
    <TiltingCard
      maxTilt={6}
      className={`relative flex flex-col p-5 select-none transition-all duration-300 ${task.completed
          ? "border-slate-200/60 bg-slate-50/50 opacity-70 shadow-none grayscale"
          : `${priorityColors[task.priority].glow} border-slate-100 bg-white`
        }`}
    >
      {/* Top Card Bar - Completion, Title & Actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 w-full">
          {/* Main Task Checkbox with Micro interactions */}
          <button
            id={`task-check-${task.id}`}
            onClick={() => onToggleComplete(task.id)}
            className="cursor-pointer mt-1 rounded shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none transition-transform active:scale-90 duration-200"
          >
            {task.completed ? (
              <CheckSquare className="h-5 w-5 text-emerald-500 shrink-0 select-none animate-checkbox-pop" />
            ) : (
              <Square className="h-5 w-5 hover:border-slate-400 hover:text-slate-600 shrink-0" />
            )}
          </button>

          {/* Title & Desc */}
          <div className="text-left flex-1 min-w-0">
            <h4
              id={`task-title-text-${task.id}`}
              className={`text-sm font-semibold tracking-tight transition-all leading-snug break-words ${task.completed
                  ? "line-through text-slate-400"
                  : "text-slate-900"
                }`}
            >
              {task.title}
            </h4>
            {task.description && (
              <p
                className={`mt-1.5 text-xs font-sans leading-relaxed break-words line-clamp-3 ${task.completed ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Edit and Delete Actions on top-right */}
        <div className="flex items-center gap-1 shrink-0 opacity-40 hover:opacity-100 transition-opacity">
          <button
            id={`edit-task-btn-${task.id}`}
            onClick={() => onEditTask(task)}
            title="Edit Task"
            className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            id={`delete-task-btn-${task.id}`}
            onClick={() => onDeleteTask(task.id)}
            title="Delete Task"
            className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Badges Bar - Priority & Creation details */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2">
          {/* Priority flag */}
          <span
            className={`text-[9px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${priorityColors[task.priority].bg
              }`}
          >
            {task.priority}
          </span>

          {/* Subtask count banner */}
          {totalSubtasks > 0 && (
            <span className="text-[10px] font-mono text-slate-400">
              {completedSubtasks} / {totalSubtasks} complete
            </span>
          )}
        </div>

        {/* Date / Created info */}
        <span className="text-[10px] font-mono text-slate-400">
          Created{" "}
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Subtasks Progress Slider */}
      {totalSubtasks > 0 && (
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${task.completed
                ? "from-slate-400 to-slate-300"
                : "from-indigo-600 to-blue-500"
              }`}
          />
        </div>
      )}

      {/* Subtasks Section Container */}
      <div className="mt-4 space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
            Action Items ({totalSubtasks})
          </span>
          {!isAddingSubtask && (
            <button
              id={`add-step-trigger-${task.id}`}
              onClick={() => {
                setIsAddingSubtask(true);
                setTimeout(() => addInputRef.current?.focus(), 50);
              }}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-0.5 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              Add item
            </button>
          )}
        </div>

        {/* Subtask Line entries */}
        {totalSubtasks === 0 && !isAddingSubtask && (
          <p className="text-[10px] text-slate-300 font-sans italic py-1">
            No action items documented.
          </p>
        )}

        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {task.subtasks.map((sub) => {
              const isEditing = editingSubtaskId === sub.id;

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group/sub flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                      id={`subtask-check-${task.id}-${sub.id}`}
                      onClick={() => onToggleSubtask(task.id, sub.id)}
                      className="cursor-pointer text-slate-300 hover:text-slate-500 shrink-0"
                    >
                      {sub.completed ? (
                        <CheckSquare className="h-3.5 w-3.5 text-indigo-600 shrink-0 animate-checkbox-pop" />
                      ) : (
                        <Square className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>

                    {isEditing ? (
                      <input
                        id={`subtask-edit-input-${sub.id}`}
                        type="text"
                        value={editingSubtaskTitle}
                        onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveSubtaskEdit(sub.id);
                          if (e.key === "Escape") setEditingSubtaskId(null);
                        }}
                        className="w-full bg-white text-xs border border-slate-200 text-slate-800 px-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
                        autoFocus
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startEditSubtask(sub)}
                        className={`text-xs truncate transition-all cursor-text font-sans ${sub.completed
                            ? "line-through text-slate-400"
                            : "text-slate-600"
                          }`}
                      >
                        {sub.title}
                      </span>
                    )}
                  </div>

                  {/* Edit/Delete icons for subtask */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                    {isEditing ? (
                      <button
                        id={`subtask-save-btn-${sub.id}`}
                        onClick={() => handleSaveSubtaskEdit(sub.id)}
                        className="cursor-pointer p-0.5 rounded text-emerald-500 hover:bg-slate-100"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    ) : (
                      <>
                        <button
                          id={`subtask-edit-trigger-${sub.id}`}
                          onClick={() => startEditSubtask(sub)}
                          className="cursor-pointer p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-150"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          id={`subtask-delete-btn-${sub.id}`}
                          onClick={() => onDeleteSubtask(task.id, sub.id)}
                          className="cursor-pointer p-0.5 rounded text-slate-400 hover:text-red-600 hover:bg-slate-150/80"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Quick inline subtask insert field */}
          {isAddingSubtask && (
            <form
              onSubmit={handleCreateSubtask}
              className="flex gap-2 items-center mt-2 p-1"
            >
              <CornerDownRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                id="quick-subtask-title-input"
                ref={addInputRef}
                type="text"
                placeholder="Draft step title..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onBlur={() => {
                  // Small delay to allow clicking submit button if ever needed
                  setTimeout(() => {
                    if (!newSubtaskTitle.trim()) {
                      setIsAddingSubtask(false);
                    }
                  }, 200);
                }}
                className="flex-1 bg-white text-xs border border-slate-200 text-slate-800 px-2 py-1 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button
                id="quick-subtask-submit-btn"
                type="submit"
                className="cursor-pointer shrink-0 p-1 text-xs text-indigo-600 hover:text-indigo-500 hover:bg-slate-50 border border-slate-200 rounded"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </TiltingCard>
  );
}
