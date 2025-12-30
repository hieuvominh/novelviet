import Link from "next/link";
import Image from "next/image";

interface HeroNovelProps {
  novel: {
    id: string;
    title: string;
    slug: string;
    description: string;
    cover_url: string | null;
    status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
    total_chapters: number;
    view_count_daily: number;
    rating_average: number;
    author: {
      name: string;
      slug: string;
    };
  };
  badge?: "hot" | "new" | "completed";
}

export function HeroNovel({ novel, badge }: HeroNovelProps) {
  const badgeConfig = {
    hot: { text: "Hot", className: "bg-red-500" },
    new: { text: "Mới", className: "bg-blue-500" },
    completed: { text: "Full", className: "bg-green-500" },
  };

  const currentBadge = badge ? badgeConfig[badge] : null;

  return (
    <section className="relative w-full overflow-hidden bg-linear-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          {/* Cover Image */}
          <Link
            href={`/truyen/${novel.slug}`}
            className="relative aspect-3/4 md:aspect-2/3 overflow-hidden rounded-2xl shadow-2xl group"
          >
            <Image
              src={novel.cover_url || "/placeholder-cover.jpg"}
              alt={novel.title}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {currentBadge && (
              <div
                className={`absolute top-4 left-4 ${currentBadge.className} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}
              >
                {currentBadge.text}
              </div>
            )}
          </Link>

          {/* Novel Info */}
          <div className="flex flex-col justify-center space-y-4 md:space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {novel.title}
              </h1>
              <Link
                href={`/tac-gia/${novel.author.slug}`}
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {novel.author.name}
              </Link>
            </div>

            {/* Description */}
            <p className="text-muted-foreground line-clamp-3 md:line-clamp-4 text-sm md:text-base">
              {novel.description}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
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
                <span>{novel.total_chapters} chương</span>
              </div>
              <div className="flex items-center gap-1">
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
                <span>{novel.view_count_daily.toLocaleString()}</span>
              </div>
              {novel.rating_average > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>{novel.rating_average.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href={`/truyen/${novel.slug}`}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
              >
                Đọc ngay
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
