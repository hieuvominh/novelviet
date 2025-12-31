export function CategoryListSkeleton() {
  return (
    <div className="space-y-4" aria-label="Đang tải...">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse"
        >
          <div className="flex gap-4">
            {/* Cover skeleton */}
            <div className="flex-shrink-0 w-24 sm:w-28 md:w-32 aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded" />

            {/* Content skeleton */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* Title */}
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />

              {/* Author & status */}
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-20" />
              </div>

              {/* Description - desktop */}
              <div className="hidden md:block space-y-2 mt-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6" />
              </div>

              {/* Stats - mobile */}
              <div className="flex md:hidden items-center gap-4 mt-auto">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12" />
              </div>
            </div>

            {/* Right stats - desktop */}
            <div className="hidden md:flex flex-col gap-3 w-32 lg:w-40">
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              <div className="space-y-1.5">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
              </div>
              <div className="h-9 bg-gray-200 dark:bg-gray-800 rounded w-full mt-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
