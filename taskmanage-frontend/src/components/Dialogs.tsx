import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, AlertTriangle, Layers, FolderPlus } from "lucide-react";
import { Priority } from "../types";

interface DialogBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

// Reusable animated popup frame matching Clean Minimalism style
export function DialogBase({ isOpen, onClose, title, description, children }: DialogBaseProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blur Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xl z-10"
          >
            {/* Close Button Button */}
            <button
              id="dialog-close-btn"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-4 text-left">
              <h3 className="font-display text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-xs text-slate-500 font-sans">
                  {description}
                </p>
              )}
            </div>

            {/* Content Slot */}
            <div className="mt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 1. Organization Dialog (Create / Rename)
interface OrgDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialValue?: string;
  isEdit?: boolean;
}

export function OrgDialog({ isOpen, onClose, onSubmit, initialValue = "", isEdit = false }: OrgDialogProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Rename Workspace" : "New Workspace"}
      description="Define separate environments for categorizing related deadlines or scopes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label htmlFor="org-name-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Workspace Name
          </label>
          <input
            id="org-name-input"
            type="text"
            required
            autoFocus
            placeholder="e.g. ⚡ Personal Ventures"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-850 shadow-inner placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="org-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="org-submit-btn"
            type="submit"
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
          >
            {isEdit ? "Save Changes" : "Create Workspace"}
          </button>
        </div>
      </form>
    </DialogBase>
  );
}

// 2. Date Dialog (Add custom Date Group)
interface DateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
}

export function DateDialog({ isOpen, onClose, onSubmit }: DateDialogProps) {
  const [date, setDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Default to today
      const todayISO = new Date().toISOString().split("T")[0];
      setDate(todayISO);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onSubmit(date);
      onClose();
    }
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title="Add Calendar Schedule"
      description="Add a date header to anchor empty tasks or plan milestone dates."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label htmlFor="date-group-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Target Date
          </label>
          <div className="relative">
            <input
              id="date-group-input"
              type="date"
              required
              autoFocus
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors font-sans"
            />
            <Calendar className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="date-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="date-submit-btn"
            type="submit"
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
          >
            Add Date Group
          </button>
        </div>
      </form>
    </DialogBase>
  );
}

// 2b. Move Task Date Dialog
interface MoveTaskDateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string) => void;
  taskTitle?: string;
  initialDate?: string;
}

export function MoveTaskDateDialog({
  isOpen,
  onClose,
  onSubmit,
  taskTitle,
  initialDate = "",
}: MoveTaskDateDialogProps) {
  const [date, setDate] = useState(initialDate);

  useEffect(() => {
    if (isOpen) {
      setDate(initialDate || new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      onSubmit(date);
      onClose();
    }
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title="Move Task Date"
      description={taskTitle ? `Shift "${taskTitle}" to a different day.` : "Shift this task to a different day."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label htmlFor="move-task-date-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            New Date
          </label>
          <div className="relative">
            <input
              id="move-task-date-input"
              type="date"
              required
              autoFocus
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors font-sans"
            />
            <Calendar className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="move-task-date-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="move-task-date-submit-btn"
            type="submit"
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
          >
            Move Task
          </button>
        </div>
      </form>
    </DialogBase>
  );
}

// 3. Task Dialog (Create / Edit Task)
interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fields: {
    title: string;
    description: string;
    date: string;
    priority: Priority;
  }) => void;
  initialValues?: {
    title: string;
    description?: string;
    date: string;
    priority: Priority;
  };
  isEdit?: boolean;
}

export function TaskDialog({ isOpen, onClose, onSubmit, initialValues, isEdit = false }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setTitle(initialValues.title);
        setDescription(initialValues.description || "");
        setDate(initialValues.date);
        setPriority(initialValues.priority);
      } else {
        setTitle("");
        setDescription("");
        setDate(new Date().toISOString().split("T")[0]);
        setPriority("medium");
      }
    }
  }, [isOpen, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && date) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        date,
        priority
      });
      onClose();
    }
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Task Info" : "Draft New Task"}
      description="Create a discrete commitment, attach optional descriptions, and pin priority constraints."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label htmlFor="task-title-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Task Heading
          </label>
          <input
            id="task-title-input"
            type="text"
            required
            autoFocus
            placeholder="e.g. Conduct CDN system load inspection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors font-sans"
          />
        </div>

        <div className="text-left">
          <label htmlFor="task-desc-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Details (Optional)
          </label>
          <textarea
            id="task-desc-input"
            placeholder="Add relevant specs, resources, or guidelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none transition-colors font-sans resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          <div>
            <label htmlFor="task-date-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              id="task-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-slate-300 focus:outline-none transition-colors font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority Tier
            </label>
            <div className="flex gap-1 h-[38px]">
              {(["low", "medium", "high"] as Priority[]).map((p) => {
                const colors = {
                  low: p === priority ? "bg-slate-200 border-slate-300 text-slate-800 font-bold" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600",
                  medium: p === priority ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600",
                  high: p === priority ? "bg-red-50 border-red-200 text-red-700 font-bold" : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600",
                };
                return (
                  <button
                    id={`priority-btn-${p}`}
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-xl border text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer ${colors[p]}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <button
            id="task-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="task-submit-btn"
            type="submit"
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
          >
            {isEdit ? "Update Task" : "Save Task"}
          </button>
        </div>
      </form>
    </DialogBase>
  );
}

// 4. Subtask Dialog (Create / Edit Subtask)
interface SubtaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  initialValue?: string;
  isEdit?: boolean;
}

export function SubtaskDialog({ isOpen, onClose, onSubmit, initialValue = "", isEdit = false }: SubtaskDialogProps) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
      onClose();
    }
  };

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Rename Action Step" : "Add Subtask"}
      description="Subtasks help divide major milestones into rapid checkboxes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-left">
          <label htmlFor="subtask-title-input" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Subtask Label
          </label>
          <input
            id="subtask-title-input"
            type="text"
            required
            autoFocus
            placeholder="e.g. Deploy DNS verification text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-850 shadow-inner placeholder-slate-400 focus:border-slate-450 focus:outline-none transition-colors font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="subtask-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="subtask-submit-btn"
            type="submit"
            className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all focus:outline-none"
          >
            {isEdit ? "Update Subtask" : "Add Subtask"}
          </button>
        </div>
      </form>
    </DialogBase>
  );
}

// 5. Delete Confirm Dialog (For extra safety and high UX polish)
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="space-y-4 text-left">
        <p className="text-sm text-slate-500 font-sans leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="confirm-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-250 hover:text-slate-800 transition-all focus:outline-none"
          >
            Nevermind
          </button>
          <button
            id="confirm-submit-btn"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 transition-all focus:outline-none"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </DialogBase>
  );
}
