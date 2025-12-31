"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const genres = [
  { id: "1", name: "Fantasy", slug: "fantasy", name_vi: "Huyền Huyễn" },
  { id: "2", name: "Martial Arts", slug: "martial-arts", name_vi: "Võ Hiệp" },
  { id: "3", name: "Romance", slug: "romance", name_vi: "Ngôn Tình" },
  { id: "4", name: "Urban", slug: "urban", name_vi: "Đô Thị" },
  { id: "5", name: "Action", slug: "action", name_vi: "Hành Động" },
  { id: "6", name: "Historical", slug: "historical", name_vi: "Lịch Sử" },
  { id: "7", name: "Xianxia", slug: "xianxia", name_vi: "Tiên Hiệp" },
  { id: "8", name: "Wuxia", slug: "wuxia", name_vi: "Kiếm Hiệp" },
];

export function SiteHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showGenrePanel, setShowGenrePanel] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{
      id: string;
      title: string;
      slug: string;
      cover_url: string | null;
    }>
  >([]);
  const genrePanelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      router.push("/tim-kiem");
    }
  };

  // Debounced search for suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // Mock search suggestions - replace with actual API call
      const mockSuggestions = Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        title: `${searchQuery} - Truyện ${i + 1}`,
        slug: `truyen-${i + 1}`,
        cover_url: `https://picsum.photos/seed/${searchQuery}-${i}/100/140`,
      }));
      setSearchSuggestions(mockSuggestions);
      setShowSearchSuggestions(true);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        genrePanelRef.current &&
        !genrePanelRef.current.contains(event.target as Node)
      ) {
        setShowGenrePanel(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchSuggestions(false);
      }
    };

    if (showGenrePanel || showSearchSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showGenrePanel, showSearchSuggestions]);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#282828] backdrop-blur supports-[backdrop-filter]:bg-[#282828]">
      <div className="container mx-auto px-4">
        <h1 className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-0.75 shrink-0 cursor-pointer"
          >
            <img src="/icon.png" alt="Truyện Đọc Logo" className="h-8 w-6" />
            <span className="text-2xl font-black">
              <span style={{ color: "#ffe300" }}>Novel</span>
              <span style={{ color: "#ee2737" }}>Viet</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium flex-1">
            <Link
              href="/"
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              Trang chủ
            </Link>

            {/* Thể loại with dropdown */}
            <div className="relative" ref={genrePanelRef}>
              <button
                onClick={() => setShowGenrePanel(!showGenrePanel)}
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center gap-1"
              >
                Thể loại
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showGenrePanel ? "rotate-180" : ""
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

              {/* Genre Panel */}
              {showGenrePanel && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {genres.map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/the-loai/${genre.slug}`}
                          onClick={() => setShowGenrePanel(false)}
                          className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors whitespace-nowrap"
                        >
                          {genre.name_vi}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/dang-ra"
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              Đang ra
            </Link>
            <Link
              href="/hoan-thanh"
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
            >
              Hoàn thành
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md">
            <div ref={searchRef} className="relative w-full">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm truyện, tác giả..."
                  className="w-full px-4 py-2 pr-10 bg-gray-800 text-white placeholder-gray-400 rounded-full border border-gray-700 focus:outline-none focus:border-primary transition-colors text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors"
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto scrollbar-hide">
                  <div className="p-2">
                    <div className="text-xs text-gray-400 px-3 py-2 font-medium">
                      Kết quả hàng đầu
                    </div>
                    {searchSuggestions.map((novel) => (
                      <Link
                        key={novel.id}
                        href={`/truyen/${novel.slug}`}
                        onClick={() => {
                          setShowSearchSuggestions(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded transition-colors"
                      >
                        <div className="relative w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-700">
                          {novel.cover_url && (
                            <img
                              src={novel.cover_url}
                              alt={novel.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {novel.title}
                          </p>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/tim-kiem?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setShowSearchSuggestions(false);
                        setSearchQuery("");
                      }}
                      className="block px-3 py-2 mt-1 text-sm text-primary hover:bg-gray-700 rounded transition-colors text-center"
                    >
                      Xem tất cả kết quả cho "{searchQuery}"
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Search Button (Mobile) */}
            <Link
              href="/tim-kiem"
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </h1>
      </div>
    </header>
  );
}
