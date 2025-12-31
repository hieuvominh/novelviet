"use client";

import { useState } from "react";
import { AuthorNovelItem } from "./author-novel-item";

interface Novel {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
  total_chapters: number;
}

interface AuthorNovelsListProps {
  novels: Novel[];
  authorName: string;
  itemsPerPage?: number;
}

export function AuthorNovelsList({
  novels,
  authorName,
  itemsPerPage = 20,
}: AuthorNovelsListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (novels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Tác giả chưa có truyện nào.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(novels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNovels = novels.slice(startIndex, endIndex);

  return (
    <>
      <div className="space-y-4 mb-6">
        {currentNovels.map((novel) => (
          <AuthorNovelItem
            key={novel.id}
            novel={novel}
            authorName={authorName}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded border ${
                currentPage === page
                  ? "bg-yellow-400 border-yellow-400 text-black font-semibold"
                  : "bg-white border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
