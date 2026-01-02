"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import CoverUploader from "@/components/admin/cover-uploader";
import { createNovel, updateNovel } from "@/app/admin/novels/actions";

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
  initialAuthors?: Author[];
  initialGenres?: Genre[];
}

type Author = {
  id: string;
  name: string;
};

type Genre = {
  id: string;
  name: string;
};

export default function NovelForm({
  mode,
  novelId,
  initialAuthors,
  initialGenres,
}: NovelFormProps) {
  const router = useRouter();
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(mode === "edit");
  const [pending, setPending] = useState(false);
  const [authors, setAuthors] = useState<Author[]>(initialAuthors || []);
  const [genres, setGenres] = useState<Genre[]>(initialGenres || []);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch authors and genres
  useEffect(() => {
    // If server passed initial lists, skip client-side fetch (avoids RLS/anon issues)
    if (initialAuthors || initialGenres) return;

    async function fetchData() {
      try {
        const supabase = createClient();

        // Fetch authors (try deleted_at filter, fallback if column missing)
        let authorsData: any = null;
        try {
          const res = await supabase
            .from("authors")
            .select("id, name")
            .is("deleted_at", null)
            .order("name");

          if (res.error) {
            const msg = res.error.message || JSON.stringify(res.error || "");
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw new Error(res.error.message || JSON.stringify(res.error));
            }
            // else fall through to fallback
          }

          authorsData = res.data;
        } catch (err) {
          console.warn(
            "Falling back to authors query without deleted_at filter:",
            err?.message || err
          );
          const res2 = await supabase
            .from("authors")
            .select("id, name")
            .order("name");
          if (res2.error)
            throw new Error(res2.error.message || JSON.stringify(res2.error));
          authorsData = res2.data;
        }

        setAuthors(authorsData || []);

        // Fetch genres (try deleted_at filter, fallback if column missing)
        let genresData: any = null;
        try {
          const res = await supabase
            .from("genres")
            .select("id, name")
            .is("deleted_at", null)
            .order("name");

          if (res.error) {
            const msg = res.error.message || JSON.stringify(res.error || "");
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw new Error(res.error.message || JSON.stringify(res.error));
            }
          }

          genresData = res.data;
        } catch (err) {
          console.warn(
            "Falling back to genres query without deleted_at filter:",
            err?.message || err
          );
          const res2 = await supabase
            .from("genres")
            .select("id, name")
            .order("name");
          if (res2.error)
            throw new Error(res2.error.message || JSON.stringify(res2.error));
          genresData = res2.data;
        }

        setGenres(genresData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : JSON.stringify(err));
      }
    }

    fetchData();
  }, []);

  // Load existing novel data if editing
  useEffect(() => {
    if (mode === "edit" && novelId) {
      async function fetchNovel() {
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
              description,
              status,
              is_published,
              cover_url,
              author_id,
              novel_genres (
                genre_id
              )
            `
            )
            .eq("id", novelId)
            .is("deleted_at", null)
            .single();

          if (fetchError)
            throw new Error(fetchError.message || JSON.stringify(fetchError));

          if (data) {
            setFormData({
              title: data.title,
              slug: data.slug,
              status: data.status,
              isPublished: data.is_published,
              authorId: data.author_id,
              genreIds: data.novel_genres?.map((ng: any) => ng.genre_id) || [],
              description: data.description || "",
              coverUrl: data.cover_url || "",
            });
            setAutoSlug(false);
          }
        } catch (err) {
          console.error("Error fetching novel:", err);
          setError("Failed to load novel data");
        } finally {
          setLoading(false);
        }
      }

      fetchNovel();
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

  const handleSubmit = async (action: "draft" | "publish") => {
    if (pending) return;
    setPending(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        author_id: formData.authorId,
        status: formData.status,
        is_published: action === "publish",
        cover_url: formData.coverUrl || null,
        genre_ids: formData.genreIds,
      } as any;

      if (mode === "create") {
        const res = await createNovel(payload);
        if (!res.success) {
          setError(res.error || "Failed to create novel");
          return;
        }
        router.push("/admin/novels");
      } else {
        if (!novelId) {
          setError("Missing novel id");
          return;
        }

        const res = await updateNovel({ novel_id: novelId, ...payload });
        if (!res.success) {
          setError(res.error || "Failed to update novel");
          return;
        }

        router.push("/admin/novels");
      }
    } catch (err) {
      console.error("Error saving novel:", err);
      setError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setPending(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="mb-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded border border-gray-200 p-6">
          <div className="h-8 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-8 w-full bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

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
              className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 cursor-pointer"
            >
              Manage Chapters
            </Link>
          )}
        </div>
      </div>

      {typeof initialGenres !== "undefined" && initialGenres.length === 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Genres list is empty. Are you signed in? Server-side fetch may be
            blocked by RLS.
          </p>
        </div>
      )}

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
              {authors.map((author) => (
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

          {genres.length === 0 ? (
            <div className="text-sm text-gray-600">
              No genres available. Create one in{" "}
              <a
                className="text-blue-600 hover:underline"
                href="/admin/genres/new"
              >
                Admin → Genres
              </a>
              .
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                    formData.genreIds.includes(genre.id)
                      ? "bg-blue-600 text-white border-blue-600 cursor-pointer"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-500 cursor-pointer"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          )}
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
              <CoverUploader
                initialUrl={formData.coverUrl || null}
                onUploaded={(url) =>
                  setFormData((prev) => ({ ...prev, coverUrl: url || "" }))
                }
              />
            </div>
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

              <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("publish")}
              disabled={!canPublish}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
