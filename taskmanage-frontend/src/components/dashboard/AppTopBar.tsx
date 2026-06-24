import { Search, Plus, Calendar, Filter, X, Menu } from "lucide-react";
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
}

export function AppTopBar({
    activeOrg, searchQuery, onSearchChange,
    onOpenMobileSidebar, onRenameOrg, onAddDate, onAddTask, filteredCount,
}: AppTopBarProps) {
    return (
        <div className="p-4 sm:p-6 border-b border-[#E5E5EA]/60 bg-white/80 backdrop-blur-md flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between z-10 select-none">
            {/* Org title */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    id="mobile-hamburger-menu-btn"
                    onClick={onOpenMobileSidebar}
                    className="cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-full border border-[#E5E5EA] bg-[#F5F5F7] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA]/60 focus:outline-none transition-all duration-200"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex flex-col text-left group cursor-pointer min-w-0" onClick={onRenameOrg}>
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1C1E] group-hover:text-apple-purple transition-colors">
                            {activeOrg.name}
                        </h2>
                        <span className="text-[10px] bg-[#F5F5F7] text-[#8E8E93] px-2.5 py-0.5 rounded-full border border-[#E5E5EA] font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                            Rename
                        </span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] tracking-wide mt-0.5">
                        Workspace · {activeOrg.tasks.length} commitments
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
                        placeholder="Search dates..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-[#F5F5F7] text-xs border border-transparent text-[#1C1C1E] placeholder-[#8E8E93]/60 rounded-full pl-10 pr-8 py-2.5 h-10 focus:outline-none focus:bg-white focus:border-apple-purple focus:ring-2 focus:ring-apple-purple/10 transition-all duration-200 font-sans"
                    />
                    <Search className="absolute left-3.5 top-[13px] h-3.5 w-3.5 text-[#8E8E93]" />
                    {searchQuery && (
                        <button onClick={() => onSearchChange("")} className="absolute right-3.5 top-[11px] text-[#8E8E93] hover:text-[#1C1C1E]">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {searchQuery && (
                    <div className="flex items-center gap-1.5 text-xs text-[#8E8E93] bg-[#F5F5F7] px-3.5 py-1.5 rounded-full border border-[#E5E5EA]">
                        <Filter className="h-3.5 w-3.5 text-apple-purple" />
                        <span>{filteredCount} match{filteredCount !== 1 ? "es" : ""}</span>
                        <button onClick={() => onSearchChange("")} className="ml-1 text-apple-purple hover:underline font-semibold">
                            Clear
                        </button>
                    </div>
                )}

                <button
                    id="header-add-date-btn"
                    onClick={onAddDate}
                    className="cursor-pointer h-10 px-4 border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-[#1C1C1E] rounded-full text-xs font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm shadow-[#1C1C1E]/02"
                >
                    <Calendar className="h-3.5 w-3.5 text-[#8E8E93]" />
                    Add Date
                </button>

                <button
                    id="header-create-task-btn"
                    onClick={onAddTask}
                    className="cursor-pointer h-10 px-5 bg-apple-purple text-white hover:bg-apple-purple-hover rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm shadow-apple-purple/15 transition-all duration-200 active:scale-95"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Plan Task
                </button>
            </div>
        </div>
    );
}
