import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { RatingDisplay } from "@/components/ui/rating-display";

interface NovelListItemProps {
  novel: {
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
  };
  showDescription?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function NovelListItem({
  novel,
  showDescription = true,
}: NovelListItemProps) {
  const statusLabel = novel.status === "completed" ? "Hoàn thành" : "Đang ra";
  const statusColor =
    novel.status === "completed"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";

  return (
    <article
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-200"
      style={{
        animation: "fadeSlideIn 0.3s ease-out",
      }}
    >
      <div className="flex gap-4 p-4">
        {/* Left: Cover Image */}
        <Link
          href={`/truyen/${novel.slug}`}
          className="flex-shrink-0 relative w-24 sm:w-28 md:w-32 aspect-[3/4] rounded overflow-hidden bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
        >
          {novel.cover_url ? (
            <Image
              src={novel.cover_url}
              alt={`Bìa truyện ${novel.title}`}
              fill
              sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, 128px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}
        </Link>

        {/* Center: Main Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-primary transition-colors">
            <Link
              href={`/truyen/${novel.slug}`}
              className="focus:outline-none focus:underline cursor-pointer"
            >
              {novel.title}
            </Link>
          </h3>

          {/* Author & Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/tac-gia/${novel.author.slug}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:underline focus:outline-none focus:underline cursor-pointer"
            >
              {novel.author.name}
            </Link>
            <Badge className={`text-xs px-2 py-0.5 ${statusColor}`}>
              {statusLabel}
            </Badge>
          </div>

          {/* Description - Desktop only */}
          {showDescription && novel.description && (
            <p className="hidden md:block text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {novel.description}
            </p>
          )}

          {/* Stats - Mobile (below description) */}
          <div className="flex md:hidden items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-auto">
            {novel.rating_average && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span className="font-medium">
                  {novel.rating_average.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>👁</span>
              <span>{formatNumber(novel.view_count_total)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📘</span>
              <span>{novel.total_chapters}</span>
            </div>
          </div>
        </div>

        {/* Right: Stats & Actions - Desktop */}
        <div className="hidden md:flex flex-col items-end gap-3 flex-shrink-0 w-32 lg:w-40">
          {/* Rating */}
          {novel.rating_average && (
            <RatingDisplay
              rating={novel.rating_average}
              count={novel.rating_count}
              size="sm"
            />
          )}

          {/* Stats */}
          <div className="flex flex-col gap-1.5 text-xs text-gray-600 dark:text-gray-400 w-full">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">Lượt đọc:</span>
              <span className="font-medium">
                {formatNumber(novel.view_count_total)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-500">Chương:</span>
              <span className="font-medium">{novel.total_chapters}</span>
            </div>
          </div>

          {/* Read Button */}
          <Link
            href={`/truyen/${novel.slug}`}
            className="w-full mt-auto px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors text-center cursor-pointer"
          >
            Đọc tiếp
          </Link>
        </div>
      </div>

      {/* Subtle hover indicator */}
      <div className="absolute inset-0 border-2 border-primary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </article>
  );
}
