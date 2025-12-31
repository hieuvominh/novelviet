import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { NovelCard } from "@/components/novels/novel-card";
import { CategoryContent } from "@/components/category/category-content";
import { CategoryPagination } from "@/components/category/category-pagination";
import { CategoryEmptyState } from "@/components/category/category-empty-state";

// Revalidate every 15 minutes
export const revalidate = 900;

type SortOption = "hot" | "newest" | "completed";

interface PageProps {
  params: { slug: string };
  searchParams: { sort?: SortOption; page?: string };
}

// Dummy genre data for testing
const DUMMY_GENRES: Record<string, any> = {
  "tien-hiep": {
    id: "genre-1",
    name: "Xianxia",
    slug: "tien-hiep",
    name_vi: "Tiên Hiệp",
    description:
      "Truyện tu tiên, tu đạo, thế giới huyền ảo phương Đông với các tu sĩ, pháp bảo và đấu pháp kịch tính.",
    meta_description:
      "Đọc truyện Tiên Hiệp hay nhất, cập nhật nhanh nhất. Hàng nghìn tác phẩm tu tiên, tu đạo hấp dẫn.",
  },
  "huyen-huyen": {
    id: "genre-2",
    name: "Fantasy",
    slug: "huyen-huyen",
    name_vi: "Huyền Huyễn",
    description:
      "Thế giới huyền ảo với ma pháp, dị năng, sinh vật thần thoại và những cuộc phiêu lưu kỳ ảo.",
    meta_description:
      "Truyện Huyền Huyễn hay, cập nhật liên tục. Khám phá thế giới phép thuật và phiêu lưu.",
  },
  "ngon-tinh": {
    id: "genre-3",
    name: "Romance",
    slug: "ngon-tinh",
    name_vi: "Ngôn Tình",
    description:
      "Truyện tình cảm lãng mạn, ngọt ngào với những câu chuyện về tình yêu, hôn nhân và gia đình.",
    meta_description:
      "Đọc truyện Ngôn Tình hay nhất 2025. Tình cảm lãng mạn, ngọt ngào, cập nhật mỗi ngày.",
  },
  "do-thi": {
    id: "genre-4",
    name: "Urban",
    slug: "do-thi",
    name_vi: "Đô Thị",
    description:
      "Cuộc sống thành thị hiện đại với những câu chuyện về công việc, tình yêu và cuộc sống đời thường.",
    meta_description:
      "Truyện Đô Thị hay, gần gũi với cuộc sống. Cập nhật nhanh, đa dạng thể loại.",
  },
  "kiem-hiep": {
    id: "genre-5",
    name: "Wuxia",
    slug: "kiem-hiep",
    name_vi: "Kiếm Hiệp",
    description:
      "Võ lâm giang hồ với các cao thủ, võ công, và nghĩa khí anh hùng.",
    meta_description:
      "Truyện Kiếm Hiệp kinh điển, cập nhật liên tục. Võ lâm giang hồ hấp dẫn.",
  },
  "khoa-huyen": {
    id: "genre-6",
    name: "Sci-Fi",
    slug: "khoa-huyen",
    name_vi: "Khoa Huyễn",
    description:
      "Thế giới tương lai với công nghệ tiên tiến, vũ trụ và những khám phá khoa học.",
    meta_description:
      "Truyện Khoa Huyễn hay nhất. Khám phá thế giới tương lai và công nghệ.",
  },
  fantasy: {
    id: "genre-7",
    name: "Fantasy",
    slug: "fantasy",
    name_vi: "Fantasy",
    description:
      "Thế giới kỳ ảo phương Tây với phép thuật, rồng, yêu tinh và những cuộc phiêu lưu sử thi.",
    meta_description:
      "Truyện Fantasy phương Tây hay nhất. Thế giới phép thuật và phiêu lưu kỳ ảo.",
  },
};

async function getGenre(slug: string) {
  // Return dummy data for testing
  return DUMMY_GENRES[slug] || null;

  /* Real Supabase code - uncomment when ready
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("genres")
    .select("id, name, slug, name_vi, description, meta_description")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
  */
}

