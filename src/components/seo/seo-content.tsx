"use client";

import { useState } from "react";

interface SEOContentProps {
  content: string;
}

export function SEOContent({ content }: SEOContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="bg-muted/30 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div
          className={`prose prose-sm md:prose-base max-w-none ${
            isExpanded ? "" : "line-clamp-4 md:line-clamp-6"
          }`}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-primary hover:underline text-sm font-medium flex items-center gap-1"
          aria-label={isExpanded ? "Thu gọn" : "Xem thêm"}
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
