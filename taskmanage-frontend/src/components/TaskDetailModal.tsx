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

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEditSubtask: (taskId: string, subtaskId: string, newTitle: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl z-10 flex flex-col max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-xl p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-left">
              {/* Header Section */}
              <div className="space-y-3 pr-8">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold font-mono tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                      priorityColors[task.priority]?.bg || "bg-slate-100 text-slate-650"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
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

                <h2 className="font-display text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  {task.title}
                </h2>

                {task.description && (
                  <p className="text-sm text-slate-500 font-sans leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Subtask Section */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <ListTodo className="h-5 w-5 text-indigo-500" />
                    Action Items
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {completedSubtasks} / {totalSubtasks} Completed
                  </span>
                </div>

                {/* Progress Bar */}
                {totalSubtasks > 0 && (
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-500"
                    />
                  </div>
                )}

                {/* Subtasks List */}
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                  {totalSubtasks === 0 ? (
                    <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400 italic">No action steps added yet.</p>
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
                              className="group/sub flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button
                                  type="button"
                                  onClick={() => onToggleSubtask(task.id, sub.id)}
                                  className="cursor-pointer text-slate-300 hover:text-slate-500 shrink-0 transition-colors"
                                >
                                  {sub.completed ? (
                                    <CheckSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                                  ) : (
                                    <Square className="h-5 w-5 shrink-0" />
                                  )}
                                </button>

                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingSubtaskTitle}
                                    onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveSubtaskEdit(sub.id);
                                      if (e.key === "Escape") setEditingSubtaskId(null);
                                    }}
                                    className="w-full bg-white text-sm border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 font-sans"
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    onDoubleClick={() => startEditSubtask(sub)}
                                    className={`text-sm truncate cursor-text font-sans font-medium transition-all ${
                                      sub.completed ? "line-through text-slate-400" : "text-slate-700"
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
                                      className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteSubtask(task.id, sub.id)}
                                      className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 transition-all"
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
                  <CornerDownRight className="h-4 w-4 text-slate-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Add a new action step..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 bg-slate-50 text-sm border border-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl focus:outline-none focus:bg-white focus:border-indigo-500 font-sans transition-all"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer shrink-0 h-10 w-10 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
