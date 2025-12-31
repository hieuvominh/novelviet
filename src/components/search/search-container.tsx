"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { SearchInput } from "./search-input";
import { FilterChips } from "./filter-chips";
import { SortOptions } from "./sort-options";
import { SearchResults } from "./search-results";

interface Genre {
  id: string;
  name: string;
  slug: string;
  name_vi: string;
}

interface Novel {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_url: string | null;
  status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  total_chapters: number;
  view_count_total: number;
  rating_average: number;
  rating_count: number;
  last_chapter_at: string | null;
  author: {
    name: string;
    slug: string;
  };
}

interface SearchContainerProps {
  initialKeyword: string;
  initialGenres: string[];
  initialStatus: string;
  initialSort: string;
  initialPage: number;
  genres: Genre[];
  initialResults: Novel[];
  initialTotal: number;
}

export function SearchContainer({
  initialKeyword,
  initialGenres,
  initialStatus,
  initialSort,
  initialPage,
  genres,
  initialResults,
  initialTotal,
}: SearchContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [sortBy, setSortBy] = useState(initialSort);
  const [results, setResults] = useState<Novel[]>(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  const updateURL = useCallback(
    (params: Record<string, string | string[]>) => {
      const newParams = new URLSearchParams();

      if (params.q && params.q !== "") newParams.set("q", params.q as string);
      if (params.genres && (params.genres as string[]).length > 0) {
        newParams.set("genres", (params.genres as string[]).join(","));
      }
      if (params.status && params.status !== "")
        newParams.set("status", params.status as string);
      if (params.sort && params.sort !== "hot")
        newParams.set("sort", params.sort as string);
      if (params.page && params.page !== "1")
        newParams.set("page", params.page as string);

      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setKeyword(value);
      setPage(1);
      updateURL({
        q: value,
        genres: selectedGenres,
        status: selectedStatus,
        sort: sortBy,
        page: "1",
      });
    },
    [selectedGenres, selectedStatus, sortBy, updateURL]
  );

  const handleGenreToggle = useCallback(
    (genreId: string) => {
      const newGenres = selectedGenres.includes(genreId)
        ? selectedGenres.filter((id) => id !== genreId)
        : [...selectedGenres, genreId];

      setSelectedGenres(newGenres);
      setPage(1);
      updateURL({
        q: keyword,
        genres: newGenres,
        status: selectedStatus,
        sort: sortBy,
        page: "1",
      });
    },
    [selectedGenres, keyword, selectedStatus, sortBy, updateURL]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      setSelectedStatus(status);
      setPage(1);
      updateURL({
        q: keyword,
        genres: selectedGenres,
        status,
        sort: sortBy,
        page: "1",
      });
    },
    [keyword, selectedGenres, sortBy, updateURL]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      setSortBy(sort);
      setPage(1);
      updateURL({
        q: keyword,
        genres: selectedGenres,
        status: selectedStatus,
        sort,
        page: "1",
      });
    },
    [keyword, selectedGenres, selectedStatus, updateURL]
  );

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);

    // In a real implementation, this would fetch from API
    // For now, we'll rely on server-side rendering
    updateURL({
      q: keyword,
      genres: selectedGenres,
      status: selectedStatus,
      sort: sortBy,
      page: nextPage.toString(),
    });

    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, [page, keyword, selectedGenres, selectedStatus, sortBy, updateURL]);

  return (
    <div className="min-h-screen">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-10 bg-paper border-b border-brown/20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <SearchInput
            initialValue={keyword}
            onSearch={handleSearch}
            placeholder="Nhập tên truyện, tác giả…"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Chips */}
        <div className="mb-6">
          <FilterChips
            genres={genres}
            selectedGenres={selectedGenres}
            selectedStatus={selectedStatus}
            onGenreToggle={handleGenreToggle}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Sort Options */}
        <div className="mb-6">
          <SortOptions selectedSort={sortBy} onSortChange={handleSortChange} />
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-[#8C7B66]">
          Tìm thấy <span className="font-semibold">{total}</span> kết quả
          {keyword && (
            <>
              {" "}
              cho "<span className="font-semibold">{keyword}</span>"
            </>
          )}
        </div>

        {/* Search Results */}
        <SearchResults
          results={results}
          total={total}
          currentPage={page}
          onLoadMore={handleLoadMore}
          loading={loading}
        />
      </div>
    </div>
  );
}
