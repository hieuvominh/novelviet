"use client";

import { useState } from "react";

export type FilterStatus = "all" | "completed" | "ongoing";
export type FilterChapters = "all" | "under100" | "100to500" | "over500";
export type FilterRating = "all" | "4plus" | "45plus";
export type SortOption = "updated" | "views" | "rating" | "newest";

interface CategoryFiltersProps {
  onFilterChange?: (filters: {
    status: FilterStatus;
    chapters: FilterChapters;
    rating: FilterRating;
    sort: SortOption;
  }) => void;
}

export function CategoryFilters({ onFilterChange }: CategoryFiltersProps) {
  const [status, setStatus] = useState<FilterStatus>("all");
  const [chapters, setChapters] = useState<FilterChapters>("all");
  const [rating, setRating] = useState<FilterRating>("all");
  const [sort, setSort] = useState<SortOption>("updated");

  const handleFilterChange = (
    type: "status" | "chapters" | "rating" | "sort",
    value: string
  ) => {
    if (type === "status") setStatus(value as FilterStatus);
    if (type === "chapters") setChapters(value as FilterChapters);
    if (type === "rating") setRating(value as FilterRating);
    if (type === "sort") setSort(value as SortOption);

    // Notify parent (UI only - no actual filtering)
    onFilterChange?.({
      status: type === "status" ? (value as FilterStatus) : status,
      chapters: type === "chapters" ? (value as FilterChapters) : chapters,
      rating: type === "rating" ? (value as FilterRating) : rating,
      sort: type === "sort" ? (value as SortOption) : sort,
    });
  };

  return (
    <div className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Tình trạng:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFilterChange("status", "all")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                    status === "all"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => handleFilterChange("status", "completed")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                    status === "completed"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Hoàn thành
                </button>
                <button
                  onClick={() => handleFilterChange("status", "ongoing")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                    status === "ongoing"
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Đang ra
                </button>
              </div>
            </div>

            {/* Chapter Count Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Số chương:
              </span>
              <select
                value={chapters}
                onChange={(e) => handleFilterChange("chapters", e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="under100">&lt; 100</option>
                <option value="100to500">100 - 500</option>
                <option value="over500">500+</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                Đánh giá:
              </span>
              <select
                value={rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="4plus">⭐ 4.0+</option>
                <option value="45plus">⭐ 4.5+</option>
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
              Sắp xếp:
            </span>
            <select
              value={sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
              className="px-4 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0 focus:ring-2 focus:ring-primary font-medium cursor-pointer"
              aria-label="Sắp xếp truyện"
            >
              <option value="updated">Mới cập nhật</option>
              <option value="views">Lượt xem</option>
              <option value="rating">Đánh giá cao</option>
              <option value="newest">Truyện mới</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
