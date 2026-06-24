import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 hover:scale-105`}
    >
      {/* White rounded square container with dark border */}
      <rect
        x="3.5"
        y="3.5"
        width="93"
        height="93"
        rx="24"
        fill="#FFFFFF"
        stroke="#1C1C1E"
        strokeWidth="5"
      />
      {/* Top list line (dark charcoal) */}
      <rect
        x="20"
        y="26"
        width="44"
        height="8"
        rx="4"
        fill="#1C1C1E"
      />
      {/* The themed dot/mark to the right of the first line */}
      <circle
        cx="78"
        cy="30"
        r="5.5"
        fill="var(--theme-primary)"
        className="transition-colors duration-300"
      />
      {/* Middle list line (medium dark gray) */}
      <rect
        x="20"
        y="46"
        width="34"
        height="8"
        rx="4"
        fill="#636366"
      />
      {/* Bottom list line (medium light gray) */}
      <rect
        x="20"
        y="66"
        width="26"
        height="8"
        rx="4"
        fill="#AEAEB2"
      />
    </svg>
  );
};
