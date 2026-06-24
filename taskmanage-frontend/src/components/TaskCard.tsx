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
import { TaskDetailModal } from "./TaskDetailModal";

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
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
      if (e.key === "Escape") {
        if (
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        ) {
          return;
        }
        close();
      }
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
      bg: "bg-[#8E8E93]/10 border-transparent text-[#8E8E93]",
      glow: "hover:border-[#E5E5EA]",
    },
    medium: {
      bg: "bg-[#5856D6]/10 border-transparent text-[#5856D6]",
      glow: "hover:border-[#5856D6]/20",
    },
    high: {
      bg: "bg-[#FF3B30]/10 border-transparent text-[#FF3B30]",
      glow: "hover:border-[#FF3B30]/20",
    },
  };

  const menuX = contextMenu ? contextMenu.x : 0;
  const menuY = contextMenu ? contextMenu.y : 0;

  return (
    <>
      <TiltingCard
        maxTilt={6}
        onContextMenu={openContextMenu}
        tabIndex={0}
        onKeyDown={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest("input") ||
            target.closest("textarea") ||
            target.closest("button")
          ) {
            return;
          }
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsDetailModalOpen(true);
          }
        }}
        onMouseEnter={(e) => e.currentTarget.focus()}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest("button") ||
            target.closest("input") ||
            target.closest("form") ||
            target.closest("a")
          ) {
            return;
          }
          setIsDetailModalOpen(true);
        }}
        className={`task-nav-item relative flex flex-col p-6 select-none transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5856D6]/40 focus:-translate-y-0.5 rounded-[24px] border ${task.completed
          ? "border-[#E5E5EA]/60 bg-[#F5F5F7]/60 opacity-60 shadow-none"
          : `${priorityColors[task.priority].glow} border-[#E5E5EA]/60 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]`
          } ${
            contextMenu
              ? "z-[51] ring-2 ring-[#5856D6]/30 shadow-2xl scale-[1.01] bg-white border-transparent !opacity-100"
              : ""
          } cursor-pointer`}
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
              className="cursor-pointer mt-0.5 shrink-0 focus:outline-none transition-all duration-200 active:scale-90"
            >
              {task.completed ? (
                <div className="h-5.5 w-5.5 rounded-full bg-[#5856D6] text-white flex items-center justify-center scale-100 transition-all select-none animate-checkbox-pop shadow-sm shadow-[#5856D6]/20">
                  <Check className="h-3.5 w-3.5 stroke-[3px]" />
                </div>
              ) : (
                <div className="h-5.5 w-5.5 rounded-full border-2 border-[#8E8E93]/40 hover:border-[#5856D6] hover:bg-[#5856D6]/5 transition-all" />
              )}
            </button>

            <div className="text-left flex-1 min-w-0">
              <h4
                id={`task-title-text-${task.id}`}
                className={`text-sm font-semibold tracking-tight transition-all leading-snug break-words group-hover/title:text-[#5856D6] ${task.completed
                  ? "line-through text-[#8E8E93]"
                  : "text-[#1C1C1E]"
                  }`}
              >
                {task.title}
              </h4>
              {task.description && (
                <p
                  className={`mt-1.5 text-xs leading-relaxed break-words line-clamp-3 ${task.completed ? "text-[#8E8E93]" : "text-[#8E8E93]"
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
              className="cursor-pointer p-1 rounded hover:bg-[#F5F5F7] text-[#8E8E93] hover:text-[#1C1C1E] transition-colors"
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
              className="cursor-pointer p-1 rounded hover:bg-[#F5F5F7] text-[#8E8E93] hover:text-[#FF3B30] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E5E5EA]/60 pt-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${priorityColors[task.priority].bg
                }`}
            >
              {task.priority}
            </span>
            {totalSubtasks > 0 && (
              <span className="text-[10px] font-medium text-[#8E8E93]">
                {completedSubtasks} / {totalSubtasks} complete
              </span>
            )}
          </div>

          <span className="text-[10px] font-medium text-[#8E8E93]">
            Created{" "}
            {new Date(task.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {totalSubtasks > 0 && (
          <div className="mt-3.5 w-full bg-[#E5E5EA] rounded-full h-1 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`h-full rounded-full ${task.completed
                ? "bg-[#8E8E93]/60"
                : "bg-gradient-to-r from-[#5856D6] to-[#4F46E5]"
                }`}
            />
          </div>
        )}

        <div className="mt-4 space-y-3.5 text-left bg-[#F5F5F7]/80 p-4 rounded-[20px] border border-[#E5E5EA]/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] font-sans">
              Action Items ({totalSubtasks})
            </span>
            {!isAddingSubtask && (
              <button
                id={`add-step-trigger-${task.id}`}
                onClick={openAddSubtask}
                className="text-[11px] font-semibold text-[#5856D6] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add item
              </button>
            )}
          </div>

          {totalSubtasks === 0 && !isAddingSubtask && (
            <p className="text-[10px] text-[#8E8E93] font-sans italic py-1">
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
                    className="group/sub flex items-center justify-between gap-2.5 p-1 rounded-lg hover:bg-white/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        id={`subtask-check-${task.id}-${sub.id}`}
                        type="button"
                        onClick={() => onToggleSubtask(task.id, sub.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="cursor-pointer shrink-0 focus:outline-none transition-all active:scale-90"
                      >
                        {sub.completed ? (
                          <div className="h-4.5 w-4.5 rounded-full bg-[#5856D6] text-white flex items-center justify-center animate-checkbox-pop">
                            <Check className="h-3 w-3 stroke-[3px]" />
                          </div>
                        ) : (
                          <div className="h-4.5 w-4.5 rounded-full border-2 border-[#8E8E93]/40 hover:border-[#5856D6] hover:bg-[#5856D6]/5 transition-all" />
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
                            e.stopPropagation();
                            if (e.key === "Enter") handleSaveSubtaskEdit(sub.id);
                            if (e.key === "Escape") setEditingSubtaskId(null);
                          }}
                          className="w-full bg-white text-xs border border-[#E5E5EA] text-[#1C1C1E] px-2.5 py-1 rounded-full focus:outline-none focus:border-[#5856D6] font-sans"
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => startEditSubtask(sub)}
                          className={`text-xs truncate transition-all cursor-text font-sans ${sub.completed
                            ? "line-through text-[#8E8E93]"
                            : "text-[#1C1C1E]/80"
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
                            className="cursor-pointer p-0.5 rounded text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-slate-150"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            id={`subtask-delete-btn-${sub.id}`}
                            type="button"
                            onClick={() => onDeleteSubtask(task.id, sub.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="cursor-pointer p-0.5 rounded text-[#8E8E93] hover:text-[#FF3B30] hover:bg-slate-150/80"
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
                className="flex gap-2 items-center mt-2.5 p-1"
              >
                <CornerDownRight className="h-3.5 w-3.5 text-[#8E8E93] shrink-0" />
                <input
                  id="quick-subtask-title-input"
                  ref={addInputRef}
                  type="text"
                  placeholder="New subtask title..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Escape") {
                      setNewSubtaskTitle("");
                      setIsAddingSubtask(false);
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!newSubtaskTitle.trim()) {
                        setIsAddingSubtask(false);
                      }
                    }, 200);
                  }}
                  className="flex-1 bg-white text-xs border border-[#E5E5EA] text-[#1C1C1E] px-3 py-1.5 rounded-full focus:outline-none focus:border-[#5856D6] font-sans"
                />
                <button
                  id="quick-subtask-submit-btn"
                  type="submit"
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="cursor-pointer shrink-0 p-1.5 text-xs text-[#5856D6] hover:bg-[#5856D6]/5 border border-[#E5E5EA] rounded-full"
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
              className="fixed inset-0 z-50 bg-[#1C1C1E]/10 backdrop-blur-[2px] transition-all duration-300"
              onClick={closeContextMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeContextMenu();
              }}
            />
            <div
              className="fixed z-[70] w-52 overflow-hidden rounded-2xl border border-[#E5E5EA]/60 bg-white/90 backdrop-blur-xl shadow-2xl shadow-[#1C1C1E]/10 p-1"
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
                className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1C1C1E] hover:bg-[#5856D6] hover:text-white group transition-all duration-150"
              >
                <Edit2 className="h-4 w-4 text-[#8E8E93] group-hover:text-white transition-colors" />
                Edit task
              </button>
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  openAddSubtask();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1C1C1E] hover:bg-[#5856D6] hover:text-white group transition-all duration-150"
              >
                <Plus className="h-4 w-4 text-[#8E8E93] group-hover:text-white transition-colors" />
                Add subtask
              </button>
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  onMoveTaskDate(task);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#1C1C1E] hover:bg-[#5856D6] hover:text-white group transition-all duration-150"
              >
                <CalendarDays className="h-4 w-4 text-[#8E8E93] group-hover:text-white transition-colors" />
                Move to
              </button>
              <div className="h-px bg-[#E5E5EA]/55 my-1" />
              <button
                type="button"
                onClick={() => {
                  closeContextMenu();
                  onDeleteTask(task.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white group transition-all duration-150"
              >
                <Trash2 className="h-4 w-4 text-[#FF3B30] group-hover:text-white transition-colors" />
                Delete
              </button>
            </div>
          </>,
          document.body
        )}

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={task}
        onAddSubtask={onAddSubtask}
        onToggleSubtask={onToggleSubtask}
        onEditSubtask={onEditSubtask}
        onDeleteSubtask={onDeleteSubtask}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        priorityColors={priorityColors}
      />
    </>
  );
}
