import Link from "next/link";

interface ChapterNavigationProps {
  novelSlug: string;
  currentChapterNumber: number;
  previousChapter?: {
    number: number;
    title: string;
  } | null;
  nextChapter?: {
    number: number;
    title: string;
  } | null;
  variant?: "top" | "bottom";
}

export function ChapterNavigation({
  novelSlug,
  currentChapterNumber,
  previousChapter,
  nextChapter,
  variant = "top",
}: ChapterNavigationProps) {
  const isTop = variant === "top";

  if (isTop) {
    return (
      <nav
        className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card"
        aria-label="Chapter navigation"
      >
        <Link
          href={`/truyen/${novelSlug}`}
          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          aria-label="Back to chapter list"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Danh sách chương
        </Link>

        <div className="flex items-center gap-2">
          {previousChapter ? (
            <Link
              href={`/truyen/${novelSlug}/chuong-${previousChapter.number}`}
              className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
              aria-label={`Previous chapter: ${previousChapter.title}`}
            >
              ← Chương trước
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 border rounded-lg opacity-50 cursor-not-allowed text-sm"
              aria-label="No previous chapter"
            >
              ← Chương trước
            </button>
          )}

          {nextChapter ? (
            <Link
              href={`/truyen/${novelSlug}/chuong-${nextChapter.number}`}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              aria-label={`Next chapter: ${nextChapter.title}`}
            >
              Chương sau →
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed text-sm"
              aria-label="No next chapter"
            >
              Chương sau →
            </button>
          )}
        </div>
      </nav>
    );
  }

  // Bottom variant with more detail
  return (
    <nav
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      aria-label="Chapter navigation"
    >
      {previousChapter ? (
        <Link
          href={`/truyen/${novelSlug}/chuong-${previousChapter.number}`}
          className="p-4 border rounded-lg hover:bg-accent transition-colors"
          aria-label={`Previous chapter: ${previousChapter.title}`}
        >
          <div className="text-xs text-muted-foreground mb-1">Chương trước</div>
          <div className="font-medium line-clamp-2">
            C{previousChapter.number}: {previousChapter.title}
          </div>
        </Link>
      ) : (
        <div className="p-4 border rounded-lg opacity-50">
          <div className="text-xs text-muted-foreground mb-1">Chương trước</div>
          <div className="font-medium">Không có</div>
        </div>
      )}

      <Link
        href={`/truyen/${novelSlug}`}
        className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
        aria-label="Back to chapter list"
      >
        <div className="font-medium">Danh sách chương</div>
      </Link>

      {nextChapter ? (
        <Link
          href={`/truyen/${novelSlug}/chuong-${nextChapter.number}`}
          className="p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          aria-label={`Next chapter: ${nextChapter.title}`}
        >
          <div className="text-xs opacity-90 mb-1">Chương sau</div>
          <div className="font-medium line-clamp-2">
            C{nextChapter.number}: {nextChapter.title}
          </div>
        </Link>
      ) : (
        <div className="p-4 bg-muted text-muted-foreground rounded-lg">
          <div className="text-xs mb-1">Chương sau</div>
          <div className="font-medium">Chưa có</div>
        </div>
      )}
    </nav>
  );
}
