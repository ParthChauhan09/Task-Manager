import { Sparkles, LogOut, Menu } from "lucide-react";

interface WorkspaceWelcomeProps {
    onCreateOrg: () => void;
    onLogout: () => void;
    onOpenMobileSidebar: () => void;
}

export function WorkspaceWelcome({ onCreateOrg, onLogout, onOpenMobileSidebar }: WorkspaceWelcomeProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50/55 relative">
            <button
                id="mobile-hamburger-empty-btn"
                onClick={onOpenMobileSidebar}
                className="absolute top-6 left-6 cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 focus:outline-none transition-colors"
            >
                <Menu className="h-5 w-5" />
            </button>
            <Sparkles className="h-12 w-12 text-slate-800 mb-4 animate-pulse" />
            <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 tracking-tight uppercase">
                Start taskManage
            </h2>
            <p className="max-w-md text-xs text-slate-500 font-sans mt-3 leading-relaxed">
                Create a workspace to start planning tasks and tracking deadlines.
            </p>
            <button
                id="global-create-workspace-btn"
                onClick={onCreateOrg}
                className="cursor-pointer mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
                + Create Workspace
            </button>
            <button
                onClick={onLogout}
                className="cursor-pointer mt-3 text-xs text-slate-400 hover:text-red-500 flex items-center gap-1.5 transition-colors"
            >
                <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
        </div>
    );
}
