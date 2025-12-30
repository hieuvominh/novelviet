interface RatingDisplayProps {
  rating: number;
  count: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  variant?: "default" | "detailed";
}

export function RatingDisplay({
  rating,
  count,
  size = "md",
  showCount = true,
  variant = "default",
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Round to 1 decimal
  const displayRating = rating.toFixed(1);

  // Calculate filled stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const StarIcon = ({ filled = false, half = false }) => (
    <svg
      className={`${sizeClasses[size]} ${
        filled || half ? "fill-current" : "fill-none stroke-current"
      }`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {half ? (
        <defs>
          <linearGradient id="half-fill">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      ) : null}
      <path
        fill={half ? "url(#half-fill)" : undefined}
        stroke={!filled && !half ? "currentColor" : "none"}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );

  if (count === 0) {
    return (
      <div
        className={`flex items-center gap-1 text-muted-foreground ${textSizeClasses[size]}`}
      >
        <span>Chưa có đánh giá</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-yellow-500">
            {displayRating}
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5 text-yellow-500">
              {Array.from({ length: fullStars }).map((_, i) => (
                <StarIcon key={`full-${i}`} filled />
              ))}
              {hasHalfStar && <StarIcon half />}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <StarIcon key={`empty-${i}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {count.toLocaleString("vi-VN")} đánh giá
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 text-yellow-500 ${textSizeClasses[size]}`}
    >
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${displayRating} out of 5 stars`}
      >
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon key={`full-${i}`} filled />
        ))}
        {hasHalfStar && <StarIcon half />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarIcon key={`empty-${i}`} />
        ))}
      </div>
      <span className="font-semibold">{displayRating}</span>
      {showCount && (
        <span className="text-muted-foreground">
          ({count.toLocaleString("vi-VN")})
        </span>
      )}
    </div>
  );
}
