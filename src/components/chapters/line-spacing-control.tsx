"use client";

import { useState, useRef, useEffect } from "react";
import {
  useReadingTypography,
  LineHeight,
  LINE_HEIGHT_OPTIONS,
} from "@/hooks/use-reading-typography";

export function LineSpacingControl() {
  const { lineHeight, setLineHeight } = useReadingTypography();
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

  const handleLineHeightSelect = (value: LineHeight) => {
    setLineHeight(value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Line Spacing Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Giãn dòng"
        aria-expanded={isOpen}
      >
        {/* Line Spacing Icon */}
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Line Spacing Selection Panel */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-3 px-3 min-w-50 z-50">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">
            Giãn dòng: {lineHeight}x
          </div>

          <div className="space-y-2">
            {LINE_HEIGHT_OPTIONS.map((option) => {
              const isActive = lineHeight === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleLineHeightSelect(option.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary/10 dark:bg-primary/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  aria-label={`${option.name} (${option.label})${
                    isActive ? " - đang chọn" : ""
                  }`}
                >
                  {/* Option Name */}
                  <span
                    className={`text-sm ${
                      isActive
                        ? "font-semibold text-primary"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.name}
                  </span>

                  {/* Label */}
                  <span
                    className={`text-xs ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {option.label}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <svg
                      className="w-4 h-4 ml-2 text-primary"
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
