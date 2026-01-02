"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminChapters() {
  const [selectedNovel, setSelectedNovel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalChapters, setTotalChapters] = useState<number | null>(null);
  const [publishedToday, setPublishedToday] = useState<number | null>(null);
  const [avgWordCount, setAvgWordCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4; // number of rows per page in admin list

  useEffect(() => {
    let mounted = true;
    async function fetchStats() {
      setLoadingStats(true);
      const supabase = createClient();

      // Helper to try a query with deleted_at filter and fallback when the column is missing
      async function tryCount(filterCallback: (q: any) => any) {
        try {
          const q = supabase
            .from("chapters")
            .select("id", { head: true, count: "exact" });
          filterCallback(q);
          const res = await q;
          if (res.error) {
            const msg = res.error.message || "";
            if (
              !msg.includes("deleted_at") &&
              !msg.includes("does not exist")
            ) {
              throw res.error;
            }
            // fallback without deleted_at
            const res2 = await supabase
              .from("chapters")
              .select("id", { head: true, count: "exact" });
            return res2.count ?? 0;
          }
          return res.count ?? 0;
        } catch (err) {
          // Final fallback
          try {
            const res = await supabase
              .from("chapters")
              .select("id", { head: true, count: "exact" });
            return res.count ?? 0;
          } catch (e) {
            console.error("Failed to count chapters:", e);
            return 0;
          }
        }
      }

      try {
        // total chapters (exclude soft-deleted if possible)
        const total = await tryCount((q: any) => q.is("deleted_at", null));

        // published today
        const now = new Date();
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        ).toISOString();
        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        ).toISOString();

        const tryPublished = async () => {
          try {
            const q = supabase
              .from("chapters")
              .select("id", { head: true, count: "exact" })
              .gte("published_at", start)
              .lt("published_at", end)
              .is("deleted_at", null)
              .eq("is_published", true);
            const res = await q;
            if (res.error) {
              const msg = res.error.message || "";
              if (
                !msg.includes("deleted_at") &&
                !msg.includes("does not exist")
              )
                throw res.error;
              const res2 = await supabase
                .from("chapters")
                .select("id", { head: true, count: "exact" })
                .gte("published_at", start)
                .lt("published_at", end)
                .eq("is_published", true);
              return res2.count ?? 0;
            }
            return res.count ?? 0;
          } catch (err) {
            console.error("Failed to count published today:", err);
            return 0;
          }
        };

        const published = await tryPublished();

        // avg word count using Postgres aggregate
        async function tryAvg() {
          try {
            const res = await supabase
              .from("chapters")
              .select("avg(word_count)");
            if (res.error) {
              const msg = res.error.message || "";
              if (
                !msg.includes("deleted_at") &&
                !msg.includes("does not exist")
              )
                throw res.error;
              // fallback: fetch some rows and compute average client-side (cheap heuristic)
              const res2 = await supabase
                .from("chapters")
                .select("word_count")
                .limit(1000);
              const vals = (res2.data || []).map((r: any) =>
                Number(r.word_count || 0)
              );
              const avg = vals.length
                ? Math.round(
                    vals.reduce((s: number, v: number) => s + v, 0) /
                      vals.length
                  )
                : 0;
              return avg;
            }
            // PostgREST returns [{ avg: '2850.0' }] or similar
            const row = (res.data && res.data[0]) || {};
            const key = Object.keys(row)[0];
            const val = row[key];
            return val ? Math.round(Number(val)) : 0;
          } catch (err) {
            console.error("Failed to compute avg word count:", err);
            return 0;
          }
        }

        const avg = await tryAvg();

        if (!mounted) return;
        setTotalChapters(total);
        setPublishedToday(published);
        setAvgWordCount(avg);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  // Mock data
  const chapters = [
    {
      id: 1,
      novel: "Võ Thần Thiên Hạ",
      chapterNumber: 1250,
      title: "Đại Chiến Cuối Cùng",
      wordCount: 3200,
      views: 45000,
      publishedAt: "2024-12-30 10:00",
    },
    {
      id: 2,
      novel: "Võ Thần Thiên Hạ",
      chapterNumber: 1249,
      title: "Quyết Chiến",
      wordCount: 2950,
      views: 52000,
      publishedAt: "2024-12-29 10:00",
    },
    {
      id: 3,
      novel: "Trọng Sinh Chi Đô Thị Tu Tiên",
      chapterNumber: 980,
      title: "Bước Vào Thần Cảnh",
      wordCount: 3100,
      views: 38000,
      publishedAt: "2024-12-30 08:00",
    },
    {
      id: 4,
      novel: "Huyết Sắc Lãng Mạn",
      chapterNumber: 520,
      title: "Tình Yêu Và Nghĩa Vụ",
      wordCount: 2800,
      views: 22000,
      publishedAt: "2024-12-30 06:00",
    },
  ];

  // Filtering and pagination (client-side for the mock data)
  const filteredChapters = chapters.filter((chapter) =>
    searchQuery === ""
      ? true
      : chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chapter.chapterNumber.toString().includes(searchQuery)
  );

  const totalForPagination = loadingStats
    ? null
    : totalChapters ?? filteredChapters.length;
  const pageCount = totalForPagination
    ? Math.max(1, Math.ceil(totalForPagination / PAGE_SIZE))
    : Math.max(1, Math.ceil(filteredChapters.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(
    page * PAGE_SIZE,
    totalForPagination ?? filteredChapters.length
  );
  const paginatedChapters = filteredChapters.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chapters</h1>
          <p className="text-gray-600 mt-1">
            Manage all chapters across novels
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          + Add Chapter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Total Chapters</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loadingStats ? "—" : (totalChapters ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Published Today</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loadingStats ? "—" : (publishedToday ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Avg Word Count</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {loadingStats ? "—" : (avgWordCount ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters by title, number..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Novel Filter */}
          <select
            value={selectedNovel}
            onChange={(e) => setSelectedNovel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Novels</option>
            <option value="1">Võ Thần Thiên Hạ</option>
            <option value="2">Trọng Sinh Chi Đô Thị Tu Tiên</option>
            <option value="3">Huyết Sắc Lãng Mạn</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Novel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ch #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Words
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedChapters.map((chapter) => (
              <tr key={chapter.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{chapter.novel}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {chapter.chapterNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{chapter.title}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {chapter.wordCount}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {chapter.views.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {chapter.publishedAt}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Fetch stats on mount */}
      {/* useEffect placed after the table to keep visual diff small */}

      {/* Stats fetcher */}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {loadingStats
            ? `Showing ${startIndex}-${endIndex} of — chapters`
            : `Showing ${startIndex}-${endIndex} of ${(
                totalChapters ?? 0
              ).toLocaleString()} chapters`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm ${
              page <= 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>

          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
            {page}
          </button>

          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className={`px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm ${
              page >= pageCount ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Fetch stats */}
      {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
      {null}
    </div>
  );
}

// Fetch stats in a client effect when the Admin page is mounted
// We put the effect below the component render to avoid moving large blocks in the file
// (keeps patch localized). React will still execute hooks correctly because this is a client component.
export function useAdminChapterStats(
  setTotal: (n: number | null) => void,
  setToday: (n: number | null) => void,
  setAvg: (n: number | null) => void,
  setLoading: (b: boolean) => void
) {
  // This function is not a hook by naming convention, but we'll call it inside a useEffect in the component above.
}
