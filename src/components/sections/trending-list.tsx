"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface TrendingListProps {
  title: string;
  novels: Array<{
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
    total_chapters?: number;
    view_count_total?: number;
    view_count_daily?: number;
    status?: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  }>;
}

export function TrendingList({ title, novels }: TrendingListProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <h2 className="text-xl md:text-2xl font-bold">{title}</h2>

      {/* List */}
      <div
        className="space-y-3"
        onMouseLeave={() => {
          setHoveredIndex(null);
          setActiveIndex(0);
        }}
      >
        {novels.map((novel, index) => {
          const isExpanded =
            hoveredIndex !== null
              ? hoveredIndex === index
              : activeIndex === index;

          return (
            <Link
              key={novel.id}
              href={`/truyen/${novel.slug}`}
              className="flex gap-3 group hover:bg-muted/50 p-2 rounded transition-all duration-300"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setActiveIndex(index);
              }}
            >
              {/* Rank Number */}
              <div
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-lg rounded ${
                  index === 0
                    ? "bg-yellow-500 text-white"
                    : index === 1
                    ? "bg-gray-400 text-white"
                    : index === 2
                    ? "bg-orange-600 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>

              {isExpanded ? (
                <>
                  {/* Cover Image - Only show when expanded */}
                  <div className="relative w-24 h-32 flex-shrink-0 rounded overflow-hidden bg-muted">
                    <Image
                      src={novel.cover_url || "/placeholder-cover.jpg"}
                      alt={novel.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>

                  {/* Full Info - When expanded */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-2 text-sm group-hover:text-primary transition-colors mb-1">
                      {novel.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {novel.total_chapters !== undefined && (
                        <span>{novel.total_chapters} chương</span>
                      )}
                      {novel.view_count_daily !== undefined && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {novel.view_count_daily >= 1000
                            ? `${(novel.view_count_daily / 1000).toFixed(0)}k`
                            : novel.view_count_daily}
                        </span>
                      )}
                    </div>
                    {/* Status Badge */}
                    {novel.status === "completed" && (
                      <span className="inline-block mt-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                        Full
                      </span>
                    )}
                  </div>
                </>
              ) : (
                /* Compact single line - When collapsed */
                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                    {novel.title}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {novel.total_chapters !== undefined &&
                      `${novel.total_chapters} chương`}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
