interface ReadingProgressIndicatorProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  variant?: "bar" | "circle" | "badge";
  showLabel?: boolean;
  className?: string;
}

export function ReadingProgressIndicator({
  progress,
  size = "md",
  variant = "bar",
  showLabel = true,
  className = "",
}: ReadingProgressIndicatorProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const isComplete = normalizedProgress === 100;

  if (variant === "bar") {
    const heightClasses = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    return (
      <div className={`w-full ${className}`}>
        {showLabel && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tiến độ đọc</span>
            <span
              className={`text-sm font-medium ${
                isComplete ? "text-primary" : ""
              }`}
            >
              {normalizedProgress.toFixed(0)}%
            </span>
          </div>
        )}
        <div
          className={`w-full bg-muted rounded-full overflow-hidden ${heightClasses[size]}`}
        >
          <div
            className={`h-full transition-all duration-300 ${
              isComplete ? "bg-primary" : "bg-primary/80"
            }`}
            style={{ width: `${normalizedProgress}%` }}
            role="progressbar"
            aria-valuenow={normalizedProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Đã đọc ${normalizedProgress.toFixed(0)}%`}
          />
        </div>
      </div>
    );
  }

  if (variant === "circle") {
    const sizeClasses = {
      sm: { container: "w-12 h-12", text: "text-xs" },
      md: { container: "w-16 h-16", text: "text-sm" },
      lg: { container: "w-20 h-20", text: "text-base" },
    };

    const radius = size === "sm" ? 20 : size === "md" ? 28 : 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (normalizedProgress / 100) * circumference;

    return (
      <div
        className={`relative inline-flex items-center justify-center ${className}`}
      >
        <svg
          className={sizeClasses[size].container}
          viewBox="0 0 80 80"
          role="img"
          aria-label={`Đã đọc ${normalizedProgress.toFixed(0)}%`}
        >
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-300 ${
              isComplete ? "text-primary" : "text-primary/80"
            }`}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span
          className={`absolute ${sizeClasses[size].text} font-semibold ${
            isComplete ? "text-primary" : ""
          }`}
        >
          {normalizedProgress.toFixed(0)}%
        </span>
      </div>
    );
  }

  // Badge variant
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 
        ${sizeClasses[size]}
        rounded-full font-medium
        ${
          isComplete
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }
        ${className}
      `}
      role="status"
      aria-label={`Đã đọc ${normalizedProgress.toFixed(0)}%`}
    >
      {isComplete ? (
        <>
          <svg
            className="w-3 h-3"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Hoàn thành</span>
        </>
      ) : (
        <>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span>Đang đọc {normalizedProgress.toFixed(0)}%</span>
        </>
      )}
    </span>
  );
}
