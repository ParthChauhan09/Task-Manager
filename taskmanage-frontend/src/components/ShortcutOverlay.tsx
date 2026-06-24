import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface Shortcut {
  keyStr: string; // e.g. "1", "2", "3", "f"
  label: string;
  action: () => void;
  displayKey?: string; // e.g. "←", "→", "F"
}

interface ShortcutOverlayProps {
  shortcuts: Shortcut[];
}

export function ShortcutOverlay({ shortcuts }: ShortcutOverlayProps) {
  const [isCtrlHeld, setIsCtrlHeld] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in inputs/editable fields
      const activeEl = document.activeElement;
      const isTyping =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl && activeEl.getAttribute("contenteditable") === "true");

      // We still want to handle releasing Ctrl even if typing
      if (e.key === "Control") {
        setIsCtrlHeld(true);
      }

      if (isTyping) return;

      // Check if Ctrl is held and one of the shortcut keys is pressed
      if (e.ctrlKey) {
        const matchingShortcut = shortcuts.find(
          (s) => s.keyStr.toLowerCase() === e.key.toLowerCase()
        );
        if (matchingShortcut) {
          e.preventDefault();
          matchingShortcut.action();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        setIsCtrlHeld(false);
      }
    };

    // Reset state when window loses focus to prevent stuck overlay state
    const handleBlur = () => {
      setIsCtrlHeld(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [shortcuts]);

  return (
    <AnimatePresence>
      {isCtrlHeld && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/10 rounded-[20px] px-5 py-4 shadow-2xl flex flex-col items-center gap-3 w-80 text-white select-none pointer-events-none"
        >
          <div className="text-[10px] font-bold tracking-wider text-[#8E8E93] uppercase font-sans">
            Keyboard Shortcuts (Hold ⌃)
          </div>
          <div className="w-full flex flex-col gap-2 mt-1 font-sans">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.keyStr}
                className="flex items-center justify-between w-full text-xs font-medium py-0.5"
              >
                <span className="text-white/80">{shortcut.label}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono shadow-sm text-white/90">
                    ⌃ Ctrl
                  </kbd>
                  <span className="text-white/30 text-[9px] font-sans">+</span>
                  <kbd className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[9px] font-mono shadow-sm text-white/90 uppercase">
                    {shortcut.displayKey || shortcut.keyStr}
                  </kbd>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
