/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Organization } from "../types";
import { getTodayDateString, formatDateISO } from "../utils/dateHelpers";

const STORAGE_KEY = "ListMark-data";

function getInitialData(): Organization[] {
  const today = getTodayDateString();

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDateISO(tomorrowDate);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  const future = formatDateISO(futureDate);

  return [
    {
      id: "org-launch-prep",
      name: "🚀 Launch pad",
      tasks: [
        {
          id: "task-domain",
          title: "Configure Custom Domain Path",
          description: "Update DNS CAA and AAAA records on host registrar to align with CDN routing constraints.",
          date: today,
          priority: "high",
          completed: true,
          createdAt: new Date().toISOString(),
          subtasks: [
            { id: "sub-1-1", title: "Acquire CAA configuration values", completed: true },
            { id: "sub-1-2", title: "Propagate changes globally", completed: true }
          ]
        },
        {
          id: "task-frontend",
          title: "Optimize Production Assets",
          description: "Perform code-splitting audit, minify resources, and assert image assets compress properly.",
          date: today,
          priority: "medium",
          completed: false,
          createdAt: new Date().toISOString(),
          subtasks: [
            { id: "sub-2-1", title: "Analyze Webpack/Vite visualizer output", completed: true },
            { id: "sub-2-2", title: "Enable gzip / brotli compression rules", completed: false },
            { id: "sub-2-3", title: "Verify dynamic imports work cleanly", completed: false }
          ]
        },
        {
          id: "task-analytics",
          title: "Configure Privacy-Safe Analytics",
          description: "Deploy aggregated reporting metrics without invoking third-party tracker scripts.",
          date: tomorrow,
          priority: "low",
          completed: false,
          createdAt: new Date().toISOString(),
          subtasks: [
            { id: "sub-3-1", title: "Integrate privacy-first tracking snippets", completed: false }
          ]
        }
      ]
    },
    {
      id: "org-personal",
      name: "⚡ Side Hustle",
      tasks: [
        {
          id: "task-wireframe",
          title: "Complete Landing Page Mockups",
          description: "Wireframe layout variants concentrating on bold displays and immersive user feedback loops.",
          date: today,
          priority: "high",
          completed: false,
          createdAt: new Date().toISOString(),
          subtasks: [
            { id: "sub-4-1", title: "Sketch responsive mobile states", completed: true },
            { id: "sub-4-2", title: "Select typography scale matching Outfit font", completed: false }
          ]
        },
        {
          id: "task-gym",
          title: "Evening High Intensity Exercise",
          description: "Complete daily routine targeting strength resilience.",
          date: future,
          priority: "low",
          completed: false,
          createdAt: new Date().toISOString(),
          subtasks: []
        }
      ]
    }
  ];
}

export function useLocalStorage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOrganizations(JSON.parse(stored));
      } else {
        const initial = getInitialData();
        setOrganizations(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch (e) {
      console.error("Failed to parse ListMark values from localStorage, resetting", e);
      const initial = getInitialData();
      setOrganizations(initial);
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever state changes
  const saveOrganizations = (updated: Organization[]) => {
    setOrganizations(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save ListMark values to localStorage", e);
    }
  };

  return {
    organizations,
    setOrganizations: saveOrganizations,
    isHydrated
  };
}
