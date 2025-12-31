import { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { SearchContainer } from "@/components/search/search-container";

export const revalidate = 300; // 5 minutes

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    genres?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

async function getGenres() {
  const supabase = await createClient();

  // TODO: Replace with actual database query when data is available
  // Mock genres for testing
  const mockGenres = [
    { id: "1", name: "Fantasy", slug: "fantasy", name_vi: "Huyền Huyễn" },
    { id: "2", name: "Martial Arts", slug: "martial-arts", name_vi: "Võ Hiệp" },
    { id: "3", name: "Romance", slug: "romance", name_vi: "Ngôn Tình" },
    { id: "4", name: "Urban", slug: "urban", name_vi: "Đô Thị" },
    { id: "5", name: "Action", slug: "action", name_vi: "Hành Động" },
    { id: "6", name: "Historical", slug: "historical", name_vi: "Lịch Sử" },
    { id: "7", name: "Xianxia", slug: "xianxia", name_vi: "Tiên Hiệp" },
    { id: "8", name: "Wuxia", slug: "wuxia", name_vi: "Kiếm Hiệp" },
  ];

  return mockGenres;
}

async function searchNovels(
  keyword?: string,
  genreIds?: string[],
  status?: string,
  sortBy: string = "hot",
  limit: number = 20,
  offset: number = 0
) {
  const supabase = await createClient();

  // TODO: Replace with actual database query when data is available
  // Mock data for testing
  const mockNovels = Array.from({ length: 60 }, (_, i) => ({
    id: `novel-${i + 1}`,
    title: `Truyện ${i + 1} - ${keyword || "Tất cả"}`,
    slug: `truyen-${i + 1}`,
    description: `Một câu chuyện hấp dẫn với nhiều tình tiết bất ngờ...`,
    cover_url: `https://picsum.photos/seed/search${i + 1}/400/600`,
    status: (i % 3 === 0 ? "completed" : "ongoing") as const,
    total_chapters: Math.floor(Math.random() * 500) + 50,
    view_count_total: Math.floor(Math.random() * 500000) + 10000,
    rating_average: Math.random() * 1.5 + 3.5,
    rating_count: Math.floor(Math.random() * 3000) + 100,
    last_chapter_at: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    authors: {
      name: `Tác giả ${i + 1}`,
      slug: `tac-gia-${i + 1}`,
    },
  }));

  // Apply filters
  let filtered = mockNovels;

  if (status === "completed") {
    filtered = filtered.filter((n) => n.status === "completed");
  } else if (status === "ongoing") {
    filtered = filtered.filter((n) => n.status === "ongoing");
  }

  // Apply pagination
  const paginatedResults = filtered.slice(offset, offset + limit);

  return {
    novels: paginatedResults.map((novel) => ({
      ...novel,
      author: novel.authors,
    })),
    total: filtered.length,
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const keyword = params.q;

  if (keyword) {
    return generateSEO({
      title: `Tìm kiếm: ${keyword}`,
      description: `Kết quả tìm kiếm cho "${keyword}". Khám phá hàng nghìn truyện hay, cập nhật liên tục.`,
      url: `/tim-kiem?q=${encodeURIComponent(keyword)}`,
    });
  }

  return generateSEO({
    title: "Tìm kiếm truyện",
    description:
      "Tìm kiếm và khám phá hàng nghìn truyện hay. Lọc theo thể loại, trạng thái, sắp xếp theo hot, mới nhất, đánh giá cao.",
    url: "/tim-kiem",
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const keyword = params.q || "";
  const genreFilter = params.genres?.split(",").filter(Boolean) || [];
  const statusFilter = params.status || "";
  const sortBy = params.sort || "hot";
  const page = parseInt(params.page || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  const [genres, searchResults] = await Promise.all([
    getGenres(),
    searchNovels(keyword, genreFilter, statusFilter, sortBy, limit, offset),
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <Suspense fallback={<div className="h-screen" />}>
        <SearchContainer
          initialKeyword={keyword}
          initialGenres={genreFilter}
          initialStatus={statusFilter}
          initialSort={sortBy}
          initialPage={page}
          genres={genres}
          initialResults={searchResults.novels}
          initialTotal={searchResults.total}
        />
      </Suspense>

      {/* SEO Content Block */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-paper-secondary rounded-lg border border-brown/20 p-6 prose prose-sm max-w-none">
          <h2 className="text-xl font-bold mb-4">
            Tìm Kiếm Truyện - Khám Phá Thế Giới Văn Học
          </h2>
          <p>
            Chào mừng bạn đến với trang tìm kiếm truyện của chúng tôi. Với hàng
            nghìn tác phẩm đa dạng từ nhiều thể loại khác nhau, bạn có thể dễ
            dàng tìm thấy những câu chuyện yêu thích của mình. Hệ thống tìm kiếm
            thông minh giúp bạn lọc theo thể loại, trạng thái, và sắp xếp theo
            nhiều tiêu chí như độ hot, mới cập nhật, hoặc đánh giá cao nhất.
          </p>

          <h3 className="text-lg font-bold mt-6 mb-3">Thể Loại Phổ Biến</h3>
          <div className="flex flex-wrap gap-2 not-prose">
            {genres.slice(0, 6).map((genre) => (
              <a
                key={genre.id}
                href={`/tim-kiem?genres=${genre.id}`}
                className="px-3 py-1 bg-paper hover:bg-clay hover:text-paper text-brown rounded-full text-sm transition-colors"
              >
                {genre.name_vi}
              </a>
            ))}
          </div>

          <h3 className="text-lg font-bold mt-6 mb-3">Hướng Dẫn Tìm Kiếm</h3>
          <ul>
            <li>
              <strong>Tìm theo tên:</strong> Nhập tên truyện vào ô tìm kiếm để
              tìm truyện bạn muốn đọc
            </li>
            <li>
              <strong>Tìm theo tác giả:</strong> Nhập tên tác giả để xem tất cả
              tác phẩm của họ
            </li>
            <li>
              <strong>Lọc theo thể loại:</strong> Chọn một hoặc nhiều thể loại
              để thu hẹp kết quả
            </li>
            <li>
              <strong>Lọc theo trạng thái:</strong> Chọn "Hoàn thành" hoặc "Đang
              ra" tùy theo sở thích
            </li>
            <li>
              <strong>Sắp xếp:</strong> Chọn cách sắp xếp phù hợp - Hot nhất,
              Mới cập nhật, Đánh giá cao, hoặc Lượt xem
            </li>
          </ul>

          <p className="mt-6">
            Mọi truyện đều được cập nhật thường xuyên, đảm bảo bạn luôn có những
            chương mới nhất để thưởng thức. Hãy bắt đầu hành trình khám phá văn
            học của bạn ngay hôm nay!
          </p>
        </div>
      </div>
    </div>
  );
}
