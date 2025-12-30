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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hôm nay";
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="space-y-4">
      {/* Chapter List */}
      <div className="divide-y border rounded-lg">
        {currentChapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`/truyen/${novelSlug}/chuong-${chapter.chapter_number}`}
            className={`
              block p-4 hover:bg-accent transition-colors
              ${currentChapterId === chapter.id ? "bg-accent" : ""}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-muted-foreground">
                    Chương {chapter.chapter_number}
                  </span>
                  {currentChapterId === chapter.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                      Đang đọc
                    </span>
                  )}
                </div>
                <h4 className="font-medium hover:text-primary transition-colors line-clamp-2">
                  {chapter.title}
                </h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{formatDate(chapter.published_at)}</span>
                  <span>•</span>
                  <span>{formatViews(chapter.view_count)} lượt xem</span>
                  {chapter.word_count > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {chapter.word_count.toLocaleString("vi-VN")} từ
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
          >
            Trang trước
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Show first, last, current, and adjacent pages
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, idx, arr) => {
                // Add ellipsis
                if (idx > 0 && page - arr[idx - 1] > 1) {
                  return (
                    <span key={`ellipsis-${page}`} className="px-2">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`
                      px-3 py-2 rounded border min-w-[40px]
                      ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }
                    `}
                  >
                    {page}
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Summary */}
      <p className="text-sm text-center text-muted-foreground">
        Hiển thị {startIndex + 1}-{Math.min(endIndex, chapters.length)} trong{" "}
        {chapters.length} chương
      </p>
    </div>
  );
}
