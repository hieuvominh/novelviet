"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Novel = {
  id: string;
  title: string;
  slug: string;
  status: "ongoing" | "completed" | "hiatus" | "dropped";
  is_published: boolean;
  total_chapters: number;
  view_count_total: number;
  rating_average: number;
  updated_at: string;
  last_chapter_at: string | null;
  authors: {
    id: string;
    name: string;
  } | null;
};

export default function AdminNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  const itemsPerPage = 20;

  // Fetch novels from Supabase
  useEffect(() => {
    async function fetchNovels() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();

        const { data, error: fetchError } = await supabase
          .from("novels")
          .select(
            `
            id,
            title,
            slug,
            status,
            is_published,
            total_chapters,
            view_count_total,
            rating_average,
            updated_at,
            last_chapter_at,
            authors (
              id,
              name
            )
          `
          )
          .order("updated_at", { ascending: false });

        if (fetchError) throw fetchError;

        setNovels(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch novels");
        console.error("Error fetching novels:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNovels();
  }, []);

  // Filter novels
  const filteredNovels = novels.filter((novel) => {
    const matchesSearch =
      searchQuery === "" ||
      novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (novel.authors?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || novel.status === statusFilter;

    const matchesPublished =
      publishedFilter === "all" ||
      (publishedFilter === "published" && novel.is_published) ||
      (publishedFilter === "draft" && !novel.is_published);

    return matchesSearch && matchesStatus && matchesPublished;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNovels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNovels = filteredNovels.slice(startIndex, endIndex);

  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "hiatus":
        return "bg-yellow-100 text-yellow-800";
      case "dropped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex gap-3">
            <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-8">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Novels</h1>
          <Link
            href="/admin/novels/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
          >
            + Add Novel
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 font-medium">Error loading novels</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novels</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredNovels.length} novels
          </p>
        </div>
        <Link
          href="/admin/novels/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          + Add Novel
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded border border-gray-200 p-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or author..."
            className="flex-1 min-w-[250px] px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="hiatus">Hiatus</option>
            <option value="dropped">Dropped</option>
          </select>

          {/* Published Filter */}
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {filteredNovels.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No novels found</p>
            {searchQuery ||
            statusFilter !== "all" ||
            publishedFilter !== "all" ? (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your filters
              </p>
            ) : (
              <Link
                href="/admin/novels/new"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Create your first novel
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Title
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Author
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">
                    Pub
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Ch
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Views
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Rating
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Last Ch
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Updated
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentNovels.map((novel) => (
                  <tr
                    key={novel.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/admin/novels/${novel.id}`)
                    }
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">
                        {novel.title}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600">
                      {novel.authors?.name || "Unknown"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                          novel.status
                        )}`}
                      >
                        {novel.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {novel.is_published ? (
                        <span className="text-green-600 font-medium">✓</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-900">
                      {novel.total_chapters || 0}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-900">
                      {formatViews(novel.view_count_total || 0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-gray-900 font-medium">
                          {novel.rating_average?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                      {novel.last_chapter_at
                        ? formatDate(novel.last_chapter_at)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                      {formatDate(novel.updated_at)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/admin/novels/${novel.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/admin/novels/${novel.id}/chapters`}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Chapters
                        </Link>
                        <Link
                          href={`/truyen/${novel.slug}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredNovels.length)}{" "}
          of {filteredNovels.length} novels
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 border rounded ${
                  currentPage === pageNum
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
