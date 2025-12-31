import { Metadata } from "next";
import { CategoryContent } from "@/components/category/category-content";
import { CategoryPagination } from "@/components/category/category-pagination";
import { CategoryEmptyState } from "@/components/category/category-empty-state";

export const metadata: Metadata = {
  title: "Siêu Phẩm Đang Hot - Truyện Chất Lượng Cao | NovelViet",
  description:
    "Tuyển tập những siêu phẩm truyện đang hot với đánh giá cao nhất. Những tác phẩm xuất sắc được độc giả yêu thích.",
};

// Revalidate every 1 hour
export const revalidate = 3600;

// Generate dummy data for masterpiece novels (high ratings)
function generateDummyMasterpieceNovels(count: number = 100) {
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
    id: `masterpiece-${i + 1}`,
    title: `Siêu Phẩm ${i + 1}`,
    slug: `sieu-pham-${i + 1}`,
    description: `Một siêu phẩm với đánh giá cực cao từ độc giả. Cốt truyện chặt chẽ, nhân vật sâu sắc, nội dung đặc sắc. Tác phẩm được nhiều người yêu thích và theo dõi. Xứng đáng là một trong những truyện hay nhất.`,
    cover_url: `https://picsum.photos/seed/masterpiece-${i}/400/600`,
    status: statuses[Math.floor(Math.random() * statuses.length)] as
      | "ongoing"
      | "completed",
    total_chapters: Math.floor(Math.random() * 2500) + 200,
    view_count_total: Math.floor(Math.random() * 50000000) + 10000000,
    view_count_daily: Math.floor(Math.random() * 80000) + 20000,
    rating_average: +(Math.random() * 0.5 + 4.5).toFixed(1), // High ratings 4.5-5.0
    rating_count: Math.floor(Math.random() * 20000) + 5000, // High rating count
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

async function getMasterpieceNovels(page: number = 1, perPage: number = 24) {
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
  //     rating_average,
  //     rating_count,
  //     last_chapter_at,
  //     authors!inner(name, slug),
  //     novel_genres!inner(genres!inner(id, name, slug))
  //   `,
  //     { count: "exact" }
  //   )
  //   .eq("is_published", true)
  //   .gte("rating_average", 4.5) // High rating threshold
  //   .gte("rating_count", 1000) // Significant number of ratings
  //   .order("rating_average", { ascending: false })
  //   .order("view_count_total", { ascending: false })
  //   .range(from, to);

  // if (error) {
  //   console.error("Error fetching masterpiece novels:", error);
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
  const allNovels = generateDummyMasterpieceNovels(100);
  // Sort by rating and total views
  const sortedNovels = allNovels.sort((a, b) => {
    if (b.rating_average !== a.rating_average) {
      return b.rating_average - a.rating_average;
    }
    return b.view_count_total - a.view_count_total;
  });
  const from = (page - 1) * perPage;
  const to = from + perPage;

  return {
    novels: sortedNovels.slice(from, to),
    total: allNovels.length,
  };
}

export default async function SieuPhamPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const perPage = 24;

  const { novels, total } = await getMasterpieceNovels(currentPage, perPage);
  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          ⭐ Siêu Phẩm Đang Hot
        </h1>
        <p className="text-muted-foreground">
          Tuyển tập những siêu phẩm truyện với đánh giá cao nhất. Tổng cộng{" "}
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
              baseUrl="/sieu-pham"
            />
          )}
        </>
      ) : (
        <CategoryEmptyState
          title="Chưa có siêu phẩm"
          description="Hiện tại chưa có siêu phẩm nào. Vui lòng quay lại sau!"
        />
      )}
    </div>
  );
}
