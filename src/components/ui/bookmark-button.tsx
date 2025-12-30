"use client";

import { useState } from "react";

interface BookmarkButtonProps {
  isBookmarked?: boolean;
  onToggle?: () => void | Promise<void>;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "button";
  label?: string;
}

export function BookmarkButton({
  isBookmarked = false,
  onToggle,
  disabled = false,
  size = "md",
  variant = "button",
  label,
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  const handleClick = async () => {
    if (!onToggle || disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onToggle();
    } finally {
      setIsLoading(false);
    }
  };

  const BookmarkIcon = () => (
    <svg
      className={`${sizeClasses[size]} transition-all duration-200 ${
        isLoading ? "animate-pulse" : ""
      }`}
      fill={isBookmarked ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );

  const displayLabel = label || (isBookmarked ? "Đã đánh dấu" : "Đánh dấu");

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          p-2 rounded-lg transition-colors
          ${
            isBookmarked
              ? "text-primary bg-primary/10 hover:bg-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        aria-label={displayLabel}
        aria-pressed={isBookmarked}
      >
        <BookmarkIcon />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        ${buttonSizeClasses[size]}
        flex items-center justify-center gap-2 
        rounded-lg border font-medium transition-colors
        ${
          isBookmarked
            ? "border-primary text-primary bg-primary/10 hover:bg-primary/20"
            : "hover:bg-accent"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isLoading ? "cursor-wait" : ""}
      `}
      aria-label={displayLabel}
      aria-pressed={isBookmarked}
    >
      <BookmarkIcon />
      <span>{isLoading ? "Đang xử lý..." : displayLabel}</span>
    </button>
  );
}
