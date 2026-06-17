/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hasHover, setHasHover] = useState(false);

  // Motion values to bypass React's standard slow state refresh cycles
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Smooth springs to create a "trailing lag" effect
  const springConfig = { damping: 25, stiffness: 220, mass: 0.6 };
  const trailX = useSpring(cursorX, springConfig);
  const trailY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if the device has a real pointer hover capability
    const mediaQuery = window.matchMedia("(hover: hover)");
    setHasHover(mediaQuery.matches);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visible) setVisible(true);
    };

    const handleMouseLeaveWindow = () => {
      setVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setVisible(true);
    };

    if (mediaQuery.matches) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeaveWindow);
      document.body.addEventListener("mouseenter", handleMouseEnterWindow);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.body.removeEventListener("mouseenter", handleMouseEnterWindow);
    };
  }, [visible, cursorX, cursorY]);

  if (!hasHover || !visible) return null;

  return (
    <>
      {/* Precision inner core pointer */}
      <motion.div
        className="fixed w-2.5 h-2.5 bg-slate-900 rounded-full z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      />
      
      {/* Soft outer glow spring trail */}
      <motion.div
        className="fixed w-7 h-7 rounded-full border border-slate-300 bg-slate-500/5 z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          x: trailX,
          y: trailY,
        }}
      />
    </>
  );
}
