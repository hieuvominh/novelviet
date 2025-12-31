"use client";

import { useRef, Children, cloneElement, isValidElement } from "react";
import Link from "next/link";

interface HorizontalSectionProps {
  title: string;
  icon?: string;
  href?: string;
  children: React.ReactNode;
  showNavigation?: boolean;
  itemCount?: number;
  hideViewMore?: boolean;
}

export function HorizontalSection({
  title,
  icon,
  href,
  children,
  showNavigation = false,
  itemCount,
  hideViewMore = false,
}: HorizontalSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate card width based on item count
  const count = itemCount || Children.count(children);

  // Calculate responsive widths
  // Mobile: show 3 items, Tablet: 5 items, Desktop: 6-8 items based on count
  const getCardWidth = () => {
    if (count === 5) {
      // For exactly 5 items, fit all on desktop at full width
      return `w-[calc((100%-2*1rem)/3)] md:w-[calc((100%-4*1rem)/5)]`;
    } else if (count <= 5) {
      // For small counts, fit all on desktop
      return `flex-1 min-w-[120px] max-w-[180px]`;
    } else if (count <= 9) {
      // Medium count: show ~7 on desktop
      return `w-[calc((100%-4rem)/3)] md:w-[calc((100%-5rem)/5)] lg:w-[calc((100%-7rem)/7)]`;
    } else {
      // Large count: show ~8 on desktop
      return `w-[calc((100%-4rem)/3)] md:w-[calc((100%-6rem)/6)] lg:w-[calc((100%-8rem)/8)]`;
    }
  };

  const cardWidthClass = getCardWidth();

  // Clone children and add width class
  const childrenWithWidth = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child as React.ReactElement<any>, {
        className: cardWidthClass,
      });
    }
    return child;
  });

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            {icon && <span>{icon}</span>}
            {title}
          </h2>
          {!hideViewMore && href && (
            <Link
              href={href}
              className="text-primary hover:underline text-sm md:text-base flex items-center gap-1"
            >
              Xem thêm
              <svg
                className="w-4 h-4"
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
          )}
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Left Arrow - Only shown when showNavigation is true */}
          {showNavigation && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 items-center justify-center bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background"
              aria-label="Scroll left"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          )}

          {/* Right Arrow - Only shown when showNavigation is true */}
          {showNavigation && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 items-center justify-center bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background"
              aria-label="Scroll right"
            >
              <svg
                className="w-6 h-6"
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
            </button>
          )}

          {/* Scrollable Content */}
          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {childrenWithWidth}
          </div>
        </div>
      </div>
    </section>
  );
}
