"use client";

import { NovelCard } from "@/components/novels/novel-card";

interface Novel {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_url: string | null;
  status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  total_chapters: number;
  view_count_total: number;
  rating_average: number;
  rating_count: number;
  last_chapter_at: string | null;
  author: {
    name: string;
    slug: string;
  };
}

interface SearchResultsProps {
  results: Novel[];
  total: number;
  currentPage: number;
  onLoadMore: () => void;
  loading: boolean;
}

export function SearchResults({
  results,
  total,
  currentPage,
  onLoadMore,
  loading,
}: SearchResultsProps) {
  const itemsPerPage = 20;
  const hasMore = results.length < total;

  if (results.length === 0) {
    return (
      <div className="text-center py-20">
        <svg
          className="mx-auto h-12 w-12 text-brown-light mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-brown mb-2">
          Không tìm thấy kết quả
        </h3>
        <p className="text-brown-light">
          Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {results.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-clay hover:bg-clay/80 text-paper font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang tải...
              </span>
            ) : (
              "Xem thêm"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
