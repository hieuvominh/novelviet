import Link from "next/link";
import Image from "next/image";

interface NovelCardCompactProps {
  novel: {
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
    total_chapters?: number;
    status?: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  };
  className?: string;
  showChapterCount?: boolean;
  imageAspect?: string;
}

export function NovelCardCompact({
  novel,
  className,
  showChapterCount = true,
  imageAspect = "aspect-[2/3]",
}: NovelCardCompactProps) {
  return (
    <Link
      href={`/truyen/${novel.slug}`}
      className={`flex-shrink-0 snap-start group ${
        className || "w-[120px] md:w-[140px]"
      }`}
    >
      {/* Cover Image */}
      <div
        className={`relative ${imageAspect} overflow-hidden rounded shadow-md mb-2 bg-muted transition-all duration-300 hover:opacity-70`}
      >
        <Image
          src={novel.cover_url || "/placeholder-cover.jpg"}
          alt={novel.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="140px"
        />
        {/* Status Badge */}
        {novel.status === "completed" && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            Full
          </div>
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {novel.title}
      </h3>

      {/* Chapter Count - Optional */}
      {showChapterCount &&
        novel.total_chapters !== undefined &&
        novel.total_chapters > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {novel.total_chapters} chương
          </p>
        )}
    </Link>
  );
}
