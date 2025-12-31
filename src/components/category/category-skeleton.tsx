export function CategorySkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-64 mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-full max-w-2xl mb-2"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 max-w-xl"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex gap-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
