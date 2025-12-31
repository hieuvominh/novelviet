"use client";

import { useState, useRef, useEffect } from "react";
import {
  useReadingTheme,
  ReadingTheme,
  READING_THEMES,
} from "@/hooks/use-reading-theme";

export function ReadingThemeSelector() {
  const { currentTheme, setTheme } = useReadingTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleThemeSelect = (theme: ReadingTheme) => {
    setTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Chủ đề đọc sách"
        aria-expanded={isOpen}
      >
        {/* Palette Icon */}
        <svg
          className="w-5 h-5 text-gray-700 dark:text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>

      {/* Theme Selection Panel */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 px-3 min-w-50 z-50">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
            Chủ đề đọc sách
          </div>

          <div className="space-y-1">
            {Object.values(READING_THEMES).map((theme) => {
              const isActive = currentTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  aria-label={`${theme.name}${isActive ? " (đang chọn)" : ""}`}
                >
                  {/* Color Swatch */}
                  <div
                    className={`w-6 h-6 rounded-md border-2 transition-all ${
                      isActive
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    style={{ backgroundColor: theme.displayColor }}
                  />

                  {/* Theme Name */}
                  <span
                    className={`text-sm ${
                      isActive
                        ? "font-semibold text-primary"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {theme.name}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <svg
                      className="w-4 h-4 ml-auto text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
