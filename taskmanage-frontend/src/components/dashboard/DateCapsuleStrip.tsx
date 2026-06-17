import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { formatDateLabel } from "../../utils/dateHelpers";
import { Task } from "../../types";

interface DateCapsuleStripProps {
  orgId: string;
  dates: string[];
  tasksByDate: Record<string, Task[]>;
  activeDateStr?: string; // highlight current date if on detail page
}

export function DateCapsuleStrip({ orgId, dates, tasksByDate, activeDateStr }: DateCapsuleStripProps) {
  const navigate = useNavigate();

  if (dates.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-8 py-3 border-b border-slate-100 bg-white scrollbar-none">
      {dates.map((dateStr, i) => {
        const tasks = tasksByDate[dateStr] ?? [];
        const total = tasks.length;
        const done = tasks.filter((t) => t.completed).length;
        const isActive = dateStr === activeDateStr;
        const allDone = total > 0 && done === total;

        return (
          <motion.button
            key={dateStr}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/workspace/${orgId}/date/${dateStr}`)}
            title={`View all tasks for ${formatDateLabel(dateStr)}`}
            className={`cursor-pointer shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all active:scale-95
              ${isActive
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : allDone
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
          >
            <span>{formatDateLabel(dateStr)}</span>
            {total > 0 && (
              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full
                ${isActive ? "bg-white/20 text-white" : allDone ? "bg-emerald-200 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
              >
                {done}/{total}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
