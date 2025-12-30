import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface NovelCardProps {
  novel: {
    id: string;
    title: string;
    slug: string;
    description: string;
    cover_url: string | null;
    author: {
      name: string;
      slug: string;
    };
    status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
    total_chapters: number;
    view_count_total: number;
    rating_average: number;
    rating_count: number;
    last_chapter_at: string | null;
  };
  showDescription?: boolean;
  compact?: boolean;
}

const statusLabels: Record<string, string> = {
  draft: "Nháp",
  ongoing: "Đang ra",
  completed: "Hoàn thành",
  hiatus: "Tạm ngưng",
  dropped: "Ngừng",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  ongoing: "bg-blue-500",
  completed: "bg-green-500",
  hiatus: "bg-yellow-500",
  dropped: "bg-red-500",
};

export function NovelCard({
  novel,
  showDescription = false,
  compact = false,
}: NovelCardProps) {
  const coverUrl = novel.cover_url || "/placeholder-cover.svg";

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Format rating
  const formatRating = (rating: number) => rating.toFixed(1);

  if (compact) {
    return (
      <Link
        href={`/truyen/${novel.slug}`}
        className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="relative w-16 h-20 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={coverUrl}
            alt={novel.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {novel.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            {novel.author.name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{novel.total_chapters} chương</span>
            <span>•</span>
            <span>{formatViews(novel.view_count_total)} lượt xem</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/truyen/${novel.slug}`}
      className="group block overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <Image
          src={coverUrl}
          alt={novel.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${statusColors[novel.status]} text-white text-xs`}>
            {statusLabels[novel.status]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {novel.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3">
          {novel.author.name}
        </p>

        {showDescription && novel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {novel.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              {novel.total_chapters}
            </span>
            <span className="flex items-center gap-1">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {formatViews(novel.view_count_total)}
            </span>
          </div>
          {novel.rating_count > 0 && (
            <span className="flex items-center gap-1 text-yellow-500 font-medium">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {formatRating(novel.rating_average)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
