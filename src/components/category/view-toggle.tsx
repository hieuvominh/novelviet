"use client";

import { useEffect, useState } from "react";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1"
      role="group"
      aria-label="Chế độ xem"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${
            value === "grid"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }
        `}
        aria-label="Xem dạng lưới"
        title="Xem dạng lưới"
        aria-pressed={value === "grid"}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
        <span className="hidden sm:inline">Lưới</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          ${
            value === "list"
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }
        `}
        aria-label="Xem dạng danh sách"
        title="Xem dạng danh sách"
        aria-pressed={value === "list"}
      >
        <svg
          className="w-4 h-4"
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
        <span className="hidden sm:inline">Danh sách</span>
      </button>
    </div>
  );
}
