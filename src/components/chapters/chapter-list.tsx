"use client";

import { useState } from "react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  slug: string;
  chapter_number: number;
  published_at: string;
  view_count: number;
  word_count: number;
}

interface ChapterListProps {
  novelSlug: string;
  chapters: Chapter[];
  currentChapterId?: string;
  itemsPerPage?: number;
}

export function ChapterList({
  novelSlug,
  chapters,
  currentChapterId,
  itemsPerPage = 50,
}: ChapterListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(chapters.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChapters = chapters.slice(startIndex, endIndex);

  // Generate page ranges for pagination
  const pageRanges = Array.from({ length: totalPages }, (_, i) => {
    const start = i * itemsPerPage + 1;
    const end = Math.min((i + 1) * itemsPerPage, chapters.length);
    return { page: i + 1, label: `${start} - ${end}` };
  });

  return (
    <div className="space-y-4">
      {/* Title with pagination info */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium">Đang ra</span>
        <span>Tổng {chapters.length} chương</span>
      </div>

      {/* Pagination Buttons */}
      <div className="flex flex-wrap gap-2">
        {pageRanges.map(({ page, label }) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`
              px-4 py-1.5 rounded-full text-sm border transition-colors cursor-pointer
              ${
                currentPage === page
                  ? "bg-yellow-400 border-yellow-400 text-gray-900"
                  : "border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary"
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chapter Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {currentChapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/truyen/${novelSlug}/chuong-${chapter.chapter_number}`}
            className={`
              p-3 rounded border text-sm hover:border-primary hover:text-primary transition-colors cursor-pointer
              ${
                currentChapterId === chapter.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700"
              }
            `}
          >
            <div className="font-medium truncate">
              {chapter.chapter_number}.{chapter.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
