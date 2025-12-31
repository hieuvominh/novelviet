import Link from "next/link";

interface ChapterNavigationProps {
  novelSlug: string;
  currentChapter: number;
  totalChapters: number;
}

export function ChapterNavigation({
  novelSlug,
  currentChapter,
  totalChapters,
}: ChapterNavigationProps) {
  const hasPrevious = currentChapter > 1;
  const hasNext = currentChapter < totalChapters;

  return (
    <div className="flex items-center gap-4 py-8 mb-20">
      {/* Previous Chapter */}
      {hasPrevious ? (
        <Link
          href={`/truyen/${novelSlug}/chuong-${currentChapter - 1}`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100 font-medium"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Chương trước
        </Link>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50">
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Chương trước
        </div>
      )}

      {/* Next Chapter */}
      {hasNext ? (
        <Link
          href={`/truyen/${novelSlug}/chuong-${currentChapter + 1}`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-gray-100 font-medium"
        >
          Chương sau
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50">
          Chương sau
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
