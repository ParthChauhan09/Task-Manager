import { useState } from "react";
import { Folder, Plus, Trash2, Edit3, Layers, LogOut, UserCircle2, HelpCircle } from "lucide-react";
import { Organization } from "../types";
import { motion } from "motion/react";
import { AuthUser } from "../api/authApi";

interface SidebarProps {
  user: AuthUser | null;
  organizations: Organization[];
  activeOrgId: string | null;
  onSelectOrg: (id: string) => void;
  onCreateOrg: () => void;
  onRenameOrg: (id: string, name: string) => void;
  onDeleteOrg: (id: string) => void;
  onLogout: () => void;
  onOpenGuide: () => void;
}

export function Sidebar({
  user,
  organizations,
  activeOrgId,
  onSelectOrg,
  onCreateOrg,
  onRenameOrg,
  onDeleteOrg,
  onLogout,
  onOpenGuide,
}: SidebarProps) {
  const [hoveredOrgId, setHoveredOrgId] = useState<string | null>(null);
  const initials = user?.name
    ? user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  // Calculate upcoming (incomplete) tasks for each organization
  const getUpcomingCount = (org: Organization) => {
    return org.tasks.filter((t) => !t.completed).length;
  };

  return (
    <div className="w-72 border-r border-[#E5E5EA] bg-white flex flex-col h-full relative z-30 font-sans select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#E5E5EA]/60 flex justify-between items-center">
        <div>
          <span className="block font-sans text-xl font-bold tracking-tight text-[#1C1C1E]">
            taskManage
          </span>
          <p className="text-[10px] text-[#8E8E93] mt-0.5 font-sans font-medium">
            Workspace Manager
          </p>
        </div>

        {/* Global Create Org Trigger */}
        <button
          id="sidebar-create-org-btn"
          onClick={onCreateOrg}
          title="Create Workspace"
          className="cursor-pointer h-10 w-10 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] transition-all focus:outline-none"
        >
          <Plus className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Directory Title */}
      <div className="px-6 py-4 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8E8E93] flex items-center gap-2 font-sans">
          <Layers className="h-3.5 w-3.5 text-[#8E8E93]" />
          Workspaces
        </span>
        <span className="text-[10px] font-medium text-[#8E8E93] bg-[#F5F5F7] px-2 py-0.5 rounded-full font-sans">
          {organizations.length} Active
        </span>
      </div>

      {/* Organization Navigator list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
        {organizations.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-[#E5E5EA] bg-[#F5F5F7]/50">
            <span className="block text-xs text-[#8E8E93] font-sans">
              No active workspaces found
            </span>
            <button
              id="empty-sidebar-create-btn"
              onClick={onCreateOrg}
              className="mt-2 text-xs font-medium text-[#5856D6] hover:underline cursor-pointer"
            >
              + Create Workspace
            </button>
          </div>
        ) : (
          organizations.map((org, index) => {
            const isActive = org.id === activeOrgId;
            const upcoming = getUpcomingCount(org);

            return (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 220, delay: index * 0.03 }}
                key={org.id}
                onMouseEnter={() => setHoveredOrgId(org.id)}
                onMouseLeave={() => setHoveredOrgId(null)}
                className={`group/item relative rounded-full flex items-center justify-between px-4 h-9 cursor-pointer transition-all ${isActive
                  ? "bg-[#5856D6] text-white shadow-sm shadow-[#5856D6]/15"
                  : "hover:bg-[#E5E5EA]/50 text-[#1C1C1E]"
                  }`}
                onClick={() => onSelectOrg(org.id)}
              >
                {/* Organ Name details */}
                <div className="flex items-center gap-2.5 overflow-hidden pr-12 flex-1">
                  <Folder
                    className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-[#8E8E93] group-hover/item:text-[#1C1C1E]"
                      }`}
                  />
                  <span
                    className={`text-[13px] truncate font-sans font-medium transition-colors ${isActive ? "text-white font-medium" : "text-[#1C1C1E]/80 group-hover/item:text-[#1C1C1E]"
                      }`}
                  >
                    {org.name}
                  </span>
                </div>

                {/* Right side status / Actions */}
                <div className="relative flex items-center justify-end shrink-0 min-w-[24px]">
                  {/* Inline Action Nodes configured on Hover */}
                  <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-0.5 transition-all duration-200 ${
                      hoveredOrgId === org.id
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-90 pointer-events-none"
                    }`}
                    onClick={(e) => e.stopPropagation()} // Stop triggering selection on action click
                  >
                    <button
                      id={`rename-org-btn-${org.id}`}
                      onClick={() => onRenameOrg(org.id, org.name)}
                      title="Rename Workspace"
                      className={`cursor-pointer p-1 rounded-full hover:bg-white/20 transition-colors ${isActive ? "text-white/80 hover:text-white" : "text-[#8E8E93] hover:text-[#1C1C1E]"}`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`delete-org-btn-${org.id}`}
                      onClick={() => onDeleteOrg(org.id)}
                      title="Delete Workspace"
                      className={`cursor-pointer p-1 rounded-full hover:bg-white/20 transition-colors ${isActive ? "text-white/80 hover:text-red-200" : "text-[#8E8E93] hover:text-[#FF3B30]"}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Upcoming incomplete count pill (hidden when hover actions appear for sleek neatness) */}
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full transition-all duration-200 ${
                      hoveredOrgId === org.id
                        ? "opacity-0 scale-75 pointer-events-none"
                        : "opacity-100 scale-100"
                    } ${upcoming > 0
                        ? isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#E5E5EA] text-[#8E8E93]"
                        : "bg-transparent text-transparent select-none"
                      }`}
                  >
                    {upcoming}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer — stats + logout */}
      <div className="p-4 border-t border-[#E5E5EA]/60 bg-[#F5F5F7]/30 space-y-1.5 font-sans">
        <div className="flex items-center gap-3 rounded-2xl border border-[#E5E5EA]/60 bg-white/50 px-3.5 py-2.5 mb-3 font-sans">
          <span className="h-9 w-9 rounded-full bg-[#5856D6] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#5856D6]/15">
            <UserCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-[#1C1C1E] truncate">
              {user?.name || "User Profile"}
            </p>
            <p className="text-[10px] text-[#8E8E93] truncate">
              {user?.email || "Account settings"}
            </p>
          </div>
          <span className="h-7 w-7 rounded-full bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center text-[10px] font-bold">
            {initials}
          </span>
        </div>
        <div className="flex justify-between px-1 text-xs text-[#8E8E93] font-sans">
          <span>Total Tasks:</span>
          <span className="text-[#1C1C1E] font-semibold">
            {organizations.reduce((sum, o) => sum + o.tasks.length, 0)}
          </span>
        </div>
        <div className="flex justify-between px-1 text-xs text-[#8E8E93] font-sans">
          <span>Incomplete:</span>
          <span className="text-[#5856D6] font-semibold">
            {organizations.reduce((sum, o) => sum + o.tasks.filter(t => !t.completed).length, 0)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#E5E5EA]/60 font-sans">
          <button
            onClick={onOpenGuide}
            className="cursor-pointer flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#5856D6] transition-colors font-medium"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Guide</span>
          </button>
          <button
            onClick={onLogout}
            className="cursor-pointer flex items-center gap-1.5 text-xs text-[#8E8E93] hover:text-[#FF3B30] transition-colors font-medium"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
