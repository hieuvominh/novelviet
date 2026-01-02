"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createChapter } from "../actions";

export default function AdminChapterNew() {
  const router = useRouter();
  const params = useParams();
  const novelId = params.id as string;

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    chapter_number: "",
    is_published: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pending) return;

    setError(null);
    setPending(true);

    try {
      const result = await createChapter({
        novel_id: novelId,
        title: formData.title,
        content: formData.content,
        chapter_number: formData.chapter_number
          ? parseInt(formData.chapter_number)
          : undefined,
        is_published: formData.is_published,
      });

      if (!result.success) {
        setError(result.error || "Failed to create chapter");
        return;
      }

      // Success - redirect to chapter editor
      router.push(`/admin/chapters/${result.data?.id}`);
    } catch (err) {
      console.error("Error creating chapter:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setPending(false);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = formData.content.replace(/\s/g, "").length;
  const readingTimeMinutes = Math.ceil(wordCount / 250);

  return (
    <div className="max-w-4xl pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/admin" className="hover:text-gray-900">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/novels" className="hover:text-gray-900">
            Novels
          </Link>
          <span>/</span>
          <Link
            href={`/admin/novels/${novelId}/chapters`}
            className="hover:text-gray-900"
          >
            Chapters
          </Link>
          <span>/</span>
          <span className="text-gray-900">New</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Chapter</h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white border border-gray-200 rounded p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter chapter title..."
                disabled={pending}
              />
            </div>

            {/* Chapter Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chapter Number
              </label>
              <input
                type="number"
                min="1"
                value={formData.chapter_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    chapter_number: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-increment if empty"
                disabled={pending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to auto-increment from last chapter
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Word Count
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                  {wordCount.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Characters
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                  {charCount.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Read Time
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700">
                  {readingTimeMinutes} min
                </div>
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_published: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  disabled={pending}
                />
                <span className="text-sm font-medium text-gray-700">
                  Publish immediately
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Chapter will be visible to readers if published
              </p>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-gray-200 rounded p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Content (Plain Text)
          </h2>
          <textarea
            required
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            rows={20}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
            style={{
              lineHeight: "1.7",
              fontFamily: "Arial, sans-serif",
            }}
            placeholder="Write your chapter content here as plain text...

Paragraphs are separated by blank lines.

Single line breaks are preserved.
Like this."
            disabled={pending}
          />
          <p className="text-xs text-gray-500 mt-2">
            Plain text format: Separate paragraphs with blank lines, single line
            breaks are preserved
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href={`/admin/novels/${novelId}/chapters`}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Creating..." : "Create Chapter"}
          </button>
        </div>
      </form>
    </div>
  );
}
