"use client";

import { NovelCard } from "@/components/novels/novel-card";
import { NovelListItem } from "@/components/novels/novel-list-item";
import { ViewToggle } from "@/components/category/view-toggle";
import { CategorySkeleton } from "@/components/category/category-skeleton";
import { CategoryListSkeleton } from "@/components/category/category-list-skeleton";
import { useViewMode } from "@/hooks/use-view-mode";

interface CategoryContentProps {
  novels: Array<{
    id: string;
    title: string;
    slug: string;
    description?: string;
    cover_url?: string;
    status: "ongoing" | "completed";
    total_chapters: number;
    view_count_total: number;
    rating_average?: number;
    rating_count?: number;
    author: {
      name: string;
      slug: string;
    };
  }>;
  categoryName: string;
}

export function CategoryContent({
  novels,
  categoryName,
}: CategoryContentProps) {
  const { viewMode, setViewMode, isReady } = useViewMode();

  // Show loading skeleton while initializing
  if (!isReady) {
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Danh sách truyện {categoryName}
          </h2>
          <div className="w-40 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <CategorySkeleton />
      </>
    );
  }

  return (
    <>
      {/* Section Header with View Toggle */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Danh sách truyện {categoryName}
        </h2>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Content - Grid or List */}
      <div
        style={{
          animation: "fadeSlideIn 0.3s ease-out",
        }}
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {novels.map((novel) => (
              <NovelListItem key={novel.id} novel={novel} />
            ))}
          </div>
        )}
      </div>

      {/* Add CSS for animations */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
}
