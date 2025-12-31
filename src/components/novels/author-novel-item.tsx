"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface AuthorNovelItemProps {
  novel: {
    id: string;
    title: string;
    slug: string;
    cover_url: string | null;
    status: "draft" | "ongoing" | "completed" | "hiatus" | "dropped";
    total_chapters: number;
  };
  authorName: string;
}

export function AuthorNovelItem({ novel, authorName }: AuthorNovelItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-4 items-center border-b pb-4 border-gray-400">
      {/* Cover Image */}
      <Link href={`/truyen/${novel.slug}`} className="flex-shrink-0">
        <div className="relative w-32 h-20 rounded overflow-hidden bg-gray-100">
          {!imageError ? (
            <Image
              src={novel.cover_url || "/placeholder-cover.jpg"}
              alt={novel.title}
              fill
              className="object-cover"
              sizes="128px"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-xs">
              No Image
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link
            href={`/truyen/${novel.slug}`}
            className="font-semibold hover:text-primary line-clamp-1"
          >
            {novel.title}
          </Link>
          {novel.status === "completed" && (
            <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded">
              Full
            </span>
          )}
          {novel.status === "ongoing" && (
            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded">
              Hot
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 italic">{authorName}</p>
      </div>

      {/* Chapter Count */}
      <Link
        href={`/truyen/${novel.slug}`}
        className="text-blue-600 hover:underline text-sm flex-shrink-0"
      >
        Chương {novel.total_chapters}
      </Link>
    </div>
  );
}
