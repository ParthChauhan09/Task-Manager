import { Inbox } from "lucide-react";

interface EmptyWorkspaceProps {
    searchQuery: string;
    onAddDate: () => void;
    onAddTask: () => void;
}

export function EmptyWorkspace({ searchQuery, onAddDate, onAddTask }: EmptyWorkspaceProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Inbox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-display font-black text-lg text-slate-900 tracking-tight">
                {searchQuery ? "No matching schedules found" : "Workspace is wide open"}
            </h3>
            <p className="max-w-xs text-xs text-slate-400 font-sans mt-2.5 leading-relaxed">
                {searchQuery
                    ? "Refine your terms or clear filters to recover missing tasks."
                    : "Add a date or draft your first task to get started."}
            </p>
            {!searchQuery && (
                <div className="flex gap-2.5 mt-6">
                    <button
                        id="empty-dashboard-add-date"
                        onClick={onAddDate}
                        className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                    >
                        + Add Calendar Date
                    </button>
                    <button
                        id="empty-dashboard-add-task"
                        onClick={onAddTask}
                        className="cursor-pointer h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
                    >
                        + Draft Initial Task
                    </button>
                </div>
            )}
        </div>
    );
}
