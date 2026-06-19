import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Task } from "../../types";
import { TaskCard } from "../TaskCard";
import { formatDateLabel } from "../../utils/dateHelpers";
import { useRef } from "react";
import { useGridNavigation } from "../../hooks/useGridNavigation";

interface DateSectionProps {
    dateStr: string;
    tasks: Task[];
    isCollapsed: boolean;
    animationIndex: number;
    onToggleCollapse: (date: string) => void;
    onAddTask: (date: string) => void;
    onDeleteDateGroup: (date: string) => void;
    onToggleComplete: (taskId: string) => void;
    onEditTask: (task: Task) => void;
    onMoveTaskDate: (task: Task) => void;
    onDeleteTask: (taskId: string) => void;
    onAddSubtask: (taskId: string, title: string) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
    onEditSubtask: (taskId: string, subtaskId: string, title: string) => void;
    onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export function DateSection({
    dateStr, tasks, isCollapsed, animationIndex,
    onToggleCollapse, onAddTask, onDeleteDateGroup,
    onToggleComplete, onEditTask, onMoveTaskDate, onDeleteTask,
    onAddSubtask, onToggleSubtask, onEditSubtask, onDeleteSubtask,
}: DateSectionProps) {
    const totalCount = tasks.length;
    const completeCount = tasks.filter((t) => t.completed).length;
    const progressPercent = totalCount > 0 ? (completeCount / totalCount) * 100 : 0;

    const gridRef = useRef<HTMLDivElement>(null);
    useGridNavigation(gridRef, ".task-nav-item");

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: animationIndex * 0.08, duration: 0.4 }}
            className="space-y-4"
        >
            {/* Section header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                    <button
                        id={`collapse-date-btn-${dateStr}`}
                        onClick={() => onToggleCollapse(dateStr)}
                        className="cursor-pointer p-1 rounded-lg hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <h3 className="font-display font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                        {formatDateLabel(dateStr)}
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                        {completeCount} / {totalCount} Complete
                    </span>
                    {totalCount > 0 && (
                        <div className="w-16 hidden sm:block bg-slate-200 rounded-full h-1 overflow-hidden">
                            <div className="bg-slate-900 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        id={`add-task-to-date-${dateStr}`}
                        onClick={() => onAddTask(dateStr)}
                        className="cursor-pointer p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-all"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button
                        id={`delete-date-group-${dateStr}`}
                        onClick={() => onDeleteDateGroup(dateStr)}
                        className="cursor-pointer p-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-red-600 transition-all"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Task grid */}
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 py-3">
                            {tasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onToggleComplete={onToggleComplete}
                                    onEditTask={onEditTask}
                                    onMoveTaskDate={onMoveTaskDate}
                                    onDeleteTask={onDeleteTask}
                                    onAddSubtask={onAddSubtask}
                                    onToggleSubtask={onToggleSubtask}
                                    onEditSubtask={onEditSubtask}
                                    onDeleteSubtask={onDeleteSubtask}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
