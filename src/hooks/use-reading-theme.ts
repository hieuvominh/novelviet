"use client";

import { useState, useEffect } from "react";

export type ReadingTheme = "light" | "sepia" | "dark" | "night";

export interface ThemeConfig {
  id: ReadingTheme;
  name: string;
  background: string;
  text: string;
  displayColor: string; // For swatch preview
}

export const READING_THEMES: Record<ReadingTheme, ThemeConfig> = {
  light: {
    id: "light",
    name: "Sáng",
    background: "#ffffff",
    text: "#1f2937",
    displayColor: "#ffffff",
  },
  sepia: {
    id: "sepia",
    name: "Vàng cổ điển",
    background: "#f4ecd8",
    text: "#5b4636",
    displayColor: "#f4ecd8",
  },
  dark: {
    id: "dark",
    name: "Tối",
    background: "#0f172a",
    text: "#e2e8f0",
    displayColor: "#0f172a",
  },
  night: {
    id: "night",
    name: "Đêm",
    background: "#000000",
    text: "#cbd5e1",
    displayColor: "#000000",
  },
};

const STORAGE_KEY = "reader-theme";

export function useReadingTheme() {
  // Initialize with default, will be updated from localStorage in useEffect
  const [currentTheme, setCurrentTheme] = useState<ReadingTheme>("light");
  const [isReady, setIsReady] = useState(false);

  // Load theme from localStorage after mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme && savedTheme in READING_THEMES) {
      setCurrentTheme(savedTheme as ReadingTheme);
    }
    setIsReady(true);
  }, []);

  // Persist theme changes to localStorage
  const setTheme = (theme: ReadingTheme) => {
    setCurrentTheme(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, theme);
      // Notify other components
      window.dispatchEvent(new StorageEvent("storage", {
        key: STORAGE_KEY,
        newValue: theme,
        storageArea: localStorage,
      }));
    }
  };

  // Listen for theme changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in READING_THEMES) {
        setCurrentTheme(e.newValue as ReadingTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Get current theme config
  const themeConfig = READING_THEMES[currentTheme];

  return {
    currentTheme,
    themeConfig,
    setTheme,
    allThemes: Object.values(READING_THEMES),
    isReady,
  };
}