// Dummy novel generator for testing
function generateDummyNovels(count: number, genreId: string) {
  const statuses = ["ongoing", "completed"] as const;
  const novels = [];

  for (let i = 1; i <= count; i++) {
    const status = statuses[i % 2];
    novels.push({
      id: `novel-${genreId}-${i}`,
      title: `${
        DUMMY_GENRES[
          Object.keys(DUMMY_GENRES).find(
            (k) => DUMMY_GENRES[k].id === genreId
          ) || ""
        ]?.name_vi || "Truyện"
      } Hay Số ${i}`,
      slug: `truyen-hay-so-${i}`,
      description: `Đây là mô tả cho truyện số ${i}. Một câu chuyện hấp dẫn với nhiều tình tiết bất ngờ...`,
      cover_url: `https://picsum.photos/seed/${genreId}-${i}/400/600`,
      status,
      total_chapters: Math.floor(Math.random() * 2000) + 100,
      view_count_total: Math.floor(Math.random() * 10000000),
      view_count_daily: Math.floor(Math.random() * 50000),
      rating_average: 3.5 + Math.random() * 1.5,
      rating_count: Math.floor(Math.random() * 5000),
      last_chapter_at: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      author: {
        name: `Tác Giả ${i}`,
        slug: `tac-gia-${i}`,
      },
    });
  }

  return novels;
}

