interface FullscreenToggleButtonProps {
  isFullscreen: boolean;
  isSupported: boolean;
  onToggle: () => void;
}

export function FullscreenToggleButton({
  isFullscreen,
  isSupported,
  onToggle,
}: FullscreenToggleButtonProps) {
  if (!isSupported) {
    return (
      <button
        disabled
        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-50 cursor-not-allowed"
        title="Trình duyệt không hỗ trợ"
      >
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
      title={isFullscreen ? "Thoát toàn màn hình (F)" : "Toàn màn hình (F)"}
      aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
    >
      {isFullscreen ? (
        // Exit fullscreen icon
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
            d="M6 18L18 6M6 6l12 12"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 9L3 3m0 0v6m0-6h6M15 9l6-6m0 0v6m0-6h-6M9 15l-6 6m0 0v-6m0 6h6M15 15l6 6m0 0v-6m0 6h-6"
          />
        </svg>
      ) : (
        // Enter fullscreen icon
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
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      )}
    </button>
  );
}
