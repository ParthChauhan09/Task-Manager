import { Inbox } from "lucide-react";

interface EmptyWorkspaceProps {
    searchQuery: string;
    onAddDate: () => void;
    onAddTask: () => void;
}

export function EmptyWorkspace({ searchQuery, onAddDate, onAddTask }: EmptyWorkspaceProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center select-none">
            <div className="w-16 h-16 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center mb-4 shadow-sm shadow-[#1C1C1E]/02">
                <Inbox className="h-8 w-8 text-[#8E8E93]" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[#1C1C1E] tracking-tight">
                {searchQuery ? "No matching schedules found" : "Workspace is wide open"}
            </h3>
            <p className="max-w-xs text-xs text-[#8E8E93] font-sans mt-2.5 leading-relaxed">
                {searchQuery
                    ? "Refine your terms or clear filters to recover missing tasks."
                    : "Add a date or draft your first task to get started."}
            </p>
            {!searchQuery && (
                <div className="flex gap-2.5 mt-6">
                    <button
                        id="empty-dashboard-add-date"
                        onClick={onAddDate}
                        className="cursor-pointer h-10 px-4 border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-[#1C1C1E] font-medium rounded-full text-xs transition-colors"
                    >
                        + Add Calendar Date
                    </button>
                    <button
                        id="empty-dashboard-add-task"
                        onClick={onAddTask}
                        className="cursor-pointer h-10 px-5 bg-apple-purple hover:bg-apple-purple-hover text-white font-medium rounded-full text-xs shadow-sm shadow-apple-purple/15 transition-colors"
                    >
                        + Draft Initial Task
                    </button>
                </div>
            )}
        </div>
    );
}
