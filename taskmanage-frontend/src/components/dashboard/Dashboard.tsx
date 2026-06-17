import { motion } from "motion/react";
import { CustomCursor } from "../CustomCursor";
import { Sidebar } from "../Sidebar";
import { AppTopBar } from "./AppTopBar";
import { DateSection } from "./DateSection";
import { EmptyWorkspace } from "./EmptyWorkspace";
import { WorkspaceWelcome } from "./WorkspaceWelcome";
import { MobileSidebar } from "./MobileSidebar";
import { DashboardDialogs } from "./DashboardDialogs";
import { useDashboard } from "../../hooks/useDashboard";
import { useTaskFilters } from "../../hooks/useTaskFilters";

interface DashboardProps {
    onLogout: () => void;
}

export function Dashboard({ onLogout }: DashboardProps) {
    const dash = useDashboard();
    const { filteredTasks, groupedTasksMap, sortedDates } = useTaskFilters(dash.activeOrg, dash.searchQuery);

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
                            filteredCount={filteredTasks.length}
                        />

                        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10">
                            {sortedDates.length === 0 ? (
                                <EmptyWorkspace
                                    searchQuery={dash.searchQuery}
                                    onAddDate={() => dash.setDateDialog({ isOpen: true })}
                                    onAddTask={() => dash.setTaskDialog({ isOpen: true, isEdit: false })}
                                />
                            ) : (
                                sortedDates.map((dateStr, index) => (
                                    <DateSection
                                        key={dateStr}
                                        dateStr={dateStr}
                                        tasks={groupedTasksMap[dateStr] ?? []}
                                        isCollapsed={!!dash.collapsedDates[dateStr]}
                                        animationIndex={index}
                                        onToggleCollapse={dash.toggleCollapseDate}
                                        onAddTask={dash.handleAddDateGroup}
                                        onDeleteDateGroup={dash.handleDeleteDateGroup}
                                        onToggleComplete={dash.handleToggleTaskComplete}
                                        onEditTask={dash.handleTriggerEditTask}
                                        onDeleteTask={dash.handleDeleteTask}
                                        onAddSubtask={dash.handleAddSubtask}
                                        onToggleSubtask={dash.handleToggleSubtask}
                                        onEditSubtask={dash.handleEditSubtask}
                                        onDeleteSubtask={dash.handleDeleteSubtask}
                                    />
                                ))
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
