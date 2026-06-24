import { Check, LogOut, Menu } from "lucide-react";

interface WorkspaceWelcomeProps {
    onCreateOrg: () => void;
    onLogout: () => void;
    onOpenMobileSidebar: () => void;
}

export function WorkspaceWelcome({ onCreateOrg, onLogout, onOpenMobileSidebar }: WorkspaceWelcomeProps) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#F5F5F7]/50 relative select-none">
            <button
                id="mobile-hamburger-empty-btn"
                onClick={onOpenMobileSidebar}
                className="absolute top-6 left-6 cursor-pointer md:hidden h-10 w-10 shrink-0 rounded-full border border-[#E5E5EA] bg-white flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#F5F5F7] focus:outline-none transition-colors"
            >
                <Menu className="h-5 w-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-[#5856D6] text-white flex items-center justify-center mb-5 shadow-sm shadow-[#5856D6]/15">
                <Check className="h-6 w-6 stroke-[3.5px]" />
            </div>
            <h2 className="font-display font-semibold text-xl sm:text-2xl text-[#1C1C1E] tracking-tight">
                Start taskManage
            </h2>
            <p className="max-w-md text-xs text-[#8E8E93] font-sans mt-3 leading-relaxed">
                Create a workspace to start planning tasks and tracking deadlines.
            </p>
            <button
                id="global-create-workspace-btn"
                onClick={onCreateOrg}
                className="cursor-pointer mt-6 bg-[#5856D6] hover:bg-[#4846B6] text-white font-medium text-xs px-5 py-3 rounded-full shadow-sm shadow-[#5856D6]/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                + Create Workspace
            </button>
            <button
                onClick={onLogout}
                className="cursor-pointer mt-4.5 text-xs text-[#8E8E93] hover:text-[#FF3B30] flex items-center gap-1.5 transition-colors"
            >
                <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
        </div>
    );
}
