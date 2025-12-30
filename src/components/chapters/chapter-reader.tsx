"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/hooks/use-theme";

interface ChapterReaderProps {
  chapter: {
    id: string;
    novelId: string;
    novelSlug: string;
    chapterNumber: number;
    title: string;
    content: string;
    wordCount: number;
  };
}

export function ChapterReader({ chapter }: ChapterReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [fontSize, setFontSize] = useState(18);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  // Record view on mount (once)
  useEffect(() => {
    if (hasRecordedView) return;

    const recordView = async () => {
      try {
        // Get or create session ID
        let sessionId = sessionStorage.getItem("reader_session_id");
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem("reader_session_id", sessionId);
        }

        // Record view via server action
        const response = await fetch("/api/chapters/record-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: chapter.id,
            novelId: chapter.novelId,
            sessionId,
          }),
        });

        if (response.ok) {
          setHasRecordedView(true);
        }
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    };

    // Delay to ensure it's a real read (not just passing through)
    const timer = setTimeout(recordView, 3000);
    return () => clearTimeout(timer);
  }, [chapter.id, chapter.novelId, hasRecordedView]);

  // Save reading progress (for authenticated users or localStorage)
  useEffect(() => {
    const saveProgress = () => {
      const scrollProgress = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100
      );

      // Save to localStorage for guests
      const progressKey = `reading_progress_${chapter.novelId}`;
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          chapterId: chapter.id,
          chapterNumber: chapter.chapterNumber,
          novelSlug: chapter.novelSlug,
          scrollPosition: window.scrollY,
          percentage: scrollProgress,
          updatedAt: new Date().toISOString(),
        })
      );

      // TODO: Save to database for authenticated users
      // This would be done via a server action
    };

    const handleScroll = () => {
      // Debounce scroll events
      clearTimeout((window as any).scrollTimer);
      (window as any).scrollTimer = setTimeout(saveProgress, 1000);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      saveProgress(); // Save on unmount
    };
  }, [chapter.id, chapter.novelId, chapter.chapterNumber, chapter.novelSlug]);

  // Font size controls
  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 2, 28));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 2, 14));

  return (
    <div>
      {/* Reading Controls */}
      <div className="sticky top-16 z-10 mb-6 p-4 rounded-lg border bg-background/95 backdrop-blur shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cỡ chữ:</span>
              <button
                onClick={decreaseFontSize}
                className="p-2 rounded hover:bg-accent transition-colors"
                aria-label="Decrease font size"
              >
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <span className="text-sm w-12 text-center">{fontSize}px</span>
              <button
                onClick={increaseFontSize}
                className="p-2 rounded hover:bg-accent transition-colors"
                aria-label="Increase font size"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {chapter.wordCount > 0 &&
              `${chapter.wordCount.toLocaleString("vi-VN")} từ`}
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <article
        ref={contentRef}
        className="max-w-4xl mx-auto"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.8,
        }}
      >
        {/* Chapter Title */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Chương {chapter.chapterNumber}
          </h1>
          <h2 className="text-xl md:text-2xl text-muted-foreground">
            {chapter.title}
          </h2>
        </header>

        {/* Chapter Content */}
        <div
          className="prose dark:prose-invert prose-lg max-w-none"
          style={{
            fontSize: "inherit",
            lineHeight: "inherit",
          }}
        >
          {chapter.content.split("\n").map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return <div key={index} className="h-4" />;

            return (
              <p key={index} className="mb-6 text-justify">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Chapter End */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground italic">
            --- Hết chương {chapter.chapterNumber} ---
          </p>
        </div>
      </article>
    </div>
  );
}
