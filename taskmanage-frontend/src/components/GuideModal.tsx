import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Layers, Calendar, Keyboard, Sparkles, ChevronRight, ChevronLeft, HelpCircle } from "lucide-react";
import { Logo } from "./Logo";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const steps = [
    {
      title: "Welcome to ListMark",
      icon: <Logo size={28} />,
      content: (
        <div className="space-y-3 text-center">
          <p className="text-sm text-[#8E8E93] leading-relaxed">
            A minimal, fluid task and workspace manager designed with the aesthetic and simplicity of Apple system utilities.
          </p>
          <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA]/50 text-xs text-[#1C1C1E] font-medium inline-block mt-2">
            Press & hold <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5EA] rounded shadow-sm font-mono text-[10px] mx-1">Ctrl</kbd> at any time to see available shortcuts.
          </div>
        </div>
      ),
    },
    {
      title: "Organize with Workspaces",
      icon: <Layers className="h-7 w-7 text-apple-purple" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#8E8E93] leading-relaxed text-center">
            Workspaces help you group tasks by projects or departments (e.g. personal, business).
          </p>
          <ul className="text-xs text-[#1C1C1E]/80 space-y-2 max-w-xs mx-auto">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-apple-purple">•</span>
              <span>Create new workspaces using the <strong>+</strong> icon in the sidebar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-apple-purple">•</span>
              <span>Rename or delete workspaces by hovering and clicking the edit options.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Plan by Dates",
      icon: <Calendar className="h-7 w-7 text-apple-purple" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-[#8E8E93] leading-relaxed text-center">
            Tasks are scheduled under specific dates, letting you focus on your agenda day by day.
          </p>
          <ul className="text-xs text-[#1C1C1E]/80 space-y-2 max-w-xs mx-auto">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-apple-purple">•</span>
              <span>Click <strong>Add Date</strong> in the top bar to group tasks under a calendar day.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-apple-purple">•</span>
              <span>Click any date capsule to view, check, and edit tasks scheduled for that day.</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Fluid Shortcuts HUD",
      icon: <Keyboard className="h-7 w-7 text-apple-purple" />,
      content: (
        <div className="space-y-3 text-center">
          <p className="text-sm text-[#8E8E93] leading-relaxed">
            Navigate the entire app using keyboard shortcuts. Hold `Ctrl` to open the overlay.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-left max-w-xs mx-auto mt-2 font-mono">
            <div className="bg-[#F5F5F7] px-2.5 py-1.5 rounded-xl border border-[#E5E5EA]/40">
              <span className="text-[#8E8E93]">Ctrl + M:</span> <span className="font-sans font-medium text-[#1C1C1E]">Make Workspace</span>
            </div>
            <div className="bg-[#F5F5F7] px-2.5 py-1.5 rounded-xl border border-[#E5E5EA]/40">
              <span className="text-[#8E8E93]">Ctrl + P:</span> <span className="font-sans font-medium text-[#1C1C1E]">Plan Task</span>
            </div>
            <div className="bg-[#F5F5F7] px-2.5 py-1.5 rounded-xl border border-[#E5E5EA]/40">
              <span className="text-[#8E8E93]">Ctrl + S:</span> <span className="font-sans font-medium text-[#1C1C1E]">Switch Workspace</span>
            </div>
            <div className="bg-[#F5F5F7] px-2.5 py-1.5 rounded-xl border border-[#E5E5EA]/40">
              <span className="text-[#8E8E93]">Ctrl + ← / →:</span> <span className="font-sans font-medium text-[#1C1C1E]">Navigate Dates</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/15 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white border border-[#E5E5EA] shadow-2xl rounded-[28px] w-full max-w-md p-6 overflow-hidden flex flex-col items-center select-none"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 h-7 w-7 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>

            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="mt-6 mb-4 h-14 w-14 bg-apple-purple/10 rounded-full flex items-center justify-center shrink-0"
            >
              {steps[currentStep].icon}
            </motion.div>

            <h3 className="font-sans text-lg font-bold text-[#1C1C1E] tracking-tight mb-1">
              {steps[currentStep].title}
            </h3>

            <div className="w-full min-h-[160px] flex items-center justify-center px-2 py-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full animate-checkbox-pop"
              >
                {steps[currentStep].content}
              </motion.div>
            </div>

            <div className="flex items-center gap-1.5 my-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? "w-4 bg-apple-purple" : "w-1.5 bg-[#E5E5EA]"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between w-full mt-2 pt-4 border-t border-[#E5E5EA]/60">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                  currentStep === 0
                    ? "text-[#E5E5EA] cursor-not-allowed"
                    : "text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
                }`}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <button
                onClick={handleNext}
                className="cursor-pointer h-9 px-5 bg-apple-purple hover:bg-apple-purple-hover text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm shadow-apple-purple/15 transition-colors"
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                {currentStep !== steps.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
