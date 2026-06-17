import { motion, AnimatePresence } from "motion/react";
import { Sidebar } from "../Sidebar";
import { Organization } from "../../types";

interface MobileSidebarProps {
    isOpen: boolean;
    organizations: Organization[];
    activeOrgId: string | null;
    onClose: () => void;
    onSelectOrg: (id: string) => void;
    onCreateOrg: () => void;
    onRenameOrg: (id: string, name: string) => void;
    onDeleteOrg: (id: string) => void;
    onLogout: () => void;
}

export function MobileSidebar({
    isOpen, organizations, activeOrgId, onClose,
    onSelectOrg, onCreateOrg, onRenameOrg, onDeleteOrg, onLogout,
}: MobileSidebarProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-[2px]"
                    />
                    <motion.div
                        initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="fixed inset-y-0 left-0 w-72 h-full z-50 md:hidden shadow-2xl flex"
                    >
                        <Sidebar
                            organizations={organizations}
                            activeOrgId={activeOrgId}
                            onSelectOrg={(id) => { onSelectOrg(id); onClose(); }}
                            onCreateOrg={() => { onCreateOrg(); onClose(); }}
                            onRenameOrg={(id, name) => { onRenameOrg(id, name); onClose(); }}
                            onDeleteOrg={(id) => { onDeleteOrg(id); onClose(); }}
                            onLogout={onLogout}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
