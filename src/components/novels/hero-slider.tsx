"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroSliderProps {
  novels: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    cover_url: string | null;
    status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
    total_chapters: number;
    view_count_daily: number;
    rating_average: number;
    author: {
      name: string;
      slug: string;
    };
  }>;
}

export function HeroSlider({ novels }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? novels.length - 1 : prev - 1));
  }, [novels.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === novels.length - 1 ? 0 : prev + 1));
  }, [novels.length]);

  // Auto-slide effect
  useEffect(() => {
    if (isPaused || novels.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isPaused, goToNext, novels.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (novels.length === 0) return null;

  const getPrevIndex = () =>
    currentIndex === 0 ? novels.length - 1 : currentIndex - 1;
  const getNextIndex = () =>
    currentIndex === novels.length - 1 ? 0 : currentIndex + 1;
  const getPrev2Index = () => {
    const prevIndex = getPrevIndex();
    return prevIndex === 0 ? novels.length - 1 : prevIndex - 1;
  };
  const getNext2Index = () => {
    const nextIndex = getNextIndex();
    return nextIndex === novels.length - 1 ? 0 : nextIndex + 1;
  };

  return (
    <section
      className="relative pt-6 w-full overflow-hidden bg-linear-to-b from-gray-900/90 to-gray-800/70"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        {/* Slider Container */}
        <div className="relative h-87.5 md:h-112.5 flex items-center justify-center gap-2 md:gap-4">
          {/* Previous Slide 2 (Far Left) */}
          <div
            className="hidden lg:block relative w-60 lg:w-75 h-68 lg:h-80 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => goToSlide(getPrev2Index())}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg opacity-40 blur-[3px] hover:opacity-60 hover:blur-[2px] transition-all">
              <Image
                src={
                  novels[getPrev2Index()].cover_url || "/placeholder-cover.jpg"
                }
                alt={novels[getPrev2Index()].title}
                fill
                className="object-fill"
                sizes="180px"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>

          {/* Previous Slide */}
          <div
            className="hidden md:block relative w-65 lg:w-80 h-72 lg:h-88 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => goToSlide(getPrevIndex())}
          >
            <div className="relative w-full h-full rounded overflow-hidden shadow-lg opacity-60 blur-[2px] hover:opacity-80 hover:blur-[1px] transition-all">
              <Image
                src={
                  novels[getPrevIndex()].cover_url || "/placeholder-cover.jpg"
                }
                alt={novels[getPrevIndex()].title}
                fill
                className="object-fill"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          {/* Current Slide - Main */}
          <div className="relative w-full max-w-90 md:max-w-100 lg:max-w-115 h-full shrink-0">
            <Link
              href={`/truyen/${novels[currentIndex].slug}`}
              className="block relative w-full h-full rounded overflow-hidden shadow-2xl group"
            >
              <Image
                src={novels[currentIndex].cover_url || "/placeholder-cover.jpg"}
                alt={novels[currentIndex].title}
                fill
                priority
                className="object-fill transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 360px, 520px"
              />
              {/* Badge */}
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg z-10">
                Hot
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white z-10">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                  {novels[currentIndex].title}
                </h2>
                <p className="text-sm md:text-base text-white/90 mb-3 line-clamp-2">
                  {novels[currentIndex].description}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    <span>{novels[currentIndex].total_chapters} chương</span>
                  </div>
                  <div className="flex items-center gap-1">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span>
                      {novels[currentIndex].view_count_daily.toLocaleString()}
                    </span>
                  </div>
                  {novels[currentIndex].rating_average > 0 && (
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 fill-yellow-400"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>
                        {novels[currentIndex].rating_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Next Slide */}
          <div
            className="hidden md:block relative w-65 lg:w-80 h-72 lg:h-88 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => goToSlide(getNextIndex())}
          >
            <div className="relative w-full h-full rounded overflow-hidden shadow-lg opacity-60 blur-[2px] hover:opacity-80 hover:blur-[1px] transition-all">
              <Image
                src={
                  novels[getNextIndex()].cover_url || "/placeholder-cover.jpg"
                }
                alt={novels[getNextIndex()].title}
                fill
                className="object-fill"
                sizes="260px"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          {/* Next Slide 2 (Far Right) */}
          <div
            className="hidden lg:block relative w-60 lg:w-75 h-68 lg:h-80 cursor-pointer transition-all duration-300 hover:scale-105"
            onClick={() => goToSlide(getNext2Index())}
          >
            <div className="relative w-full h-full rounded overflow-hidden shadow-lg opacity-40 blur-[3px] hover:opacity-60 hover:blur-[2px] transition-all">
              <Image
                src={
                  novels[getNext2Index()].cover_url || "/placeholder-cover.jpg"
                }
                alt={novels[getNext2Index()].title}
                fill
                className="object-fill"
                sizes="180px"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {novels.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors"
              aria-label="Previous slide"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
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

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-background transition-colors"
              aria-label="Next slide"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
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
          </>
        )}

        {/* Dot Indicators */}
        {novels.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {novels.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-muted-foreground/40 w-2 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
