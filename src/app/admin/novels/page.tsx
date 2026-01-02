"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toggleNovelPublish, softDeleteNovel } from "./actions";
import toast from "@/components/ui/toast/toast";

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
  const [updatingNovelId, setUpdatingNovelId] = useState<string | null>(null);
  const [deletingNovelId, setDeletingNovelId] = useState<string | null>(null);
  const [confirmUnpublishNovel, setConfirmUnpublishNovel] = useState<{
    show: boolean;
    novel?: Novel | null;
  }>({ show: false, novel: null });

  const itemsPerPage = 20;

  // Fetch novels from Supabase
  useEffect(() => {
    async function fetchNovels() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();

        // Try to exclude soft-deleted rows; fall back if DB doesn't have the column
        let data: any = null;
        let fetchError: any = null;

        try {
          const res = await supabase
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
            .is("deleted_at", null)
            .order("updated_at", { ascending: false });

          data = res.data;
          fetchError = res.error;

          if (fetchError) {
            const msg = fetchError.message || JSON.stringify(fetchError);
            // If error mentions deleted_at (column missing), fall through to fallback query
            if (
              !msg ||
              (!msg.includes("deleted_at") && !msg.includes("does not exist"))
            ) {
              throw new Error(msg || "Failed to fetch novels");
            }
          }
        } catch (err) {
          // Fallback: query without deleted_at filter
          console.warn(
            "Falling back to novels query without deleted_at filter:",
            (err as any)?.message || err
          );
          const res2 = await supabase
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

          data = res2.data;
          fetchError = res2.error;
        }

        if (fetchError) {
          const msg =
            (fetchError &&
              (fetchError.message ||
                fetchError.error ||
                JSON.stringify(fetchError))) ||
            "Unknown fetch error";
          throw new Error(msg);
        }

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

  // Using global toast via import

  // Handle publish toggle
  const performToggleNovelPublish = async (
    novel: Novel,
    newPublishState: boolean
  ) => {
    setUpdatingNovelId(novel.id);
    const prev = novels.map((n) => ({ ...n }));

    // Optimistic UI
    setNovels((prevList) =>
      prevList.map((n) =>
        n.id === novel.id ? { ...n, is_published: newPublishState } : n
      )
    );

    try {
      const result = await toggleNovelPublish({
        novel_id: novel.id,
        is_published: newPublishState,
      });

      if (!result.success) {
        // Revert optimistic update on error
        setNovels(prev);
        toast.error(result.error || "Failed to update publish status");
        return;
      }

      toast.success(
        `Novel ${newPublishState ? "published" : "unpublished"} successfully`
      );
    } catch (err) {
      // Revert optimistic update on error
      setNovels(prev);
      console.error("Error toggling publish status:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setUpdatingNovelId(null);
    }
  };

  const handlePublishToggle = (novel: Novel) => {
    const newPublishState = !novel.is_published;

    // If unpublishing, show modal confirmation with clear message
    if (!newPublishState) {
      setConfirmUnpublishNovel({ show: true, novel });
      return;
    }

    // Publishing - proceed immediately
    performToggleNovelPublish(novel, true);
  };

  // Handle delete (soft-delete) of novel
  const handleDeleteNovel = async (novel: Novel) => {
    // Prevent deleting while publish toggle is pending for this novel
    if (updatingNovelId === novel.id) return;

    const confirmed = window.confirm(
      "Deleting a novel will also remove all its chapters. This action cannot be undone."
    );
    if (!confirmed) return;

    const prev = novels;
    // Optimistic removal from list
    setNovels((prevList) => prevList.filter((n) => n.id !== novel.id));
    setDeletingNovelId(novel.id);

    try {
      const res = await softDeleteNovel(novel.id);
      if (!res.success) {
        // Revert
        setNovels(prev);
        toast.error(res.error || "Failed to delete novel");
        return;
      }

      toast.success("Novel deleted");
    } catch (err) {
      setNovels(prev);
      console.error("Error deleting novel:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete novel"
      );
    } finally {
      setDeletingNovelId(null);
    }
  };

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
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
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
            style={{ minWidth: 250 }}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                    Published
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
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handlePublishToggle(novel)}
                        disabled={updatingNovelId === novel.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          novel.is_published ? "bg-green-600" : "bg-gray-300"
                        }`}
                        title={novel.is_published ? "Published" : "Unpublished"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            novel.is_published
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
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
                        <button
                          onClick={() => handleDeleteNovel(novel)}
                          disabled={deletingNovelId === novel.id}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
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

      {/* Confirm Unpublish Modal for Novel */}
      {confirmUnpublishNovel.show && confirmUnpublishNovel.novel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setConfirmUnpublishNovel({ show: false, novel: null })
            }
          />
          <div className="relative bg-white rounded shadow-lg max-w-lg w-full p-6 z-10">
            <h3 className="text-lg font-semibold text-gray-900">
              Unpublish novel
            </h3>
            <p className="text-sm text-gray-700 mt-2">
              This novel will disappear from the public site. Chapters will
              remain stored in the database and can be republished later.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() =>
                  setConfirmUnpublishNovel({ show: false, novel: null })
                }
                className="px-4 py-2 rounded bg-white border border-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const n = confirmUnpublishNovel.novel!;
                  setConfirmUnpublishNovel({ show: false, novel: null });
                  await performToggleNovelPublish(n, false);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
