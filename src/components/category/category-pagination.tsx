"use client";

import Link from "next/link";

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function CategoryPagination({
  currentPage,
  totalPages,
  baseUrl,
}: CategoryPaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="flex items-center justify-center gap-2 py-8"
      aria-label="Phân trang"
    >
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <span className="hidden sm:inline">Trang trước</span>
          <span className="sm:hidden">←</span>
        </Link>
      ) : (
        <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed">
          <span className="hidden sm:inline">Trang trước</span>
          <span className="sm:hidden">←</span>
        </div>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500 dark:text-gray-400"
              >
                ...
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Link
              key={pageNumber}
              href={`${baseUrl}?page=${pageNumber}`}
              className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-white font-semibold"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              aria-label={`Trang ${pageNumber}`}
              aria-current={isActive ? "page" : undefined}
            >
              {pageNumber}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <span className="hidden sm:inline">Trang sau</span>
          <span className="sm:hidden">→</span>
        </Link>
      ) : (
        <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed">
          <span className="hidden sm:inline">Trang sau</span>
          <span className="sm:hidden">→</span>
        </div>
      )}
    </nav>
  );
}
