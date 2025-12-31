"use client";

import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

const STORAGE_KEY = "category_view_mode";

function getDefaultViewMode(): ViewMode {
  // Default to list on desktop, grid on mobile
  if (typeof window !== "undefined") {
    return window.innerWidth >= 768 ? "list" : "grid";
  }
  return "list";
}

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>(getDefaultViewMode);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
    setIsReady(true);

    // Listen to storage events for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "grid" || e.newValue === "list")) {
        setViewMode(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    // Dispatch custom event for same-tab sync
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: mode,
      })
    );
  };

  return { viewMode, setViewMode: setMode, isReady };
}
