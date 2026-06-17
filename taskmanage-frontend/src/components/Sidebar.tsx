/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Folder, Plus, Trash2, Edit3, Layers, LogOut } from "lucide-react";
import { Organization } from "../types";
import { motion } from "motion/react";

interface SidebarProps {
  organizations: Organization[];
  activeOrgId: string | null;
  onSelectOrg: (id: string) => void;
  onCreateOrg: () => void;
  onRenameOrg: (id: string, name: string) => void;
  onDeleteOrg: (id: string) => void;
  onLogout: () => void;
}

export function Sidebar({
  organizations,
  activeOrgId,
  onSelectOrg,
  onCreateOrg,
  onRenameOrg,
  onDeleteOrg,
  onLogout,
}: SidebarProps) {
  const [hoveredOrgId, setHoveredOrgId] = useState<string | null>(null);

  // Calculate upcoming (incomplete) tasks for each organization
  const getUpcomingCount = (org: Organization) => {
    return org.tasks.filter((t) => !t.completed).length;
  };

  return (
    <div className="w-72 border-r border-slate-200 bg-white flex flex-col h-full relative z-30 font-sans">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div className="group relative">
          {/* Flipper text: App Title taskManage */}
          <div className="flipper-container cursor-default">
            <div className="flipper-list group-hover:-translate-y-1/2">
              <span className="block h-[1.5em] font-display text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-800 bg-clip-text text-transparent uppercase">
                taskManage
              </span>
              <span className="block h-[1.5em] font-display text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent uppercase">
                Productive
              </span>
            </div>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1">
            v2.0.0 // User testing
          </p>
        </div>

        {/* Global Create Org Trigger */}
        <button
          id="sidebar-create-org-btn"
          onClick={onCreateOrg}
          title="Create Workspace"
          className="cursor-pointer h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all hover:scale-105 active:scale-95 duration-200 focus:outline-none"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Directory Title */}
      <div className="px-6 py-4 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          Workspaces
        </span>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
          {organizations.length} Active
        </span>
      </div>

      {/* Organization Navigator list */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
        {organizations.length === 0 ? (
          <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <span className="block text-xs text-slate-400 font-sans">
              No active workspaces found
            </span>
            <button
              id="empty-sidebar-create-btn"
              onClick={onCreateOrg}
              className="mt-3 text-xs font-semibold text-slate-900 hover:text-slate-700 cursor-pointer"
            >
              + Create your first
            </button>
          </div>
        ) : (
          organizations.map((org, index) => {
            const isActive = org.id === activeOrgId;
            const upcoming = getUpcomingCount(org);

            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={org.id}
                onMouseEnter={() => setHoveredOrgId(org.id)}
                onMouseLeave={() => setHoveredOrgId(null)}
                className={`group/item relative rounded-xl flex items-center justify-between p-3 cursor-pointer select-none transition-all duration-300 ${isActive
                  ? "bg-slate-100 border-l-2 border-slate-900 shadow-sm"
                  : "hover:bg-slate-50 border-l-2 border-transparent"
                  }`}
                onClick={() => onSelectOrg(org.id)}
              >
                {/* Organ Name details */}
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <Folder
                    className={`h-4 w-4 shrink-0 transition-all ${isActive ? "text-slate-900" : "text-slate-400 group-hover/item:text-slate-600"
                      }`}
                  />
                  <span
                    className={`text-sm truncate font-medium transition-colors ${isActive ? "text-slate-900 font-semibold" : "text-slate-600 group-hover/item:text-slate-800"
                      }`}
                  >
                    {org.name}
                  </span>
                </div>

                {/* Right side status / Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Inline Action Nodes configured on Hover */}
                  <div
                    className={`flex items-center gap-0.5 transition-opacity duration-200 ${hoveredOrgId === org.id ? "opacity-100" : "opacity-0 pointer-events-none md:absolute md:right-3 md:group-hover/item:opacity-100 md:group-hover/item:pointer-events-auto"
                      }`}
                    onClick={(e) => e.stopPropagation()} // Stop triggering selection on action click
                  >
                    <button
                      id={`rename-org-btn-${org.id}`}
                      onClick={() => onRenameOrg(org.id, org.name)}
                      title="Rename Workspace"
                      className="cursor-pointer p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      id={`delete-org-btn-${org.id}`}
                      onClick={() => onDeleteOrg(org.id)}
                      title="Delete Workspace"
                      className="cursor-pointer p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Upcoming incomplete count pill (hidden when hover actions appear for sleek neatness) */}
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-all border ${hoveredOrgId === org.id
                      ? "md:opacity-0 md:scale-75"
                      : "opacity-100 scale-100"
                      } ${upcoming > 0
                        ? isActive
                          ? "bg-white border-slate-200 text-slate-800"
                          : "bg-slate-200 border-transparent text-slate-600"
                        : "bg-transparent border-transparent text-slate-300"
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
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 font-mono space-y-1">
        <div className="flex justify-between">
          <span>Total Tasks:</span>
          <span className="text-slate-700">
            {organizations.reduce((sum, o) => sum + o.tasks.length, 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Total Incomplete:</span>
          <span className="text-indigo-600 font-semibold">
            {organizations.reduce((sum, o) => sum + o.tasks.filter(t => !t.completed).length, 0)}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="cursor-pointer w-full mt-2 flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors pt-2 border-t border-slate-100"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
