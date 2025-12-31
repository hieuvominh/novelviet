interface StatsDisplayProps {
  stats: {
    totalChapters: number;
    totalWords: number;
    viewCount: number;
    rating: number;
    ratingCount: number;
    bookmarkCount: number;
  };
}

export function StatsDisplay({ stats }: StatsDisplayProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString("vi-VN");
  };

  const items = [
    {
      label: "Chương",
      value: stats.totalChapters,
      icon: (
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
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      label: "Lượt xem",
      value: formatNumber(stats.viewCount),
      icon: (
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
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
    },
    {
      label: "Đánh giá",
      value:
        stats.ratingCount > 0
          ? `${stats.rating.toFixed(1)}/5.0 (${formatNumber(
              stats.ratingCount
            )})`
          : "Chưa có",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      highlight: stats.ratingCount > 0,
    },
    {
      label: "Đánh dấu",
      value: formatNumber(stats.bookmarkCount),
      icon: (
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
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      ),
    },
  ];

  if (stats.totalWords > 0) {
    items.splice(1, 0, {
      label: "Tổng từ",
      value: formatNumber(stats.totalWords),
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    });
  }

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`${
              item.highlight
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {item.icon}
          </div>
          <p
            className={`text-base font-medium ${
              item.highlight
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
