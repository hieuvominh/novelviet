"use client";

import React, { useEffect, useState } from "react";
import toast from "@/components/ui/toast/toast";

export type GenreFormProps = {
  initial?: {
    id?: string;
    name: string;
    slug: string;
    description?: string | null;
  };
  mode: "create" | "edit";
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function GenreForm({ initial, mode }: GenreFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(name || ""));
    }
  }, [name, slugTouched]);

  function onSlugChange(v: string) {
    setSlugTouched(true);
    setSlug(v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors({ name: "Name is required" });
      return;
    }

    if (!slug.trim()) {
      setErrors({ slug: "Slug is required" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
      };
      const endpoint =
        mode === "create"
          ? "/api/admin/genres"
          : `/api/admin/genres/${initial?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        const err = data?.error || "Failed to save";
        // naive parse of field errors
        if (err.toLowerCase().includes("name"))
          setErrors((s) => ({ ...s, name: err }));
        else if (err.toLowerCase().includes("slug"))
          setErrors((s) => ({ ...s, slug: err }));
        else toast.error(err);
      } else {
        toast.success("Saved");
        // navigate back to list
        window.location.href = "/admin/genres";
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          className="mt-1 block w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Slug</label>
        <input
          className="mt-1 block w-full border px-3 py-2 rounded"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          disabled={submitting}
        />
        {errors.slug && (
          <p className="text-red-600 text-sm mt-1">{errors.slug}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 block w-full border px-3 py-2 rounded"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
          disabled={submitting}
          rows={4}
        />
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
