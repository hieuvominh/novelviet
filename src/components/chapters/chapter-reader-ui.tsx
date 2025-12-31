"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChapterHeader } from "./chapter-header";
import { ChapterNavigation } from "./chapter-navigation";
import { ChapterControls } from "./chapter-controls";
import { useReadingFullscreen } from "@/hooks/use-reading-fullscreen";
import { useReadingTheme } from "@/hooks/use-reading-theme";
import { useReadingTypography } from "@/hooks/use-reading-typography";

interface ChapterReaderUIProps {
  novel: {
    title: string;
    slug: string;
  };
  chapter: {
    number: number;
    title: string;
    content: string[];
  };
  totalChapters: number;
}

export function ChapterReaderUI({
  novel,
  chapter,
  totalChapters,
}: ChapterReaderUIProps) {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY RETURNS
  const [fontSize, setFontSize] = useState(18);
  const [fontSizeReady, setFontSizeReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const readingContainerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, isSupported, toggleFullscreen } = useReadingFullscreen(
    readingContainerRef as React.RefObject<HTMLElement>
  );

  const { themeConfig, isReady: themeReady } = useReadingTheme();
  const { lineHeight, isReady: typographyReady } = useReadingTypography();

  // Load fontSize from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("reader-font-size");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    setFontSizeReady(true);
  }, []);

  // Listen for font size changes from controls
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "reader-font-size" && e.newValue) {
        setFontSize(parseInt(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Detect scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Save font size to localStorage
  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    localStorage.setItem("reader-font-size", newSize.toString());
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "reader-font-size",
        newValue: newSize.toString(),
        storageArea: localStorage,
      })
    );
  };

  // Wait for all settings to load
  const allSettingsReady = fontSizeReady && themeReady && typographyReady;

  // NOW we can do conditional rendering
  if (!allSettingsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div
      ref={readingContainerRef}
      className={`min-h-screen transition-colors duration-300 ${
        isFullscreen ? "fullscreen-reading" : ""
      }`}
      style={{
        backgroundColor: themeConfig.background,
        color: themeConfig.text,
      }}
      suppressHydrationWarning
    >
      {/* Sticky Header */}
      <header
        className={`sticky top-0 z-50 bg-white dark:bg-gray-900 transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-4 h-14">
            {/* Back Button */}
            <Link
              href={`/truyen/${novel.slug}`}
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Quay lại"
            >
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
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
            </Link>

            {/* Novel Title */}
            <h2 className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {novel.title}
            </h2>
          </div>
        </div>
      </header>

      {/* Main Reading Area */}
      <main
        className={`container mx-auto px-4 md:px-6 py-8 transition-all duration-300 ${
          isFullscreen ? "max-w-7xl" : "max-w-5xl"
        }`}
      >
        <article
          className={`mx-auto transition-all duration-300 ${
            isFullscreen ? "max-w-6xl" : "max-w-4xl"
          }`}
        >
          {/* Chapter Header */}
          <ChapterHeader
            chapterNumber={chapter.number}
            chapterTitle={chapter.title}
          />

          {/* Reading Content */}
          <div
            id="reading-content"
            className="prose prose-lg max-w-none transition-all duration-300"
            style={{
              fontSize: `${fontSize}px`,
            }}
            suppressHydrationWarning
          >
            {chapter.content.map((paragraph, index) => (
              <p
                key={index}
                className="text-justify mb-6 transition-all duration-300"
                style={{ lineHeight: lineHeight }}
                suppressHydrationWarning
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Chapter Navigation */}
          <ChapterNavigation
            novelSlug={novel.slug}
            currentChapter={chapter.number}
            totalChapters={totalChapters}
          />
        </article>
      </main>

      {/* Floating Controls */}
      <ChapterControls
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        isFullscreen={isFullscreen}
        isFullscreenSupported={isSupported}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
