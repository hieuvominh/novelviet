"use client";

import React, { useState } from "react";
import toast from "@/components/ui/toast/toast";

export interface GenreRow {
  id: string;
  name: string;
  slug: string;
}

export default function GenreList({ genres }: { genres: GenreRow[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    const ok = window.confirm(
      `Delete this genre? Existing novels will keep their category.`
    );
    if (!ok) return;

    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/genres/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.error || "Failed to delete genre");
      } else {
        toast.success(`Deleted genre ${name}`);
        // Optimistic UI: remove row
        // Simple approach: reload page
        window.location.reload();
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Slug</th>
            <th className="px-4 py-2 text-left">Novels</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {genres.map((g) => (
            <tr key={g.id}>
              <td className="px-4 py-2">{g.name}</td>
              <td className="px-4 py-2">{g.slug}</td>
              <td className="px-4 py-2">—</td>
              <td className="px-4 py-2">
                {g.id ? (
                  <a
                    className="mr-3 text-blue-600 hover:underline"
                    href={`/admin/genres/${encodeURIComponent(g.id)}/edit`}
                  >
                    Edit
                  </a>
                ) : (
                  <span className="mr-3 text-gray-500">Edit</span>
                )}
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(g.id, g.name)}
                  disabled={pendingId === g.id}
                >
                  {pendingId === g.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
