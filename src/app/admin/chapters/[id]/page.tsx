"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Chapter = {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_published: boolean;
  word_count: number;
};

type Novel = {
  id: string;
  title: string;
  slug: string;
};

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChapterEditor chapterId={id} />;
}

function ChapterEditor({ chapterId }: { chapterId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch chapter data
  useEffect(() => {
    async function fetchChapter() {
      try {
        setLoading(true);
        setError(null);
        const supabase = createClient();

        // Fetch chapter; try to exclude soft-deleted rows explicitly
        let chapterData: any = null;
        try {
          const res = await supabase
            .from("chapters")
            .select("*")
            .eq("id", chapterId)
            .is("deleted_at", null)
            .single();

          chapterData = res.data;
          if (res.error) {
            const msg = res.error.message || JSON.stringify(res.error || "");
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw res.error;
            }
          }
        } catch (err) {
          // Fallback to query without deleted_at filter if column missing
          console.warn(
            "Falling back to chapter query without deleted_at filter:",
            err?.message || err
          );
          const res2 = await supabase
            .from("chapters")
            .select("*")
            .eq("id", chapterId)
            .single();
          if (res2.error) throw res2.error;
          chapterData = res2.data;
        }

        setChapter(chapterData);

        // Set form values
        setTitle(chapterData.title);
        setChapterNumber(chapterData.chapter_number);
        setContent(chapterData.content || "");
        setIsPublished(chapterData.is_published);

        // Fetch novel (include deleted_at for safety checks)
        let novelData: any = null;
        try {
          // Fetch novel and ensure it's not soft-deleted
          try {
            const res = await supabase
              .from("novels")
              .select("id, title, slug, deleted_at")
              .eq("id", chapterData.novel_id)
              .is("deleted_at", null)
              .single();

            novelData = res.data;
            if (res.error) {
              const msg = res.error.message || JSON.stringify(res.error || "");
              if (
                !msg.includes("deleted_at") &&
                !msg.includes("does not exist")
              ) {
                throw res.error;
              }
            }
          } catch (err) {
            console.warn(
              "Falling back to novel query without deleted_at filter:",
              err?.message || err
            );
            const fallback = await supabase
              .from("novels")
              .select("id, title, slug")
              .eq("id", chapterData.novel_id)
              .single();
            if (fallback.error) throw fallback.error;
            novelData = { ...fallback.data, deleted_at: null };
          }
        } catch (err) {
          throw err;
        }

        setNovel(novelData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch chapter"
        );
        console.error("Error fetching chapter:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChapter();
  }, [chapterId]);

  // Track unsaved changes
  useEffect(() => {
    if (!chapter) return;

    const changed =
      title !== chapter.title ||
      content !== (chapter.content || "") ||
      isPublished !== chapter.is_published;

    setHasUnsavedChanges(changed);
  }, [title, content, isPublished, chapter]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Basic scroll sync
  const handleContentScroll = () => {
    if (!contentRef.current || !previewRef.current || !showPreview) return;

    const scrollPercentage =
      contentRef.current.scrollTop /
      (contentRef.current.scrollHeight - contentRef.current.clientHeight);

    previewRef.current.scrollTop =
      scrollPercentage *
      (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };

  // Calculate word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  // Calculate character count (excluding whitespace)
  const charCount = content.replace(/\s/g, "").length;

  // Calculate reading time (250 words per minute)
  const readingTimeMinutes = Math.ceil(wordCount / 250);

  // Convert plain text to HTML for preview
  const renderTextAsHTML = (text: string) => {
    if (!text) return [];

    // Split by double newlines to get paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, index) => {
      // Replace single newlines with <br /> within paragraphs
      const lines = para.split("\n");
      return (
        <p key={index} className="mb-4">
          {lines.map((line, lineIndex) => (
            <span key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    });
  };

  // Save chapter
  const handleSave = async (publish: boolean = false) => {
    try {
      setSaving(true);
      setError(null);
      const supabase = createClient();

      // Prevent publishing deleted chapter or chapters whose novel is deleted
      if (
        publish &&
        ((chapter as any).deleted_at || (novel as any).deleted_at)
      ) {
        setError(
          "Cannot publish a deleted chapter or a chapter whose novel is deleted."
        );
        setSaving(false);
        return;
      }

      const updateData = {
        title,
        content,
        word_count: wordCount,
        is_published: publish ? true : isPublished,
        ...(publish && !isPublished
          ? { published_at: new Date().toISOString() }
          : {}),
      };

      const { error: updateError } = await supabase
        .from("chapters")
        .update(updateData)
        .eq("id", chapterId);

      if (updateError) throw updateError;

      // Update local state
      setIsPublished(publish ? true : isPublished);
      setHasUnsavedChanges(false);

      // Show success message briefly
      setTimeout(() => {
        // Could add toast notification here
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save chapter");
      console.error("Error saving chapter:", err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish state without saving other fields
  const handleTogglePublish = async () => {
    // Prevent multiple actions
    if (saving) return;

    const newPublishState = !isPublished;

    // Confirm when unpublishing
    if (!newPublishState) {
      const confirmed = window.confirm(
        "Are you sure you want to unpublish this chapter? It will no longer be visible to readers."
      );
      if (!confirmed) return;
    }

    // Prevent publishing if chapter or novel is deleted
    if (
      newPublishState &&
      ((chapter as any).deleted_at || (novel as any).deleted_at)
    ) {
      setError(
        "Cannot publish a deleted chapter or a chapter whose novel is deleted."
      );
      return;
    }

    const prevPublished = isPublished;

    // Optimistic update
    setIsPublished(newPublishState);
    setSaving(true);

    try {
      const supabase = createClient();

      const updateData: any = { is_published: newPublishState };
      if (newPublishState && !prevPublished) {
        updateData.published_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("chapters")
        .update(updateData)
        .eq("id", chapterId);

      if (updateError) throw updateError;

      // Persist change to chapter state
      setChapter((c) => (c ? { ...c, is_published: newPublishState } : c));
      setHasUnsavedChanges(false);
    } catch (err) {
      // Revert optimistic update
      setIsPublished(prevPublished);
      setError(
        err instanceof Error ? err.message : "Failed to update publish status"
      );
      console.error("Error toggling publish state:", err);
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex-1 flex">
          <div className="flex-1 p-6">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !chapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-medium">Error loading chapter</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/novels/${novel.id}/chapters`}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            ← Back to Novel
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {novel.title}
            </h1>
            <p className="text-xs text-gray-500">
              Chapter {chapterNumber} {hasUnsavedChanges && "• Unsaved changes"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>

          {/* Error Display */}
          {error && <span className="text-sm text-red-600">{error}</span>}

          {/* Save Draft */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !hasUnsavedChanges}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : isPublished ? "Update" : "Save Draft"}
          </button>

          {/* Publish / Unpublish (toggles publish state only) */}
          <button
            onClick={() => handleTogglePublish()}
            disabled={saving}
            className={`px-4 py-2 text-sm font-medium text-white rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
              isPublished
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Form & Editor */}
        <div
          className={`${
            showPreview ? "w-1/2" : "w-full"
          } flex flex-col border-r border-gray-200 bg-white`}
        >
          {/* Form Fields */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Chapter 1: The Beginning"
              />
            </div>

            {/* Chapter Number & Stats */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Number
                </label>
                <input
                  type="number"
                  value={chapterNumber}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Word Count
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {wordCount.toLocaleString()}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Characters
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {charCount.toLocaleString()}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Read Time
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {readingTimeMinutes} min
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div
                  className={`px-3 py-2 border rounded-lg text-center font-medium ${
                    isPublished
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-yellow-300 bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {isPublished ? "Published" : "Draft"}
                </div>
              </div>
            </div>
          </div>

          {/* Content Textarea */}
          <div className="flex-1 flex flex-col p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content (Plain Text)
            </label>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onScroll={handleContentScroll}
              className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none leading-relaxed"
              style={{
                lineHeight: "1.7",
                fontFamily: "Arial, sans-serif",
              }}
              placeholder="Write your chapter content here as plain text...

Paragraphs are separated by blank lines.

Single line breaks are preserved.
Like this."
            />
          </div>
        </div>

        {/* Right: Live Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-700">
                Live Preview
              </h2>
            </div>
            <div ref={previewRef} className="flex-1 overflow-y-auto p-6">
              <article className="max-w-none">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">
                  {title || "Chapter Title"}
                </h1>
                {content ? (
                  <div
                    className="text-gray-800 leading-relaxed"
                    style={{ lineHeight: "1.8" }}
                  >
                    {renderTextAsHTML(content)}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">
                    Start typing to see the preview...
                  </p>
                )}
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
