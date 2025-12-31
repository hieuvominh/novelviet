"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Novel {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  total_chapters?: number;
  view_count_total?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategorySectionProps {
  categories: Category[];
  novelsByCategory: Record<string, Novel[]>;
}

export function CategorySection({
  categories,
  novelsByCategory,
}: CategorySectionProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const activeNovels = novelsByCategory[activeCategory] || [];
  const totalPages = Math.ceil(activeNovels.length / itemsPerPage);
  const displayedNovels = activeNovels.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(0);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  if (categories.length === 0) return null;

  return (
    <section className="relative py-6 md:py-8 overflow-hidden">
      {/* Blurred Background Images */}
      <div className="absolute inset-0 grid grid-cols-3 gap-0">
        {displayedNovels.slice(0, 6).map((novel, index) => (
          <div key={novel.id} className="relative w-full h-full">
            <Image
              src={novel.cover_url || "/placeholder-cover.jpg"}
              alt=""
              fill
              className="object-cover blur-[100px] scale-125 brightness-75"
              sizes="33vw"
            />
          </div>
        ))}
      </div>

      {/* Gradient Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 dark:from-black/70 dark:via-black/60 dark:to-black/70" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Category Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-center gap-6 md:gap-8 overflow-x-auto pb-2 flex-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`text-base md:text-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === category.id
                    ? "text-white font-bold text-lg md:text-xl scale-110"
                    : "text-white/70 font-normal hover:text-white"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* View More Link */}
          <Link
            href={`/the-loai/${
              categories.find((c) => c.id === activeCategory)?.slug || ""
            }`}
            className="text-white/90 hover:text-white text-sm md:text-base flex items-center gap-1 whitespace-nowrap ml-4 cursor-pointer"
          >
            Xem thêm
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Novel Grid with Navigation */}
        <div className="relative">
          {/* Previous Button */}
          {totalPages > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Previous"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
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
            </button>
          )}

          {/* Novel Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {displayedNovels.map((novel) => (
              <Link
                key={novel.id}
                href={`/truyen/${novel.slug}`}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[3/4] rounded overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <Image
                    src={novel.cover_url || "/placeholder-cover.jpg"}
                    alt={novel.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Chapter Count Badge */}
                  {novel.total_chapters && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {novel.total_chapters}
                    </div>
                  )}
                </div>
                <h3 className="text-white mt-2 text-sm md:text-base font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {novel.title}
                </h3>
              </Link>
            ))}
          </div>

          {/* Next Button */}
          {totalPages > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Next"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
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
            </button>
          )}
        </div>

        {/* Page Indicators */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  index === currentPage
                    ? "bg-primary w-8"
                    : "bg-gray-300 dark:bg-gray-600 w-2"
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
