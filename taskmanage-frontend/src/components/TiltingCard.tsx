/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { motion } from "motion/react";

interface TiltingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number; // Maximum tilt rotation degrees
  className?: string;
}

export function TiltingCard({
  children,
  maxTilt = 5,
  className = "",
  ...props
}: TiltingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [strokeAngle, setStrokeAngle] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Position of hover cursor relative to card bounds
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Map relative positions onto a scale of [-0.5, 0.5]
    const xPct = x / width - 0.5;
    const yPct = y / height - 0.5;

    // Rotate coordinates (X-tilt is driven by Y-mouse, Y-tilt is driven by X-mouse)
    const tiltX = -yPct * maxTilt;
    const tiltY = xPct * maxTilt;

    setRotation({ x: tiltX, y: tiltY });
    setMousePos({ x, y });

    // Calculate angle in degrees relative to card center for stroke-following gradient
    const angle =
      Math.atan2(y - height / 2, x - width / 2) * (180 / Math.PI) + 90;
    setStrokeAngle(angle);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`stroke-follow-card bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ease-out ${
        isHovered ? "shadow-md -translate-y-1 scale-[1.01]" : ""
      } ${className}`}
      style={
        {
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          transformStyle: "preserve-3d",
          // Pass local CSS variables to power radial shine and continuous borders
          ["--mouse-x" as any]: `${mousePos.x}px`,
          ["--mouse-y" as any]: `${mousePos.y}px`,
          ["--stroke-angle" as any]: `${strokeAngle}deg`,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Dynamic light reflection layer */}
      <div
        className="absolute inset-0 shine-overlay transition-opacity duration-300 pointer-events-none z-10"
        style={{ opacity: isHovered ? 1 : 0 }}
      />

      {/* Content wrapper with slight parallax scale */}
      <div className="relative z-20 h-full w-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
