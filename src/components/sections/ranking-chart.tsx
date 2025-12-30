"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Novel {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  description: string;
  author: {
    name: string;
    slug: string;
  };
}

interface RankingChartProps {
  risingNovels: Novel[];
  newReleasesNovels: Novel[];
  popularityNovels: Novel[];
}

type ChartType = "rising" | "new-releases" | "popularity";

// Mock ranking data - in production, fetch from backend
const getRankingData = (novel: Novel, index: number, chartType: ChartType) => {
  const rank = index + 1;

  // Different badge styles for different ranks
  const getBadgeStyle = () => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-yellow-400 text-white";
    if (rank === 3) return "bg-yellow-300 text-white";
    return "bg-yellow-200 text-gray-800";
  };

  // Mock ranking change data
  const getRankingChange = () => {
    if (chartType === "rising") {
      if (index === 0)
        return { text: "One place up", color: "text-orange-500" };
      if (index === 1)
        return { text: "One place up", color: "text-orange-500" };
      if (index === 2)
        return { text: "One place up", color: "text-orange-500" };
      if (index === 3)
        return { text: "Rise 7 places", color: "text-orange-500" };
      if (index === 4)
        return { text: "Rise 83 places", color: "text-orange-500" };
      if (index === 5)
        return { text: "Rise 15 places", color: "text-orange-500" };
      if (index === 6)
        return { text: "Rise 6 places", color: "text-orange-500" };
      if (index === 7) return { text: "New dark horse", color: "text-red-500" };
      if (index === 8) return { text: "New dark horse", color: "text-red-500" };
    }
    if (chartType === "new-releases") {
      return { text: "New", color: "text-green-500" };
    }
    if (chartType === "popularity") {
      if (index < 3) return { text: "Stable", color: "text-blue-500" };
      return { text: "Rising", color: "text-orange-500" };
    }
    return null;
  };

  return {
    rank,
    badgeStyle: getBadgeStyle(),
    change: getRankingChange(),
  };
};

export function RankingChart({
  risingNovels,
  newReleasesNovels,
  popularityNovels,
}: RankingChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>("rising");

  const charts = {
    rising: { label: "Rising Chart", novels: risingNovels },
    "new-releases": { label: "New Releases Chart", novels: newReleasesNovels },
    popularity: { label: "Popularity Chart", novels: popularityNovels },
  };

  const currentNovels = charts[activeChart].novels;

  return (
    <section className="bg-[#5a1e1e] py-8">
      <div className="container mx-auto px-4">
        {/* Header with Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-6">
            {(Object.keys(charts) as ChartType[]).map((chartType) => (
              <button
                key={chartType}
                onClick={() => setActiveChart(chartType)}
                className={`text-lg font-medium transition-all pb-2 ${
                  activeChart === chartType
                    ? "text-white border-b-2 border-white font-bold"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                {charts[chartType].label}
              </button>
            ))}
          </div>
          <Link
            href="/bang-xep-hang"
            className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded transition-colors"
          >
            More lists
          </Link>
        </div>

        {/* Ranking Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentNovels.map((novel, index) => {
            const rankingData = getRankingData(novel, index, activeChart);

            return (
              <Link
                key={novel.id}
                href={`/truyen/${novel.slug}`}
                className="group block"
              >
                {/* Card Container */}
                <div className="relative">
                  {/* Cover Image */}
                  <div className="relative aspect-[1.6] overflow-hidden rounded shadow-md mb-2 bg-muted">
                    <Image
                      src={novel.cover_url || "/placeholder-cover.jpg"}
                      alt={novel.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Rank Badge */}
                    <div
                      className={`absolute top-2 left-2 ${rankingData.badgeStyle} px-2 py-1 rounded font-bold text-xs`}
                    >
                      TOP{rankingData.rank}
                    </div>

                    {/* Ranking Change Badge */}
                    {rankingData.change && (
                      <div
                        className={`absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded text-xs font-medium ${rankingData.change.color} flex items-center gap-1`}
                      >
                        <span>↑</span>
                        <span>{rankingData.change.text}</span>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium line-clamp-1 mb-1 text-white group-hover:text-yellow-300 transition-colors">
                    {novel.title}
                  </h3>

                  {/* Author */}
                  <p className="text-xs text-white/60 line-clamp-1 mb-1">
                    {novel.author.name}
                  </p>

                  {/* Description */}
                  <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                    {novel.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
