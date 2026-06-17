import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { CustomCursor } from "../CustomCursor";
import { Sidebar } from "../Sidebar";
import { AppTopBar } from "./AppTopBar";
import { WorkspaceWelcome } from "./WorkspaceWelcome";
import { MobileSidebar } from "./MobileSidebar";
import { DashboardDialogs } from "./DashboardDialogs";
import { useDashboard } from "../../hooks/useDashboard";
import { useTaskFilters } from "../../hooks/useTaskFilters";
import { formatDateLabel } from "../../utils/dateHelpers";
import { Inbox, Calendar } from "lucide-react";

interface DashboardProps {
    onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
    const dash = useDashboard();
    const navigate = useNavigate();
    const { groupedTasksMap, sortedDates } = useTaskFilters(dash.activeOrg, dash.searchQuery);

    if (!dash.isHydrated) {
        return (
            <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-2 border-slate-800 border-t-transparent rounded-full"
                />
                <p className="text-sm font-medium text-slate-500">Loading your workspaces...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden relative">
            <CustomCursor />

            {/* Desktop sidebar */}
            <div className="hidden md:flex shrink-0 h-full">
                <Sidebar
                    organizations={dash.organizations}
                    activeOrgId={dash.activeOrg?.id ?? null}
                    onSelectOrg={(id) => { dash.setActiveOrgId(id); dash.setSearchQuery(""); }}
                    onCreateOrg={() => dash.setOrgDialog({ isOpen: true, isEdit: false })}
                    onRenameOrg={(id, name) => dash.setOrgDialog({ isOpen: true, isEdit: true, initialName: name, targetId: id })}
                    onDeleteOrg={dash.handleDeleteOrg}
                    onLogout={onLogout}
                />
            </div>

            {/* Mobile sidebar */}
            <MobileSidebar
                isOpen={dash.isMobileSidebarOpen}
                organizations={dash.organizations}
                activeOrgId={dash.activeOrg?.id ?? null}
                onClose={() => dash.setIsMobileSidebarOpen(false)}
                onSelectOrg={(id) => { dash.setActiveOrgId(id); dash.setSearchQuery(""); }}
                onCreateOrg={() => dash.setOrgDialog({ isOpen: true, isEdit: false })}
                onRenameOrg={(id, name) => dash.setOrgDialog({ isOpen: true, isEdit: true, initialName: name, targetId: id })}
                onDeleteOrg={dash.handleDeleteOrg}
                onLogout={onLogout}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/40 overflow-hidden font-sans">
                {dash.activeOrg ? (
                    <>
                        <AppTopBar
                            activeOrg={dash.activeOrg}
                            searchQuery={dash.searchQuery}
                            onSearchChange={dash.setSearchQuery}
                            onOpenMobileSidebar={() => dash.setIsMobileSidebarOpen(true)}
                            onRenameOrg={() => dash.setOrgDialog({ isOpen: true, isEdit: true, initialName: dash.activeOrg!.name, targetId: dash.activeOrg!.id })}
                            onAddDate={() => dash.setDateDialog({ isOpen: true })}
                            onAddTask={() => dash.setTaskDialog({ isOpen: true, isEdit: false })}
                            filteredCount={sortedDates.length}
                        />

                        {/* Overview grid — click a card to open the date detail page */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {sortedDates.length === 0 ? (
                                <EmptyState
                                    hasSearch={!!dash.searchQuery}
                                    onClearSearch={() => dash.setSearchQuery("")}
                                    onAddDate={() => dash.setDateDialog({ isOpen: true })}
                                    onAddTask={() => dash.setTaskDialog({ isOpen: true, isEdit: false })}
                                />
                            ) : (
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                                    <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-4">
                                        {sortedDates.length} schedule{sortedDates.length !== 1 ? "s" : ""} — click a date to view tasks
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {sortedDates.map((dateStr, i) => {
                                            const tasks = groupedTasksMap[dateStr] ?? [];
                                            const done = tasks.filter((t) => t.completed).length;
                                            const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

                                            return (
                                                <motion.button
                                                    key={dateStr}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => navigate(`/workspace/${dash.activeOrg!.id}/date/${dateStr}`)}
                                                    className="cursor-pointer text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm transition-all group"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-3">
                                                        <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5 group-hover:text-indigo-500 transition-colors" />
                                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${pct === 100 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                                                            {done}/{tasks.length}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                        {formatDateLabel(dateStr)}
                                                    </p>
                                                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-slate-800"}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <WorkspaceWelcome
                        onCreateOrg={() => dash.setOrgDialog({ isOpen: true, isEdit: false })}
                        onLogout={onLogout}
                        onOpenMobileSidebar={() => dash.setIsMobileSidebarOpen(true)}
                    />
                )}
            </div>

            <DashboardDialogs
                orgDialog={dash.orgDialog}
                setOrgDialog={dash.setOrgDialog}
                dateDialog={dash.dateDialog}
                setDateDialog={dash.setDateDialog}
                taskDialog={dash.taskDialog}
                setTaskDialog={dash.setTaskDialog}
                confirmDialog={dash.confirmDialog}
                setConfirmDialog={dash.setConfirmDialog}
                onSubmitOrg={(name) => {
                    if (dash.orgDialog.isEdit && dash.orgDialog.targetId) {
                        dash.handleRenameOrg(dash.orgDialog.targetId, name);
                    } else {
                        dash.handleCreateOrg(name);
                    }
                }}
                onSubmitDate={dash.handleAddDateGroup}
                onSubmitTask={dash.handleAddOrUpdateTask}
            />
        </div>
    );
}

// ── local empty state ─────────────────────────────────────────────────────────
function EmptyState({ hasSearch, onClearSearch, onAddDate, onAddTask }: {
    hasSearch: boolean;
    onClearSearch: () => void;
    onAddDate: () => void;
    onAddTask: () => void;
}) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Inbox className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="font-display font-black text-lg text-slate-900 tracking-tight">
                {hasSearch ? "No matching dates" : "No schedules yet"}
            </h3>
            <p className="max-w-xs text-xs text-slate-400 mt-2.5 leading-relaxed">
                {hasSearch
                    ? "Clear the search or try a different term."
                    : "Add a date to start organising your tasks by day."}
            </p>
            {hasSearch ? (
                <button onClick={onClearSearch} className="cursor-pointer mt-5 text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                    Clear search
                </button>
            ) : (
                <div className="flex gap-2.5 mt-6">
                    <button onClick={onAddDate} className="cursor-pointer h-10 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors">
                        + Add Date
                    </button>
                    <button onClick={onAddTask} className="cursor-pointer h-10 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors">
                        + Plan Task
                    </button>
                </div>
            )}
        </div>
    );
}
