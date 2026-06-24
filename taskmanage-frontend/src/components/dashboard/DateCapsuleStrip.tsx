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
    <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-8 py-3 border-b border-[#E5E5EA]/60 bg-[#F5F5F7]/30 scrollbar-none select-none">
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
            className={`cursor-pointer shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all active:scale-95
              ${isActive
                ? "bg-apple-purple border-transparent text-white shadow-sm shadow-apple-purple/15"
                : allDone
                  ? "bg-[#34C759]/10 border-transparent text-[#34C759] hover:bg-[#34C759]/20"
                  : "bg-white border-[#E5E5EA] text-[#1C1C1E]/80 hover:bg-[#F5F5F7] hover:border-[#E5E5EA]/80"
              }`}
          >
            <span>{formatDateLabel(dateStr)}</span>
            {total > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                ${isActive ? "bg-white/20 text-white" : allDone ? "bg-[#34C759]/20 text-[#34C759]" : "bg-[#F5F5F7] text-[#8E8E93]"}`}
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
