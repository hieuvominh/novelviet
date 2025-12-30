import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { NovelCard } from "@/components/novels/novel-card";

// Revalidate every 15 minutes
export const revalidate = 900;

type SortOption = "hot" | "newest" | "completed";

interface PageProps {
  params: { slug: string };
  searchParams: { sort?: SortOption; page?: string };
}

async function getGenre(slug: string) {
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
}

async function getNovelsByGenre(
  genreId: string,
  sort: SortOption = "hot",
  page: number = 1,
  perPage: number = 24
) {
  const supabase = await createClient();
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("novels")
    .select(
      `
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
    `,
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
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const genre = await getGenre(params.slug);

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
    url: `/the-loai/${params.slug}`,
  });
}

export default async function GenrePage({ params, searchParams }: PageProps) {
  const genre = await getGenre(params.slug);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {novels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/the-loai/${params.slug}?sort=${sort}&page=${
                      page - 1
                    }`}
                    className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
                  >
                    ← Trang trước
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/the-loai/${params.slug}?sort=${sort}&page=${pageNum}`}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          page === pageNum
                            ? "bg-primary text-primary-foreground font-medium"
                            : "border hover:bg-accent"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}
                </div>

                {page < totalPages && (
                  <Link
                    href={`/the-loai/${params.slug}?sort=${sort}&page=${
                      page + 1
                    }`}
                    className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
                  >
                    Trang sau →
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Chưa có truyện nào trong thể loại này.
            </p>
          </div>
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
