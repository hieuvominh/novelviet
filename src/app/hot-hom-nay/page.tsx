import { Metadata } from "next";
import { CategoryContent } from "@/components/category/category-content";
import { CategoryPagination } from "@/components/category/category-pagination";
import { CategoryEmptyState } from "@/components/category/category-empty-state";

export const metadata: Metadata = {
  title: "Hot Hôm Nay - Truyện Hot Nhất Hôm Nay | NovelViet",
  description:
    "Khám phá những truyện đang hot nhất hôm nay với lượt xem cao nhất. Cập nhật liên tục các truyện được yêu thích nhất.",
};

// Revalidate every 1 hour
export const revalidate = 3600;

// Generate dummy data for hot novels (sorted by daily views)
function generateDummyHotNovels(count: number = 100) {
  const genres = [
    "Huyền Huyễn",
    "Ngôn Tình",
    "Tu Tiên",
    "Võ Hiệp",
    "Đô Thị",
    "Kiếm Hiệp",
    "Khoa Huyễn",
  ];
  const statuses = ["ongoing", "completed"];

  return Array.from({ length: count }, (_, i) => ({
    id: `hot-${i + 1}`,
    title: `Truyện Hot ${i + 1}`,
    slug: `truyen-hot-${i + 1}`,
    description: `Một trong những truyện hot nhất hôm nay với lượt xem cực cao. Câu chuyện hấp dẫn, cập nhật thường xuyên, được độc giả yêu thích. Nội dung đặc sắc, nhân vật sinh động, cốt truyện gay cấn.`,
    cover_url: `https://picsum.photos/seed/hot-${i}/400/600`,
    status: statuses[Math.floor(Math.random() * statuses.length)] as
      | "ongoing"
      | "completed",
    total_chapters: Math.floor(Math.random() * 2000) + 100,
    view_count_total: Math.floor(Math.random() * 40000000) + 5000000,
    view_count_daily: Math.floor(Math.random() * 100000) + 50000, // High daily views
    rating_average: +(Math.random() * 1.5 + 3.5).toFixed(1),
    rating_count: Math.floor(Math.random() * 15000) + 1000,
    last_chapter_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    author: {
      name: `Tác giả ${i + 1}`,
      slug: `tac-gia-${i + 1}`,
    },
    genres: [
      {
        id: `genre-${i}`,
        name: genres[Math.floor(Math.random() * genres.length)],
        slug: genres[Math.floor(Math.random() * genres.length)]
          .toLowerCase()
          .replace(/ /g, "-"),
      },
    ],
  }));
}

async function getHotNovels(page: number = 1, perPage: number = 24) {
  // const supabase = await createClient();

  // const from = (page - 1) * perPage;
  // const to = from + perPage - 1;

  // const { data, error, count } = await supabase
  //   .from("novels")
  //   .select(
  //     `
  //     id,
  //     title,
  //     slug,
  //     description,
  //     cover_url,
  //     status,
  //     total_chapters,
  //     view_count_total,
  //     view_count_daily,
  //     rating_average,
  //     rating_count,
  //     last_chapter_at,
  //     authors!inner(name, slug),
  //     novel_genres!inner(genres!inner(id, name, slug))
  //   `,
  //     { count: "exact" }
  //   )
  //   .eq("is_published", true)
  //   .order("view_count_daily", { ascending: false })
  //   .order("rating_average", { ascending: false })
  //   .range(from, to);

  // if (error) {
  //   console.error("Error fetching hot novels:", error);
  //   return { novels: [], total: 0 };
  // }

  // const novels = data.map((novel) => ({
  //   ...novel,
  //   author:
  //     Array.isArray(novel.authors) && novel.authors.length > 0
  //       ? novel.authors[0]
  //       : null,
  //   genres: novel.novel_genres?.map((ng: any) => ng.genres) || [],
  // }));

  // return {
  //   novels: novels.filter((n) => n.author !== null),
  //   total: count || 0,
  // };

  // Using dummy data
  const allNovels = generateDummyHotNovels(100);
  // Sort by daily views descending
  const sortedNovels = allNovels.sort(
    (a, b) => b.view_count_daily - a.view_count_daily
  );
  const from = (page - 1) * perPage;
  const to = from + perPage;

  return {
    novels: sortedNovels.slice(from, to),
    total: allNovels.length,
  };
}

export default async function HotHomNayPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const perPage = 24;

  const { novels, total } = await getHotNovels(currentPage, perPage);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">🔥 Hot Hôm Nay</h1>
        <p className="text-muted-foreground">
          Những truyện đang hot nhất hôm nay với lượt xem cao nhất. Tổng cộng{" "}
          <span className="font-semibold text-foreground">{total}</span> truyện
        </p>
      </div>

      {/* Novels Grid/List */}
      {novels.length > 0 ? (
        <>
          <CategoryContent novels={novels} />

          {/* Pagination */}
          {totalPages > 1 && (
            <CategoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/hot-hom-nay"
            />
          )}
        </>
      ) : (
        <CategoryEmptyState
          title="Chưa có truyện hot"
          description="Hiện tại chưa có truyện hot nào. Vui lòng quay lại sau!"
        />
      )}
    </div>
  );
}
