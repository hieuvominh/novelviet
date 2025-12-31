"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChapterNavigationProps {
  novelSlug: string;
  currentChapter: number;
  totalChapters: number;
}

export function ChapterNavigation({
  novelSlug,
  currentChapter,
  totalChapters,
}: ChapterNavigationProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasPrevious = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;

  // Performance optimization: Only render chapters within a range
  // For 1000+ chapters, rendering all options would be heavy
  // Show ±50 chapters around current = max 101 chapters in dropdown
  const CHAPTER_RANGE = 50;
  const startChapter = Math.max(1, currentChapter - CHAPTER_RANGE);
  const endChapter = Math.min(totalChapters, currentChapter + CHAPTER_RANGE);

  const visibleChapters = Array.from(
    { length: endChapter - startChapter + 1 },
    (_, i) => startChapter + i
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDropdownOpen]);

  const handleChapterSelect = (chapterNum: number) => {
    if (chapterNum === currentChapter) {
      setIsDropdownOpen(false);
      return;
    }
    router.push(`/truyen/${novelSlug}/chuong-${chapterNum}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-4 py-8 mb-20 flex-wrap sm:flex-nowrap justify-center">
      {/* Previous Chapter */}
      {hasPrevious ? (
        <Link
          href={`/truyen/${novelSlug}/chuong-${currentChapter - 1}`}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100 font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Chương trước</span>
          <span className="sm:hidden">Trước</span>
        </Link>
      ) : (
        <div className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="hidden sm:inline">Chương trước</span>
          <span className="sm:hidden">Trước</span>
        </div>
      )}

      {/* Chapter Dropdown Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="min-w-[140px] px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-colors font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2"
          aria-label="Chọn chương"
          aria-expanded={isDropdownOpen}
        >
          <span>Chương {currentChapter}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              {/* Quick jump to start/end if not in range */}
              {startChapter > 1 && (
                <>
                  <button
                    onClick={() => handleChapterSelect(1)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <span className="font-medium">Chương 1</span>
                    <span className="text-xs text-gray-500 ml-2">(Đầu)</span>
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                </>
              )}

              {/* Visible chapter range */}
              {visibleChapters.map((chapterNum) => (
                <button
                  key={chapterNum}
                  onClick={() => handleChapterSelect(chapterNum)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    chapterNum === currentChapter
                      ? "bg-primary text-primary-foreground font-bold"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Chương {chapterNum}
                  {chapterNum === currentChapter && (
                    <span className="ml-2 text-xs opacity-80">(Hiện tại)</span>
                  )}
                </button>
              ))}

              {/* Quick jump to end if not in range */}
              {endChapter < totalChapters && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <button
                    onClick={() => handleChapterSelect(totalChapters)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <span className="font-medium">Chương {totalChapters}</span>
                    <span className="text-xs text-gray-500 ml-2">(Cuối)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next Chapter */}
      {hasNext ? (
        <Link
          href={`/truyen/${novelSlug}/chuong-${currentChapter + 1}`}
          className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100 font-medium"
        >
          <span className="hidden sm:inline">Chương sau</span>
          <span className="sm:hidden">Sau</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ) : (
        <div className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50">
          <span className="hidden sm:inline">Chương sau</span>
          <span className="sm:hidden">Sau</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
