/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckSquare,
  Square,
  Plus,
  CornerDownRight,
  Check,
  Edit3,
  Trash2,
  CalendarDays,
  ListTodo
} from "lucide-react";
import { Task, Subtask } from "../types";
import { createPortal } from "react-dom";
import { ShortcutOverlay } from "./ShortcutOverlay";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
  onToggleComplete?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  priorityColors: Record<string, { bg: string; glow: string }>;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onAddSubtask,
  onToggleSubtask,
  onEditSubtask,
  onDeleteSubtask,
  onToggleComplete,
  onDeleteTask,
  priorityColors
}: TaskDetailModalProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement
        ) {
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const detailShortcuts = [
    {
      keyStr: "c",
      label: "Toggle Complete",
      action: () => {
        if (onToggleComplete) {
          onToggleComplete(task.id);
        }
      },
    },
    {
      keyStr: "d",
      label: "Delete Task",
      action: () => {
        if (onDeleteTask) {
          onDeleteTask(task.id);
          onClose();
        }
      },
    },
  ];

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      onAddSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
      inputRef.current?.focus();
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1C1C1E]/20 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            id="task-detail-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#E5E5EA]/60 bg-white/95 backdrop-blur-xl shadow-2xl z-10 flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 hover:bg-[#F5F5F7] text-[#8E8E93] hover:text-[#1C1C1E] transition-all focus:outline-none cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-left">
              {/* Header Section */}
              <div className="space-y-3 pr-8">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${
                      priorityColors[task.priority]?.bg || "bg-[#F5F5F7] text-[#8E8E93]"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#8E8E93]">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      Due {new Date(task.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1C1C1E] leading-tight">
                  {task.title}
                </h2>

                {task.description && (
                  <p className="text-sm text-[#8E8E93] font-sans leading-relaxed whitespace-pre-wrap bg-[#F5F5F7] p-4 rounded-2xl border border-[#E5E5EA]/45">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Subtask Section */}
              <div className="space-y-4 border-t border-[#E5E5EA]/60 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold tracking-tight text-[#1C1C1E] flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-apple-purple" />
                    Action Items
                  </h3>
                  <span className="text-xs font-medium text-[#8E8E93]">
                    {completedSubtasks} / {totalSubtasks} Completed
                  </span>
                </div>

                {/* Progress Bar */}
                {totalSubtasks > 0 && (
                  <div className="w-full bg-[#E5E5EA] rounded-full h-1 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-apple-purple to-apple-indigo rounded-full"
                    />
                  </div>
                )}

                {/* Subtasks List */}
                <div className="space-y-2 max-h-[244px] overflow-y-auto pr-1">
                  {totalSubtasks === 0 ? (
                    <div className="text-center py-8 bg-[#F5F5F7]/50 rounded-2xl border border-dashed border-[#E5E5EA]">
                      <p className="text-sm text-[#8E8E93] italic">No action steps added yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <AnimatePresence initial={false}>
                        {task.subtasks.map((sub) => {
                          const isEditing = editingSubtaskId === sub.id;
                          return (
                            <motion.div
                              key={sub.id}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, height: 0 }}
                              className="group/sub flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-[#F5F5F7] border border-transparent hover:border-[#E5E5EA]/45 transition-all"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onToggleSubtask(task.id, sub.id)}
                                  className="cursor-pointer shrink-0 focus:outline-none transition-all active:scale-90"
                                >
                                  {sub.completed ? (
                                    <div className="h-5 w-5 rounded-full bg-apple-purple text-white flex items-center justify-center animate-checkbox-pop shadow-sm shadow-apple-purple/20">
                                      <Check className="h-3.5 w-3.5 stroke-[3px]" />
                                    </div>
                                  ) : (
                                    <div className="h-5 w-5 rounded-full border-2 border-[#8E8E93]/40 hover:border-apple-purple hover:bg-apple-purple/5 transition-all" />
                                  )}
                                </button>

                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingSubtaskTitle}
                                    onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Escape") {
                                        e.stopPropagation();
                                        setEditingSubtaskId(null);
                                        e.currentTarget.blur();
                                      } else if (e.key === "Enter") {
                                        e.stopPropagation();
                                        handleSaveSubtaskEdit(sub.id);
                                      }
                                    }}
                                    className="w-full bg-white text-sm border border-[#E5E5EA] text-[#1C1C1E] px-4 py-1.5 rounded-full focus:outline-none focus:border-apple-purple font-sans"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={() => startEditSubtask(sub)}
                                    className={`text-sm block break-all cursor-text font-sans font-medium transition-all ${
                                      sub.completed ? "line-through text-[#8E8E93]" : "text-[#1C1C1E]/80"
                                    }`}
                                  >
                                    {sub.title}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity shrink-0">
                                {isEditing ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSaveSubtaskEdit(sub.id)}
                                    className="cursor-pointer p-1 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => startEditSubtask(sub)}
                                      className="cursor-pointer p-1.5 rounded-lg text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteSubtask(task.id, sub.id)}
                                      className="cursor-pointer p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FF3B30] hover:bg-red-50 transition-all"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Add Subtask Input Form */}
                <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2 items-center mt-3 pt-2">
                  <CornerDownRight className="h-4 w-4 text-[#8E8E93] shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Add a new action step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.stopPropagation();
                        setNewSubtaskTitle("");
                        e.currentTarget.blur();
                      }
                    }}
                    className="flex-1 bg-[#F5F5F7] text-sm border border-transparent text-[#1C1C1E] px-4 py-2.5 rounded-full focus:outline-none focus:bg-white focus:border-apple-purple focus:ring-2 focus:ring-apple-purple/10 font-sans transition-all"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer shrink-0 h-10 w-10 bg-apple-purple text-white hover:bg-apple-purple-hover rounded-full flex items-center justify-center transition-all shadow-sm shadow-apple-purple/20"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
            <ShortcutOverlay overlayId="task-detail" shortcuts={detailShortcuts} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
