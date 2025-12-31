"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NovelFormData {
  title: string;
  slug: string;
  status: "ongoing" | "completed" | "hiatus" | "dropped";
  isPublished: boolean;
  authorId: string;
  genreIds: string[];
  description: string;
  coverUrl: string;
}

interface NovelFormProps {
  mode: "create" | "edit";
  novelId?: string;
}

// Mock authors
const mockAuthors = [
  { id: "1", name: "Thiên Tàm Thổ Đậu" },
  { id: "2", name: "Ngã Ái Đại Mễ Miểu" },
  { id: "3", name: "Cố Mạn" },
  { id: "4", name: "Dạ Thần Cánh" },
  { id: "5", name: "Hạ Thập Nhị" },
];

// Mock genres
const mockGenres = [
  { id: "1", name: "Huyền Huyễn" },
  { id: "2", name: "Võ Hiệp" },
  { id: "3", name: "Ngôn Tình" },
  { id: "4", name: "Tu Tiên" },
  { id: "5", name: "Đô Thị" },
  { id: "6", name: "Kiếm Hiệp" },
  { id: "7", name: "Cổ Đại" },
  { id: "8", name: "Khoa Huyễn" },
];

export function NovelForm({ mode, novelId }: NovelFormProps) {
  const router = useRouter();
  const [autoSlug, setAutoSlug] = useState(true);
  const [formData, setFormData] = useState<NovelFormData>({
    title: "",
    slug: "",
    status: "ongoing",
    isPublished: false,
    authorId: "",
    genreIds: [],
    description: "",
    coverUrl: "",
  });

  // Load existing novel data if editing
  useEffect(() => {
    if (mode === "edit" && novelId) {
      // Mock data - in real app, fetch from API
      setFormData({
        title: "Võ Thần Thiên Hạ",
        slug: "vo-than-thien-ha",
        status: "ongoing",
        isPublished: true,
        authorId: "1",
        genreIds: ["1", "2"],
        description:
          "Một thiếu niên bình thường bước vào con đường tu luyện võ đạo, vượt qua muôn vàn thử thách để trở thành võ thần tối cao.",
        coverUrl: "https://picsum.photos/seed/novel1/400/600",
      });
      setAutoSlug(false);
    }
  }, [mode, novelId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, autoSlug]);

  const handleSubmit = (action: "draft" | "publish") => {
    const payload = {
      ...formData,
      isPublished: action === "publish",
    };
    console.log(
      `${mode === "create" ? "Creating" : "Updating"} novel:`,
      payload
    );
    alert(`Novel ${action === "publish" ? "published" : "saved as draft"}!`);
    router.push("/admin/novels");
  };

  const handleCancel = () => {
    router.push("/admin/novels");
  };

  const toggleGenre = (genreId: string) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  const canPublish = formData.title.trim().length > 0;

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
          <span className="text-gray-900">
            {mode === "create" ? "New Novel" : "Edit Novel"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? "Create New Novel" : "Edit Novel"}
          </h1>
          {mode === "edit" && novelId && (
            <Link
              href={`/admin/novels/${novelId}/chapters`}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700"
            >
              Manage Chapters
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter novel title..."
            />
          </div>

          {/* Slug */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded"
                />
                Auto-generate
              </label>
            </div>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoSlug(false);
                setFormData((prev) => ({ ...prev, slug: e.target.value }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="novel-slug"
            />
          </div>

          {/* Status & Published */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as NovelFormData["status"],
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Published
              </label>
              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublished: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {formData.isPublished ? "Published" : "Draft"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Author Section */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Author</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Author <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.authorId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, authorId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select an author --</option>
              {mockAuthors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Genres Section */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {mockGenres.map((genre) => (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.id)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  formData.genreIds.includes(genre.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selected: {formData.genreIds.length} genre(s)
          </p>
        </div>

        {/* Description Section */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Description
          </h2>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="Enter novel description... (Markdown supported)"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length} characters
          </p>
        </div>

        {/* Cover Section */}
        <div className="bg-white rounded border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Cover Image
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.coverUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, coverUrl: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              {formData.coverUrl ? (
                <img
                  src={formData.coverUrl}
                  alt="Cover preview"
                  className="w-32 h-48 object-cover rounded border border-gray-300"
                />
              ) : (
                <div className="w-32 h-48 bg-gray-100 rounded border border-gray-300 flex items-center justify-center text-gray-400 text-sm">
                  No image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 px-6 py-4 z-10">
        <div className="max-w-4xl flex items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            {!canPublish && (
              <span className="text-red-600">
                * Title is required to publish
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("publish")}
              disabled={!canPublish}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
