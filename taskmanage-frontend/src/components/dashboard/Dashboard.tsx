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
import { AuthUser } from "../../api/authApi";
import { useRef } from "react";
import { useGridNavigation } from "../../hooks/useGridNavigation";

interface DashboardProps {
    user: AuthUser | null;
    onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
    const dash = useDashboard();
    const navigate = useNavigate();
    const { groupedTasksMap, sortedDates } = useTaskFilters(dash.activeOrg, dash.searchQuery);

    const datesGridRef = useRef<HTMLDivElement>(null);
    useGridNavigation(datesGridRef, ".date-nav-item");

    if (!dash.isHydrated) {
        return (
            <div className="fixed inset-0 bg-[#F5F5F7] flex flex-col items-center justify-center gap-4 select-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-2 border-[#5856D6] border-t-transparent rounded-full"
                />
                <p className="text-sm font-medium text-[#8E8E93]">Loading your workspaces...</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen bg-[#F5F5F7] text-[#1C1C1E] overflow-hidden relative select-none">
            <CustomCursor />

            {/* Desktop sidebar */}
            <div className="hidden md:flex shrink-0 h-full">
                <Sidebar
                    user={user}
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
                user={user}
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
            <div className="flex-1 flex flex-col h-full bg-[#F5F5F7]/30 overflow-hidden font-sans">
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
                                    <p className="text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider mb-4">
                                        {sortedDates.length} schedule{sortedDates.length !== 1 ? "s" : ""} — click a date to view tasks
                                    </p>
                                    <div ref={datesGridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {sortedDates.map((dateStr, i) => {
                                            const tasks = groupedTasksMap[dateStr] ?? [];
                                            const done = tasks.filter((t) => t.completed).length;
                                            const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

                                            return (
                                                <motion.button
                                                    key={dateStr}
                                                    autoFocus={i === 0}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ type: "spring", damping: 25, stiffness: 220, delay: i * 0.03 }}
                                                    onMouseEnter={(e) => e.currentTarget.focus()}
                                                    onClick={() => navigate(`/workspace/${dash.activeOrg!.id}/date/${dateStr}`)}
                                                    className="date-nav-item cursor-pointer text-left bg-white border border-[#E5E5EA]/60 rounded-[24px] p-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all group focus:outline-none focus:ring-2 focus:ring-[#5856D6]/40 focus:-translate-y-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.01)]"
                                                >
                                                    <div className="flex items-start justify-between gap-2 mb-4">
                                                        <Calendar className="h-4.5 w-4.5 text-[#8E8E93] shrink-0 mt-0.5 group-hover:text-[#5856D6] transition-colors" />
                                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${pct === 100 ? "bg-[#34C759]/10 border-transparent text-[#34C759]" : "bg-[#F5F5F7] border-[#E5E5EA]/40 text-[#8E8E93]"}`}>
                                                            {done}/{tasks.length}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#1C1C1E] tracking-tight group-hover:text-[#5856D6] transition-colors">
                                                        {formatDateLabel(dateStr)}
                                                    </p>
                                                    <div className="mt-4 w-full bg-[#E5E5EA] rounded-full h-1 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? "bg-[#34C759]" : "bg-gradient-to-r from-[#5856D6] to-[#4F46E5]"}`}
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
                moveTaskDateDialog={dash.moveTaskDateDialog}
                setMoveTaskDateDialog={dash.setMoveTaskDateDialog}
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
                onSubmitMoveTaskDate={dash.handleMoveTaskDate}
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
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center select-none">
            <div className="w-16 h-16 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center mb-4 shadow-sm shadow-[#1C1C1E]/02">
                <Inbox className="h-8 w-8 text-[#8E8E93]" />
            </div>
            <h3 className="font-display font-semibold text-lg text-[#1C1C1E] tracking-tight">
                {hasSearch ? "No matching dates" : "No schedules yet"}
            </h3>
            <p className="max-w-xs text-xs text-[#8E8E93] mt-2.5 leading-relaxed">
                {hasSearch
                    ? "Clear the search or try a different term."
                    : "Add a date to start organising your tasks by day."}
            </p>
            {hasSearch ? (
                <button onClick={onClearSearch} className="cursor-pointer mt-5 text-xs font-semibold text-[#5856D6] hover:underline">
                    Clear search
                </button>
            ) : (
                <div className="flex gap-2.5 mt-6">
                    <button onClick={onAddDate} className="cursor-pointer h-10 px-4 border border-[#E5E5EA] bg-white hover:bg-[#F5F5F7] text-[#1C1C1E] font-medium rounded-full text-xs transition-colors">
                        + Add Date
                    </button>
                    <button onClick={onAddTask} className="cursor-pointer h-10 px-5 bg-[#5856D6] hover:bg-[#4846B6] text-white font-medium rounded-full text-xs shadow-sm shadow-[#5856D6]/15 transition-colors">
                        + Plan Task
                    </button>
                </div>
            )}
        </div>
    );
}
