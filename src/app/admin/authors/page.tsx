"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { softDeleteAuthor } from "@/app/admin/authors/actions";

type Row = {
  id: string;
  name: string;
  slug: string;
  novelCount: number;
  totalChapters: number;
  totalViews: number;
  avgRating: number | null;
};

export default function AdminAuthors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();

        // Fetch authors (try deleted_at filter, fallback if missing)
        let authors: any[] = [];
        try {
          const res = await supabase
            .from("authors")
            .select("id, name, slug")
            .is("deleted_at", null)
            .order("name")
            .limit(200);

          if (res.error) {
            const msg = res.error.message || JSON.stringify(res.error || "");
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw res.error;
            }
          }
          authors = res.data || [];
        } catch (err) {
          const res2 = await supabase
            .from("authors")
            .select("id, name, slug")
            .order("name")
            .limit(200);
          if (res2.error) throw res2.error;
          authors = res2.data || [];
        }

        // Fetch novels for all authors in one query to remain stable with many authors
        const authorIds = authors.map((a: any) => a.id);
        let novelsForAuthors: any[] = [];
        try {
          const novRes = await supabase
            .from("novels")
            .select(
              "id, author_id, total_chapters, view_count_total, rating_average, rating_count"
            )
            .in("author_id", authorIds)
            .is("deleted_at", null);

          if (novRes.error) {
            const msg =
              novRes.error.message || JSON.stringify(novRes.error || "");
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw novRes.error;
            }
            // fallback without deleted_at filter
            const novRes2 = await supabase
              .from("novels")
              .select(
                "id, author_id, total_chapters, view_count_total, rating_average, rating_count"
              )
              .in("author_id", authorIds);
            if (novRes2.error) throw novRes2.error;
            novelsForAuthors = novRes2.data || [];
          } else {
            novelsForAuthors = novRes.data || [];
          }
        } catch (err) {
          console.error("Error fetching novels for authors:", err);
          novelsForAuthors = [];
        }

        const novelsByAuthor: Record<string, any[]> = {};
        for (const n of novelsForAuthors) {
          if (!novelsByAuthor[n.author_id]) novelsByAuthor[n.author_id] = [];
          novelsByAuthor[n.author_id].push(n);
        }

        const authorRows: Row[] = authors.map((a: any) =>
          computeRow(a, novelsByAuthor[a.id] || [])
        );

        if (!mounted) return;
        setRows(authorRows);
      } catch (err) {
        console.error("Error loading authors list:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function computeRow(a: any, novels: any[]): Row {
    const novelCount = novels.length;
    const totalChapters = novels.reduce(
      (s, n) => s + (n.total_chapters || 0),
      0
    );
    const totalViews = novels.reduce(
      (s, n) => s + (n.view_count_total || 0),
      0
    );
    const sumRatingCount = novels.reduce(
      (s, n) => s + (n.rating_count || 0),
      0
    );
    const weighted = novels.reduce(
      (s, n) => s + (n.rating_average || 0) * (n.rating_count || 0),
      0
    );
    const avgRating =
      sumRatingCount > 0
        ? Number((weighted / sumRatingCount).toFixed(2))
        : null;

    return {
      id: a.id,
      name: a.name,
      slug: a.slug,
      novelCount,
      totalChapters,
      totalViews,
      avgRating,
    };
  }

  const handleDelete = async (row: Row) => {
    if (pendingMap[row.id]) return;
    const ok = window.confirm(
      `Soft-delete author "${row.name}"? This will not delete novels.`
    );
    if (!ok) return;

    setPendingMap((m) => ({ ...m, [row.id]: true }));
    try {
      const res = await softDeleteAuthor(row.id);
      if (!res.success) {
        alert(res.error || "Failed to delete author");
      } else {
        // remove from UI
        setRows((r) => r.filter((rr) => rr.id !== row.id));
      }
    } catch (err) {
      console.error("Error deleting author:", err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setPendingMap((m) => ({ ...m, [row.id]: false }));
    }
  };

  if (loading) {
    return <div className="p-6">Loading authors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600 mt-1">Manage novel authors</p>
        </div>
        <Link
          href="/admin/authors/new"
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Author
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search authors by name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Novels
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chapters
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg rating
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows
              .filter((r) =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {row.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 font-mono">
                      {row.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {row.novelCount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {row.totalChapters.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {row.totalViews.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-gray-900">
                        {row.avgRating ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/authors/${row.id}`}
                        className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${
                          pendingMap[row.id]
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        Edit
                      </Link>

                      <Link
                        href={`/admin/novels?author=${encodeURIComponent(
                          row.slug
                        )}`}
                        className={`text-gray-600 hover:text-gray-800 text-sm font-medium ${
                          pendingMap[row.id]
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        Novels
                      </Link>

                      <button
                        onClick={() => handleDelete(row)}
                        disabled={!!pendingMap[row.id]}
                        className={`text-red-600 hover:text-red-800 text-sm font-medium ${
                          pendingMap[row.id]
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {pendingMap[row.id] ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination placeholder */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {rows.length} authors
        </div>
      </div>
    </div>
  );
}
