/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import {
  CheckSquare,
  Square,
  Trash2,
  Edit2,
  Plus,
  CornerDownRight,
  Check,
  Edit3,
  CalendarDays,
} from "lucide-react";
import { Task, Subtask } from "../types";
import { TiltingCard } from "./TiltingCard";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onMoveTaskDate: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEditTask,
  onMoveTaskDate,
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; placement: "above" | "below" } | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const modifiedAncestorsRef = useRef<HTMLElement[]>([]);

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  useEffect(() => {
    if (!contextMenu) {
      modifiedAncestorsRef.current.forEach((el) => {
        el.classList.remove("temp-no-stacking");
      });
      modifiedAncestorsRef.current = [];
      return;
    }

    const close = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      modifiedAncestorsRef.current.forEach((el) => {
        el.classList.remove("temp-no-stacking");
      });
      modifiedAncestorsRef.current = [];
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [contextMenu]);

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

  const openAddSubtask = () => {
    setIsAddingSubtask(true);
    setTimeout(() => addInputRef.current?.focus(), 50);
  };

  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const cardEl = e.currentTarget as HTMLElement;

    // Clear stacking context on all parent/ancestor elements so card renders above backdrop
    const ancestors: HTMLElement[] = [];
    let parent = cardEl.parentElement;
    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);
      if (
        style.transform !== "none" ||
        style.opacity !== "1" ||
        style.filter !== "none" ||
        style.perspective !== "none"
      ) {
        parent.classList.add("temp-no-stacking");
        ancestors.push(parent);
      }
      parent = parent.parentElement;
    }
    modifiedAncestorsRef.current = ancestors;

    // Calculate menu position relative to the task card's bottom-right corner
    const rect = cardEl.getBoundingClientRect();
    const menuWidth = 208; // width matching w-52 (13rem)
    const estimatedMenuHeight = 170; // Better estimation of menu height for flip detection

    // Align right edge of menu with right edge of card
    let x = rect.right - menuWidth;

    // Determine vertical placement: below by default, flip to above if it overflows the screen bottom
    let placement: "above" | "below" = "below";
    let y = rect.bottom + 8;

    if (rect.bottom + 8 + estimatedMenuHeight > window.innerHeight - 16) {
      placement = "above";
      y = rect.top - 8;
    }

    // Viewport boundary checks
    if (x < 16) {
      x = 16;
    } else if (x + menuWidth > window.innerWidth - 16) {
      x = window.innerWidth - menuWidth - 16;
    }

    if (y < 16) {
      y = 16;
    }

    setContextMenu({ x, y, placement });
  };

  const closeContextMenu = () => setContextMenu(null);

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

  const menuX = contextMenu ? contextMenu.x : 0;
  const menuY = contextMenu ? contextMenu.y : 0;

  return (
    <>
      <TiltingCard
        maxTilt={6}
        onContextMenu={openContextMenu}
        className={`relative flex flex-col p-5 select-none transition-all duration-300 ${task.completed
          ? "border-slate-200/60 bg-slate-50/50 opacity-70 shadow-none grayscale"
          : `${priorityColors[task.priority].glow} border-slate-100 bg-white`
          } ${
            contextMenu
              ? "z-[51] ring-2 ring-indigo-500/50 shadow-2xl scale-[1.02] bg-white border-transparent !opacity-100 !grayscale-0"
              : ""
          }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 w-full group/title">
            <button
              id={`task-check-${task.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="cursor-pointer mt-1 rounded shrink-0 text-slate-400 hover:text-slate-600 focus:outline-none transition-transform active:scale-90 duration-200"
            >
              {task.completed ? (
                <CheckSquare className="h-5 w-5 text-emerald-500 shrink-0 select-none animate-checkbox-pop" />
              ) : (
                <Square className="h-5 w-5 hover:border-slate-400 hover:text-slate-600 shrink-0" />
              )}
            </button>

            <div className="text-left flex-1 min-w-0">
              <h4
                id={`task-title-text-${task.id}`}
                className={`text-sm font-semibold tracking-tight transition-all leading-snug break-words group-hover/title:text-indigo-600 ${task.completed
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

          <div className="flex items-center gap-1 shrink-0 opacity-40 hover:opacity-100 transition-opacity">
            <button
              id={`edit-task-btn-${task.id}`}
              type="button"
              onClick={() => onEditTask(task)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="Edit Task"
              className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              id={`delete-task-btn-${task.id}`}
              type="button"
              onClick={() => onDeleteTask(task.id)}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="Delete Task"
              className="cursor-pointer p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-bold font-mono tracking-widest uppercase px-2 py-0.5 rounded border ${priorityColors[task.priority].bg
                }`}
            >
              {task.priority}
            </span>
            {totalSubtasks > 0 && (
              <span className="text-[10px] font-mono text-slate-400">
                {completedSubtasks} / {totalSubtasks} complete
              </span>
            )}
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            Created{" "}
            {new Date(task.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

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

        <div className="mt-4 space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
              Action Items ({totalSubtasks})
            </span>
            {!isAddingSubtask && (
              <button
                id={`add-step-trigger-${task.id}`}
                onClick={openAddSubtask}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add item
              </button>
            )}
          </div>

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
                        type="button"
                        onClick={() => onToggleSubtask(task.id, sub.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
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
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
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

                    <div className="flex items-center gap-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                      {isEditing ? (
                        <button
                          id={`subtask-save-btn-${sub.id}`}
                          type="button"
                          onClick={() => handleSaveSubtaskEdit(sub.id)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="cursor-pointer p-0.5 rounded text-emerald-500 hover:bg-slate-100"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      ) : (
                        <>
                          <button
                            id={`subtask-edit-trigger-${sub.id}`}
                            type="button"
                            onClick={() => startEditSubtask(sub)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="cursor-pointer p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-150"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            id={`subtask-delete-btn-${sub.id}`}
                            type="button"
                            onClick={() => onDeleteSubtask(task.id, sub.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
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
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onBlur={() => {
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
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="cursor-pointer shrink-0 p-1 text-xs text-indigo-600 hover:text-indigo-500 hover:bg-slate-50 border border-slate-200 rounded"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </TiltingCard>

      {contextMenu &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-50 bg-slate-900/15 backdrop-blur-[3px] transition-all duration-300"
              onClick={closeContextMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeContextMenu();
              }}
            />
            <div
              className="fixed z-[70] w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15"
              style={{
                left: menuX,
                top: menuY,
                transform: contextMenu?.placement === "above" ? "translateY(-100%)" : "none",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  onEditTask(task);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="h-4 w-4 text-slate-500" />
                Edit task
              </button>
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  openAddSubtask();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Plus className="h-4 w-4 text-slate-500" />
                Add subtask
              </button>
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  onMoveTaskDate(task);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <CalendarDays className="h-4 w-4 text-slate-500" />
                Move to
              </button>
              <div className="h-px bg-slate-100" />
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  onDeleteTask(task.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
