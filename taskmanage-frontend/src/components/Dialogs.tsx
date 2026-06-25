import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Calendar, AlertTriangle, Layers, FolderPlus, Check } from "lucide-react";
import { Priority } from "../types";

interface DialogBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

// Reusable animated popup frame matching Clean Apple style
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
            className="fixed inset-0 bg-[#1C1C1E]/20 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-hidden rounded-[28px] border border-[#E5E5EA]/60 bg-white/95 backdrop-blur-xl p-8 shadow-2xl z-10 flex flex-col"
          >
            {/* Close Button */}
            <button
              id="dialog-close-btn"
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 hover:bg-[#F5F5F7] text-[#8E8E93] hover:text-[#1C1C1E] transition-all focus:outline-none cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="mb-4 text-left shrink-0">
              <h3 className="font-display text-lg font-semibold tracking-tight text-[#1C1C1E] flex items-center gap-2">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-xs text-[#8E8E93] font-sans leading-relaxed">
                  {description}
                </p>
              )}
            </div>

            {/* Content Slot */}
            <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1 text-left">{children}</div>
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
          <label htmlFor="org-name-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
            Workspace Name
          </label>
          <input
            id="org-name-input"
            type="text"
            required
            autoFocus
            placeholder="e.g. Personal Projects"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="org-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#F5F5F7] px-5 py-2.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="org-submit-btn"
            type="submit"
            className="cursor-pointer rounded-full bg-apple-purple px-5 py-2.5 text-xs font-medium text-white shadow-sm shadow-apple-purple/15 hover:bg-apple-purple-hover active:scale-95 transition-all focus:outline-none"
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
          <label htmlFor="date-group-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
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
              className="w-full rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1C1C1E] focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans"
            />
            <Calendar className="absolute right-4 top-3.5 h-4 w-4 text-[#8E8E93] pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="date-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#F5F5F7] px-5 py-2.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="date-submit-btn"
            type="submit"
            className="cursor-pointer rounded-full bg-apple-purple px-5 py-2.5 text-xs font-medium text-white shadow-sm shadow-apple-purple/15 hover:bg-apple-purple-hover active:scale-95 transition-all focus:outline-none"
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
          <label htmlFor="move-task-date-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
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
              className="w-full rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1C1C1E] focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans"
            />
            <Calendar className="absolute right-4 top-3.5 h-4 w-4 text-[#8E8E93] pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="move-task-date-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#F5F5F7] px-5 py-2.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="move-task-date-submit-btn"
            type="submit"
            className="cursor-pointer rounded-full bg-apple-purple px-5 py-2.5 text-xs font-medium text-white shadow-sm shadow-apple-purple/15 hover:bg-apple-purple-hover active:scale-95 transition-all focus:outline-none"
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
          <label htmlFor="task-title-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
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
            className="w-full rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-4.5 py-2.5 text-sm text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans"
          />
        </div>

        <div className="text-left">
          <label htmlFor="task-desc-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
            Details (Optional)
          </label>
          <textarea
            id="task-desc-input"
            placeholder="Add relevant specs, resources, or guidelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-[#E5E5EA] bg-[#F5F5F7] px-4 py-3 text-sm text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div>
            <label htmlFor="task-date-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
              Due Date
            </label>
            <input
              id="task-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-4 py-2.5 text-xs text-[#1C1C1E] focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
              Priority Tier
            </label>
            <div className="flex gap-2 h-[38px]">
              {(["low", "medium", "high"] as Priority[]).map((p) => {
                const colors = {
                  low: p === priority ? "bg-[#8E8E93] text-white font-medium border-transparent" : "bg-[#F5F5F7] border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]/40",
                  medium: p === priority ? "bg-apple-purple text-white font-medium border-transparent" : "bg-[#F5F5F7] border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]/40",
                  high: p === priority ? "bg-[#FF3B30] text-white font-medium border-transparent" : "bg-[#F5F5F7] border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]/40",
                };
                return (
                  <button
                    id={`priority-btn-${p}`}
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 rounded-full border text-[10px] font-semibold uppercase transition-all tracking-wider cursor-pointer h-9 ${colors[p]}`}
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
            className="cursor-pointer rounded-full bg-[#F5F5F7] px-5 py-2.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="task-submit-btn"
            type="submit"
            className="cursor-pointer rounded-full bg-apple-purple px-5 py-2.5 text-xs font-medium text-white shadow-sm shadow-apple-purple/15 hover:bg-apple-purple-hover active:scale-95 transition-all focus:outline-none"
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
          <label htmlFor="subtask-title-input" className="block text-[11px] font-medium text-[#8E8E93] mb-1.5 ml-3">
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
            className="w-full rounded-full border border-[#E5E5EA] bg-[#F5F5F7] px-4 py-2.5 text-sm text-[#1C1C1E] placeholder-[#8E8E93]/60 focus:border-apple-purple focus:bg-white focus:ring-2 focus:ring-apple-purple/10 focus:outline-none transition-all font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="subtask-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#F5F5F7] px-5 py-2.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            id="subtask-submit-btn"
            type="submit"
            className="cursor-pointer rounded-full bg-apple-purple px-5 py-2.5 text-xs font-medium text-white shadow-sm shadow-apple-purple/15 hover:bg-apple-purple-hover active:scale-95 transition-all focus:outline-none"
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
        <p className="text-sm text-[#8E8E93] font-sans leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            id="confirm-cancel-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-[#F5F5F7] px-5 py-2.5 text-xs font-medium text-[#1C1C1E] hover:bg-[#E5E5EA] transition-all focus:outline-none"
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
            className="cursor-pointer rounded-full bg-[#FF3B30] px-5 py-2.5 text-xs font-medium text-white shadow-sm shadow-[#FF3B30]/15 hover:bg-[#E02B20] active:scale-95 transition-all focus:outline-none"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </DialogBase>
  );
}

// 6. Theme Settings Dialog
import { useAppTheme, AccentTheme, themesInfo } from "../context/ThemeContext";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { theme: currentTheme, setTheme } = useAppTheme();

  return (
    <DialogBase
      isOpen={isOpen}
      onClose={onClose}
      title="Appearance Settings"
      description="Choose your system accent color to customize buttons, checkboxes, and active tabs."
    >
      <div className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider mb-3 ml-1 text-left">
            Accent Color
          </label>
          <div className="grid grid-cols-4 gap-3 p-1">
            {(Object.keys(themesInfo) as AccentTheme[]).map((tKey) => {
              const th = themesInfo[tKey];
              const isSelected = currentTheme === tKey;
              return (
                <button
                  key={tKey}
                  onClick={() => setTheme(tKey)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer focus:outline-none ${
                    isSelected
                      ? "border-apple-purple bg-apple-purple/5 shadow-sm scale-[1.02] font-semibold"
                      : "border-[#E5E5EA]/70 hover:border-[#8E8E93]/40 hover:bg-[#F5F5F7]/40"
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-full flex items-center justify-center shadow-inner border border-black/5"
                    style={{ backgroundColor: th.primary }}
                  >
                    {isSelected && (
                      <Check className="h-4 w-4 text-white stroke-[3px]" />
                    )}
                  </span>
                  <span className="text-[10px] text-[#1C1C1E] mt-1.5 font-sans font-medium">
                    {th.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E5E5EA]/60">
          <button
            id="settings-done-btn"
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full bg-apple-purple px-6 py-2.5 text-xs font-semibold text-white shadow-sm shadow-apple-purple/15 hover:bg-apple-purple-hover active:scale-95 transition-all focus:outline-none"
          >
            Done
          </button>
        </div>
      </div>
    </DialogBase>
  );
}

