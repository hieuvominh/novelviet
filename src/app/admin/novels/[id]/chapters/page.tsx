"use client";

import { useState, useEffect } from "react";
import { togglePublishChapter, softDeleteChapter } from "./actions";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import toast from "@/components/ui/toast/toast";

type Novel = {
  id: string;
  title: string;
  slug: string;
  status: string;
  total_chapters: number;
  is_published: boolean;
  authors: {
    id: string;
    name: string;
  } | null;
};

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  is_published: boolean;
  published_at?: string | null;
  view_count: number;
  created_at: string;
};

export default async function NovelChaptersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <NovelChaptersContent novelId={id} />;
}

function NovelChaptersContent({ novelId }: { novelId: string }) {
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [updatingChapterId, setUpdatingChapterId] = useState<string | null>(
    null
  );
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(
    null
  );
  const [confirmUnpublish, setConfirmUnpublish] = useState<{
    show: boolean;
    chapter?: Chapter | null;
  }>({ show: false, chapter: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch novel and chapters from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();

        // Fetch novel details
        const { data: novelData, error: novelError } = await supabase
          .from("novels")
          .select(
            `
            id,
            title,
            slug,
            status,
            total_chapters,
            is_published,
            authors (
              id,
              name
            )
          `
          )
          .eq("id", novelId)
          .single();

        if (novelError) throw novelError;
        setNovel(novelData);

        // Fetch chapters
        // Try to exclude soft-deleted chapters; fallback if deleted_at column missing
        let chaptersData: any = null;
        let chaptersError: any = null;

        try {
          const res = await supabase
            .from("chapters")
            .select(
              `
            id,
            chapter_number,
            title,
            is_published,
            published_at,
            view_count,
            created_at,
            word_count
          `
            )
            .eq("novel_id", novelId)
            .is("deleted_at", null)
            .order("chapter_number", { ascending: true });

          chaptersData = res.data;
          chaptersError = res.error;

          if (chaptersError) {
            const msg = chaptersError.message || JSON.stringify(chaptersError);
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw new Error(msg || "Failed to fetch chapters");
            }
          }
        } catch (err) {
          console.warn(
            "Falling back to chapters query without deleted_at filter:",
            err?.message || err
          );
          const res2 = await supabase
            .from("chapters")
            .select(
              `
            id,
            chapter_number,
            title,
            is_published,
            published_at,
            view_count,
            created_at,
            word_count
          `
            )
            .eq("novel_id", novelId)
            .order("chapter_number", { ascending: true });

          chaptersData = res2.data;
          chaptersError = res2.error;
        }

        if (chaptersError) throw chaptersError;
        setChapters(chaptersData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [novelId]);

  // Filter chapters
  const filteredChapters = chapters.filter((chapter) =>
    searchQuery === ""
      ? true
      : chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.chapter_number.toString().includes(searchQuery)
  );

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

  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
    return views.toString();
  };

  // Perform publish toggle (optimistic UI and server call)
  const performTogglePublish = async (
    chapter: Chapter,
    newPublishState: boolean
  ) => {
    setUpdatingChapterId(chapter.id);
    const prev = chapters.map((c) => ({ ...c }));
    setChapters((list) =>
      list.map((c) =>
        c.id === chapter.id
          ? {
              ...c,
              is_published: newPublishState,
              published_at: newPublishState ? new Date().toISOString() : null,
            }
          : c
      )
    );

    try {
      const res = await togglePublishChapter({
        chapter_id: chapter.id,
        is_published: newPublishState,
      });

      if (!res?.success) {
        setChapters(prev);
        toast.error(res?.error || "Failed to update publish status");
        return;
      }

      toast.success(
        newPublishState ? "Chapter published" : "Chapter unpublished"
      );
    } catch (err) {
      setChapters(prev);
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update publish status"
      );
    } finally {
      setUpdatingChapterId(null);
    }
  };

  const handleToggleChapterPublish = (chapter: Chapter) => {
    const newState = !chapter.is_published;
    // Only confirm when unpublishing
    if (!newState) {
      setConfirmUnpublish({ show: true, chapter });
      return;
    }

    // Publishing - proceed immediately
    performTogglePublish(chapter, true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
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
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-800 font-medium">Error loading data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Novel not found
  if (!novel) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-800 font-medium">Novel not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin" className="hover:text-gray-900">
          Admin
        </Link>
        <span>/</span>
        <Link href="/admin/novels" className="hover:text-gray-900">
          Novels
        </Link>
        <span>/</span>
        <Link href={`/admin/novels/${novelId}`} className="hover:text-gray-900">
          {novel.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900">Chapters</span>
      </div>

      {/* Novel Info Header */}
      <div className="bg-white rounded border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{novel.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Author: {novel.authors?.name || "Unknown"}</span>
              <span>•</span>
              <span className="capitalize">{novel.status}</span>
              <span>•</span>
              <span>{novel.total_chapters || 0} chapters</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/novels/${novelId}`}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Edit Novel
            </Link>
            <Link
              href={`/truyen/${novel.slug}`}
              target="_blank"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              View Public
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Chapters</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredChapters.length} chapters
          </p>
        </div>
        <Link
          href={`/admin/novels/${novelId}/chapters/new`}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          + Add Chapter
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded border border-gray-200 p-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by chapter number or title..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        {filteredChapters.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No chapters found</p>
            {searchQuery ? (
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting your search
              </p>
            ) : (
              <Link
                href={`/admin/novels/${novelId}/chapters/new`}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Create first chapter
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Title
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase">
                    Published
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Words
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Views
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Created
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredChapters.map((chapter) => (
                  <tr
                    key={chapter.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      !chapter.is_published ? "bg-yellow-50" : ""
                    }`}
                    onClick={() =>
                      (window.location.href = `/admin/chapters/${chapter.id}`)
                    }
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">
                        {chapter.chapter_number}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">
                        {chapter.title}
                      </div>
                      {!chapter.is_published && (
                        <span className="text-xs text-yellow-700">Draft</span>
                      )}
                    </td>
                    <td
                      className="px-3 py-2 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Publish toggle */}
                      <button
                        title={
                          chapter.is_published && chapter.published_at
                            ? `Published: ${formatDate(chapter.published_at)}`
                            : chapter.is_published
                            ? "Published"
                            : "Draft"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleChapterPublish(chapter);
                        }}
                        disabled={updatingChapterId === chapter.id}
                        className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition-colors focus:outline-none ${
                          chapter.is_published ? "bg-green-600" : "bg-gray-300"
                        } ${
                          updatingChapterId === chapter.id
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span
                          className={`block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                            chapter.is_published
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-900">—</td>
                    <td className="px-3 py-2 text-right text-gray-900">
                      {formatViews(chapter.view_count || 0)}
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">
                      {formatDate(chapter.created_at)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div
                        className="flex justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/admin/chapters/${chapter.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/truyen/${novel.slug}/chuong-${chapter.chapter_number}`}
                          target="_blank"
                          className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (
                              deletingChapterId ||
                              updatingChapterId === chapter.id
                            )
                              return;

                            const confirmed = window.confirm(
                              "Delete this chapter? Readers will no longer see it."
                            );
                            if (!confirmed) return;

                            const prev = chapters;
                            // Optimistic remove
                            setChapters((list) =>
                              list.filter((c) => c.id !== chapter.id)
                            );
                            setDeletingChapterId(chapter.id);

                            try {
                              const res = await softDeleteChapter(chapter.id);
                              if (!res?.success) {
                                setChapters(prev);
                                toast.error(
                                  res?.error || "Failed to delete chapter"
                                );
                                return;
                              }

                              // success
                              toast.success("Chapter deleted");
                            } catch (err) {
                              setChapters(prev);
                              console.error(err);
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "Failed to delete chapter"
                              );
                            } finally {
                              setDeletingChapterId(null);
                            }
                          }}
                          disabled={
                            deletingChapterId === chapter.id ||
                            updatingChapterId === chapter.id
                          }
                          className={`text-red-600 hover:text-red-800 font-medium ml-2 ${
                            deletingChapterId === chapter.id ||
                            updatingChapterId === chapter.id
                              ? "opacity-60 cursor-not-allowed"
                              : ""
                          }`}
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

      {/* Confirm Unpublish Modal */}
      {confirmUnpublish.show && confirmUnpublish.chapter && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmUnpublish({ show: false, chapter: null })}
          />
          <div className="relative bg-white rounded shadow-lg max-w-md w-full p-6 z-10">
            <h3 className="text-lg font-semibold text-gray-900">
              Unpublish chapter
            </h3>
            <p className="text-sm text-gray-700 mt-2">
              Unpublish this chapter? Readers will no longer be able to read it.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() =>
                  setConfirmUnpublish({ show: false, chapter: null })
                }
                className="px-4 py-2 rounded bg-white border border-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const ch = confirmUnpublish.chapter!;
                  setConfirmUnpublish({ show: false, chapter: null });
                  // proceed with toggling to unpublished
                  await performTogglePublish(ch, false);
                }}
                className="px-4 py-2 rounded bg-red-600 text-white text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Footer */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Total Chapters</div>
            <div className="text-2xl font-bold text-gray-900">
              {chapters.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-2xl font-bold text-green-600">
              {chapters.filter((c) => c.is_published).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Drafts</div>
            <div className="text-2xl font-bold text-yellow-600">
              {chapters.filter((c) => !c.is_published).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
