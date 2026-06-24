import React, { createContext, useContext, useState, useEffect } from "react";

export type AccentTheme = "purple" | "blue" | "green" | "red" | "orange" | "pink" | "graphite";

interface ThemeContextType {
  theme: AccentTheme;
  setTheme: (theme: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themesInfo: Record<AccentTheme, { name: string; primary: string; hover: string; secondary: string; secondaryHover: string; glow: string }> = {
  purple: {
    name: "Purple",
    primary: "#5856D6",
    hover: "#4846B6",
    secondary: "#4F46E5",
    secondaryHover: "#4338CA",
    glow: "rgba(88, 86, 214, 0.2)",
  },
  blue: {
    name: "Blue",
    primary: "#007AFF",
    hover: "#0062CC",
    secondary: "#0A84FF",
    secondaryHover: "#0072E3",
    glow: "rgba(0, 122, 255, 0.2)",
  },
  green: {
    name: "Green",
    primary: "#34C759",
    hover: "#289E47",
    secondary: "#30D158",
    secondaryHover: "#24C04C",
    glow: "rgba(52, 199, 89, 0.2)",
  },
  red: {
    name: "Red",
    primary: "#FF3B30",
    hover: "#D9261C",
    secondary: "#FF453A",
    secondaryHover: "#E0372F",
    glow: "rgba(255, 59, 48, 0.2)",
  },
  orange: {
    name: "Orange",
    primary: "#FF9500",
    hover: "#D67D00",
    secondary: "#FF9F0A",
    secondaryHover: "#E08C00",
    glow: "rgba(255, 149, 0, 0.2)",
  },
  pink: {
    name: "Pink",
    primary: "#FF2D55",
    hover: "#D61F43",
    secondary: "#FF375F",
    secondaryHover: "#D6294D",
    glow: "rgba(255, 45, 85, 0.2)",
  },
  graphite: {
    name: "Graphite",
    primary: "#8E8E93",
    hover: "#6E6E73",
    secondary: "#A2A2A7",
    secondaryHover: "#85858A",
    glow: "rgba(142, 142, 147, 0.2)",
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AccentTheme>(() => {
    const saved = localStorage.getItem("app-theme");
    return (saved as AccentTheme) || "purple";
  });

  useEffect(() => {
    localStorage.setItem("app-theme", theme);
    const root = document.documentElement;
    const currentTheme = themesInfo[theme] || themesInfo.purple;
    root.style.setProperty("--theme-primary", currentTheme.primary);
    root.style.setProperty("--theme-primary-hover", currentTheme.hover);
    root.style.setProperty("--theme-secondary", currentTheme.secondary);
    root.style.setProperty("--theme-secondary-hover", currentTheme.secondaryHover);
    root.style.setProperty("--theme-glow", currentTheme.glow);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}
