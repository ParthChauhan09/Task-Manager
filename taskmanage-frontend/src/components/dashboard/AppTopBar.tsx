import { Search, Plus, Calendar, Filter, X, Menu, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Organization } from "../../types";

interface AppTopBarProps {
    activeOrg: Organization;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onOpenMobileSidebar: () => void;
    onRenameOrg: () => void;
    onAddDate: () => void;
    onAddTask: () => void;
    filteredCount: number;
    allCollapsed: boolean;
    onCollapseAll: () => void;
}

export function AppTopBar({
    activeOrg, searchQuery, onSearchChange,
    onOpenMobileSidebar, onRenameOrg, onAddDate, onAddTask,
    filteredCount, allCollapsed, onCollapseAll,
}: AppTopBarProps) {
    return (
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-white flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between z-10">
            {/* Org title */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    id="mobile-hamburger-menu-btn"
                    onClick={onOpenMobileSidebar}
                    className="cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex flex-col text-left group cursor-pointer min-w-0" onClick={onRenameOrg}>
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {activeOrg.name}
                        </h2>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to Rename
                        </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 tracking-wide mt-0.5">
                        Workspace Index // {activeOrg.tasks.length} standard commitments
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative w-full max-w-xs sm:w-60">
                    <input
                        id="search-tasks-field"
                        type="text"
                        placeholder="Search tasks, descriptions..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-slate-50 text-xs border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-3 py-2.5 h-10 focus:outline-none focus:border-slate-400 transition-all focus:ring-1 focus:ring-slate-300"
                    />
                    <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    {searchQuery && (
                        <button onClick={() => onSearchChange("")} className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {searchQuery && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        <Filter className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{filteredCount} match{filteredCount !== 1 ? "es" : ""}</span>
                        <button onClick={() => onSearchChange("")} className="ml-1 text-indigo-600 hover:text-indigo-500 font-semibold">
                            Clear
                        </button>
                    </div>
                )}

                {/* Collapse / Expand all */}
                <button
                    id="collapse-all-btn"
                    onClick={onCollapseAll}
                    title={allCollapsed ? "Expand all date groups" : "Collapse all date groups"}
                    className="cursor-pointer h-10 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                >
                    {allCollapsed
                        ? <ChevronsUpDown className="h-3.5 w-3.5" />
                        : <ChevronsDownUp className="h-3.5 w-3.5" />
                    }
                    <span className="text-xs font-semibold hidden sm:inline">
                        {allCollapsed ? "Expand" : "Collapse"}
                    </span>
                </button>

                <button
                    id="header-add-date-btn"
                    onClick={onAddDate}
                    className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                    <Calendar className="h-3.5 w-3.5" />
                    Add Date
                </button>

                <button
                    id="header-create-task-btn"
                    onClick={onAddTask}
                    className="cursor-pointer h-10 px-5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Plan Task
                </button>
            </div>
        </div>
    );
}
