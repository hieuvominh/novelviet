import Link from "next/link";

export function CategoryEmptyState() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <div className="max-w-md mx-auto text-center">
        {/* Empty Icon */}
        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
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
        </div>

        {/* Message */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Chưa có truyện nào
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Thể loại này hiện chưa có truyện. Hãy khám phá các thể loại khác nhé!
        </p>

        {/* Suggestions */}
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Thể loại phổ biến:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/the-loai/tien-hiep"
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Tiên Hiệp
            </Link>
            <Link
              href="/the-loai/huyen-huyen"
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Huyền Huyễn
            </Link>
            <Link
              href="/the-loai/do-thi"
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Đô Thị
            </Link>
            <Link
              href="/the-loai/ngon-tinh"
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Ngôn Tình
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
