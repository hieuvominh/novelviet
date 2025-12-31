"use client";

import { useEffect, useState } from "react";
import { ReadingThemeSelector } from "./reading-theme-selector";
import { FullscreenToggleButton } from "./fullscreen-toggle-button";
import { LineSpacingControl } from "./line-spacing-control";

interface ChapterControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  isFullscreen: boolean;
  isFullscreenSupported: boolean;
  onToggleFullscreen: () => void;
}

export function ChapterControls({
  fontSize,
  onFontSizeChange,
  isFullscreen,
  isFullscreenSupported,
  onToggleFullscreen,
}: ChapterControlsProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check system preference on mount
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const decreaseFontSize = () => {
    if (fontSize > 14) {
      onFontSizeChange(fontSize - 2);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 28) {
      onFontSizeChange(fontSize + 2);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 py-3">
          {/* Font Size Decrease */}
          <button
            onClick={decreaseFontSize}
            disabled={fontSize <= 14}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Giảm cỡ chữ"
          >
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              A-
            </span>
          </button>

          {/* Current Font Size */}
          <div
            className="text-sm text-gray-500 dark:text-gray-400 min-w-12 text-center"
            suppressHydrationWarning
          >
            {fontSize}px
          </div>

          {/* Font Size Increase */}
          <button
            onClick={increaseFontSize}
            disabled={fontSize >= 28}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Tăng cỡ chữ"
          >
            <span className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              A+
            </span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

          {/* Line Spacing Control */}
          <LineSpacingControl />

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

          {/* Reading Theme Selector */}
          <ReadingThemeSelector />

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Chuyển theme"
          >
            {theme === "light" ? (
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700" />

          {/* Fullscreen Toggle */}
          {isFullscreenSupported && (
            <FullscreenToggleButton
              isFullscreen={isFullscreen}
              isSupported={isFullscreenSupported}
              onToggle={onToggleFullscreen}
            />
          )}

          {/* Bookmark (disabled) */}
          <button
            disabled
            className="flex items-center justify-center w-10 h-10 rounded-full opacity-30 cursor-not-allowed"
            aria-label="Đánh dấu trang"
          >
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