async function getNovelsByGenre(
  genreId: string,
  sort: SortOption = "hot",
  page: number = 1,
  perPage: number = 24
) {
  // Return dummy data for testing
  const allNovels = generateDummyNovels(100, genreId);
  const offset = (page - 1) * perPage;

  // Sort novels
  let sortedNovels = [...allNovels];
  switch (sort) {
    case "hot":
      sortedNovels.sort((a, b) => b.view_count_daily - a.view_count_daily);
      break;
    case "newest":
      sortedNovels.sort(
        (a, b) =>
          new Date(b.last_chapter_at).getTime() -
          new Date(a.last_chapter_at).getTime()
      );
      break;
    case "completed":
      sortedNovels = sortedNovels.filter((n) => n.status === "completed");
      sortedNovels.sort((a, b) => b.view_count_total - a.view_count_total);
      break;
  }

  const novels = sortedNovels.slice(offset, offset + perPage);

  return { novels, total: sortedNovels.length };

  /* Real Supabase code - uncomment when ready
  const supabase = await createClient();
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("novels")
    .select(
      \`
      id,
      title,
      slug,
      description,
      cover_url,
      status,
      total_chapters,
      view_count_total,
      view_count_daily,
      rating_average,
      rating_count,
      last_chapter_at,
      authors!inner(name, slug)
    \`,
      { count: "exact" }
    )
    .eq("is_published", true);

  // Filter by genre via junction table
  const { data: novelGenres } = await supabase
    .from("novel_genres")
    .select("novel_id")
    .eq("genre_id", genreId);

  if (!novelGenres || novelGenres.length === 0) {
    return { novels: [], total: 0 };
  }

  const novelIds = novelGenres.map((ng) => ng.novel_id);
  query = query.in("id", novelIds);

  // Sorting
  switch (sort) {
    case "hot":
      query = query
        .order("view_count_daily", { ascending: false })
        .order("rating_average", { ascending: false });
      break;
    case "newest":
      query = query.order("published_at", { ascending: false });
      break;
    case "completed":
      query = query
        .eq("status", "completed")
        .order("view_count_total", { ascending: false });
      break;
  }

  query = query.range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching novels:", error);
    return { novels: [], total: 0 };
  }

  const novels = (data || [])
    .map((novel) => ({
      ...novel,
      author:
        Array.isArray(novel.authors) && novel.authors.length > 0
          ? novel.authors[0]
          : null,
    }))
    .filter(
      (
        novel
      ): novel is typeof novel & { author: NonNullable<typeof novel.author> } =>
        novel.author !== null
    );

  return { novels, total: count || 0 };
  */
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);

  if (!genre) {
    return {
      title: "Không tìm thấy thể loại",
    };
  }

  const sortLabels = {
    hot: "Hot Nhất",
    newest: "Mới Nhất",
    completed: "Hoàn Thành",
  };

  const sort = (searchParams.sort || "hot") as SortOption;
  const page = parseInt(searchParams.page || "1");
  const sortLabel = sortLabels[sort];
  const pageText = page > 1 ? ` - Trang ${page}` : "";

  return generateSEO({
    title: `${genre.name_vi || genre.name} ${sortLabel}${pageText} - Truyện ${
      genre.name_vi
    }`,
    description:
      genre.meta_description ||
      genre.description ||
      `Đọc truyện thể loại ${
        genre.name_vi || genre.name
      } ${sortLabel.toLowerCase()}. Danh sách truyện ${
        genre.name_vi
      } hay nhất, cập nhật liên tục.`,
    url: `/the-loai/${slug}`,
  });
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const genre = await getGenre(slug);

  if (!genre) {
    notFound();
  }

  const sort = (searchParams.sort || "hot") as SortOption;
  const page = parseInt(searchParams.page || "1");
  const { novels, total } = await getNovelsByGenre(genre.id, sort, page);

  const totalPages = Math.ceil(total / 24);

  // Schema.org CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${genre.name_vi || genre.name} - Truyện ${genre.name_vi}`,
    description:
      genre.description || `Danh sách truyện thể loại ${genre.name_vi}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Trang chủ",
          item: process.env.NEXT_PUBLIC_SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Thể loại",
          item: `${process.env.NEXT_PUBLIC_SITE_URL}/the-loai`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: genre.name_vi || genre.name,
        },
      ],
    },
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "hot", label: "Hot Nhất" },
    { value: "newest", label: "Mới Nhất" },
    { value: "completed", label: "Hoàn Thành" },
  ];

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/the-loai" className="hover:text-primary">
            Thể loại
          </Link>
          <span>/</span>
          <span className="text-foreground">{genre.name_vi || genre.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {genre.name_vi || genre.name}
          </h1>
          {genre.description && (
            <p className="text-lg text-muted-foreground max-w-3xl">
              {genre.description}
            </p>
          )}
        </div>

        {/* Sorting & Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Tìm thấy{" "}
            <span className="font-semibold text-foreground">{total}</span>{" "}
            truyện
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sắp xếp:</span>
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/the-loai/${params.slug}?sort=${option.value}`}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    sort === option.value
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted hover:bg-accent"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Novel Grid */}
        {novels.length > 0 ? (
          <>
            <CategoryContent novels={novels} categoryName={genre.name_vi} />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <CategoryPagination
                  currentPage={page}
                  totalPages={totalPages}
                  baseUrl={`/the-loai/${slug}?sort=${sort}`}
                />
              </div>
            )}
          </>
        ) : (
          <CategoryEmptyState />
        )}

        {/* SEO Content Block */}
        <div className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Truyện {genre.name_vi || genre.name} Hay Nhất</h2>
          <p>
            Thể loại <strong>{genre.name_vi || genre.name}</strong> là một trong
            những thể loại truyện được yêu thích nhất trên nền tảng đọc truyện
            của chúng tôi. Với hàng nghìn tác phẩm chất lượng cao, bạn sẽ tìm
            thấy vô số câu chuyện hấp dẫn, cốt truyện cuốn hút và nhân vật sống
            động.
          </p>
          <p>
            Các tác phẩm {genre.name_vi} trên trang web được cập nhật liên tục
            với những chương mới nhất, đảm bảo bạn không bỏ lỡ bất kỳ diễn biến
            nào. Tất cả các truyện đều được biên tập kỹ lưỡng, mang đến trải
            nghiệm đọc tuyệt vời cho độc giả.
          </p>
          <p>
            Khám phá ngay danh sách truyện {genre.name_vi} hot nhất, mới nhất và
            hoàn thành để tìm cho mình những tác phẩm yêu thích. Đọc truyện{" "}
            {genre.name_vi} online miễn phí, không quảng cáo làm phiền, giao
            diện thân thiện và tốc độ tải nhanh.
          </p>

          <h3>Tại Sao Nên Đọc Truyện {genre.name_vi}?</h3>
          <ul>
            <li>
              <strong>Kho truyện phong phú:</strong> Hàng nghìn tác phẩm{" "}
              {genre.name_vi} từ nhiều tác giả nổi tiếng, đáp ứng mọi khẩu vị
              của độc giả.
            </li>
            <li>
              <strong>Cập nhật liên tục:</strong> Các truyện hot được cập nhật
              chương mới hàng ngày, đảm bảo bạn luôn có nội dung mới để đọc.
            </li>
            <li>
              <strong>Chất lượng đảm bảo:</strong> Tất cả truyện {genre.name_vi}{" "}
              đều trải qua quy trình kiểm duyệt nghiêm ngặt về nội dung và chất
              lượng bản dịch.
            </li>
            <li>
              <strong>Trải nghiệm đọc tuyệt vời:</strong> Giao diện thân thiện,
              hỗ trợ dark mode, điều chỉnh font chữ và lưu tiến độ đọc tự động.
            </li>
          </ul>

          <h3>Cách Tìm Truyện {genre.name_vi} Hay</h3>
          <p>
            Để tìm được những tác phẩm {genre.name_vi} phù hợp nhất với bạn, hãy
            sử dụng các bộ lọc và sắp xếp của chúng tôi. Bạn có thể xem truyện
            hot nhất (được nhiều người đọc nhất), truyện mới nhất (vừa được đăng
            tải) hoặc truyện hoàn thành (đã có kết thúc).
          </p>
          <p>
            Đừng quên đánh giá và bình luận cho những truyện {genre.name_vi} bạn
            yêu thích để chia sẻ cảm nhận với cộng đồng độc giả và giúp người
            khác tìm được những tác phẩm chất lượng!
          </p>
        </div>
      </div>
    </>
  );
}
