import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { StatsDisplay } from "@/components/novels/stats-display";
import { ChapterList } from "@/components/chapters/chapter-list";
import { Badge } from "@/components/ui/badge";
import { NovelCardCompact } from "@/components/novels/novel-card-compact";
import { HorizontalSection } from "@/components/sections/horizontal-section";

// Revalidate every 10 minutes
export const revalidate = 600;

const statusLabels: Record<string, string> = {
  draft: "Nháp",
  ongoing: "Đang ra",
  completed: "Hoàn thành",
  hiatus: "Tạm ngưng",
  dropped: "Ngừng",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500",
  ongoing: "bg-blue-500",
  completed: "bg-green-500",
  hiatus: "bg-yellow-500",
  dropped: "bg-red-500",
};

async function getNovel(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("novels")
    .select(
      `
      *,
      authors(id, name, slug, bio),
      novel_genres!inner(
        genres!inner(id, name, slug)
      )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .is("deleted_at", null)
    .is("novel_genres.genres.deleted_at", null)
    .single();

  // Fallback if DB doesn't have deleted_at on genres or joined filtering fails
  if (error) {
    const msg = error.message || JSON.stringify(error || "");
    if (msg.includes("deleted_at") || msg.includes("does not exist")) {
      const fallback = await supabase
        .from("novels")
        .select(
          `
        *,
        authors!inner(id, name, slug, bio),
        novel_genres!inner(
          genres!inner(id, name, slug)
        )
      `
        )
        .eq("slug", slug)
        .eq("is_published", true)
        .is("deleted_at", null)
        .single();

      if (!fallback.error && fallback.data) {
        // use fallback data
        const data = fallback.data;
        const author =
          Array.isArray(data.authors) && data.authors.length > 0
            ? data.authors[0]
            : data.authors;

        return {
          ...data,
          authors: author,
        };
      }
    }
  }

  if (error || !data) {
    return null;
  }

  // Supabase returns authors as array when joined; extract first element or null
  const author = data.authors
    ? Array.isArray(data.authors) && data.authors.length > 0
      ? data.authors[0]
      : data.authors
    : null;

  return {
    ...data,
    authors: author,
  };
}

async function getNovelsByAuthor(authorId: string, currentNovelId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("novels")
    .select(
      `
      id,
      title,
      slug,
      cover_url,
      view_count_total,
      rating_average,
      authors!inner(name, slug)
    `
    )
    .eq("author_id", authorId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .neq("id", currentNovelId)
    .order("view_count_total", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching author novels:", error);
    return [];
  }

  return data.map((novel) => ({
    ...novel,
    author:
      Array.isArray(novel.authors) && novel.authors.length > 0
        ? novel.authors[0]
        : novel.authors,
  }));
}

async function getChapters(novelId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chapters")
    .select(
      "id, title, slug, chapter_number, published_at, view_count, word_count"
    )
    .eq("novel_id", novelId)
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("chapter_number", { ascending: true });

  if (error) {
    console.error("Error fetching chapters:", error);
    return [];
  }

  return data;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovel(slug);

  if (!novel) {
    return generateSEO({
      title: "Truyện không tồn tại",
      description: "Không tìm thấy truyện này",
    });
  }

  const authorName = novel.authors?.name || "Unknown author";
  const title = novel.meta_title || `${novel.title} - ${authorName}`;
  const description =
    novel.meta_description ||
    `Đọc truyện ${novel.title} của ${authorName}. ${(
      novel.description || ""
    ).slice(0, 150)}...`;

  return generateSEO({
    title,
    description,
    image: novel.cover_url || undefined,
    url: `/truyen/${slug}`,
  });
}

export default async function NovelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const novel = await getNovel(slug);

  if (!novel) {
    notFound();
  }

  // TODO: Remove mock data when ready to integrate with database
  const mockChapters = Array.from({ length: 200 }, (_, i) => ({
    id: `mock-chapter-${i + 1}`,
    title: `Chương ${i + 1}: ${
      [
        "Khởi đầu",
        "Gặp gỡ",
        "Thử thách",
        "Bí mật",
        "Quyết định",
        "Chiến đấu",
        "Thắng lợi",
        "Thua trận",
        "Hồi sinh",
        "Kết thúc",
      ][i % 10]
    }`,
    slug: `chuong-${i + 1}`,
    chapter_number: i + 1,
    published_at: new Date(
      Date.now() - (200 - i) * 24 * 60 * 60 * 1000
    ).toISOString(),
    view_count: Math.floor(Math.random() * 10000) + 1000,
    word_count: Math.floor(Math.random() * 3000) + 1500,
  }));
  const chapters = mockChapters; // Replace with: await getChapters(novel.id);

  // TODO: Remove mock data when ready to integrate with database
  const mockAuthorNovels = [
    {
      id: "mock-1",
      title: "Truyện Khác Của Tác Giả 1",
      slug: "truyen-khac-1",
      cover_url: "https://picsum.photos/seed/author1/400/600",
      view_count_total: 250000,
      rating_average: 4.5,
      author: novel.authors,
    },
    {
      id: "mock-2",
      title: "Truyện Khác Của Tác Giả 2",
      slug: "truyen-khac-2",
      cover_url: "https://picsum.photos/seed/author2/400/600",
      view_count_total: 180000,
      rating_average: 4.3,
      author: novel.authors,
    },
    {
      id: "mock-3",
      title: "Truyện Khác Của Tác Giả 3",
      slug: "truyen-khac-3",
      cover_url: "https://picsum.photos/seed/author3/400/600",
      view_count_total: 95000,
      rating_average: 4.7,
      author: novel.authors,
    },
    {
      id: "mock-4",
      title: "Truyện Khác Của Tác Giả 4",
      slug: "truyen-khac-4",
      cover_url: "https://picsum.photos/seed/author4/400/600",
      view_count_total: 45000,
      rating_average: 4.2,
      author: novel.authors,
    },
  ];
  const authorNovels = mockAuthorNovels; // Replace with: await getNovelsByAuthor(novel.author_id, novel.id);

  // TODO: Remove mock data for suggested novels
  const mockSuggestedNovels = [
    {
      id: "suggest-1",
      title: "Võ Thần Thiên Hạ",
      slug: "vo-than-thien-ha",
      description:
        "Một thiếu niên bình thường bước vào con đường tu luyện võ đạo...",
      cover_url: "https://picsum.photos/seed/suggest1/400/600",
      status: "ongoing" as const,
      total_chapters: 1250,
      view_count_total: 15000000,
      view_count_daily: 45000,
      view_count_weekly: 280000,
      rating_average: 4.8,
      rating_count: 12500,
      last_chapter_at: "2024-12-30T10:00:00Z",
      author: { name: "Thiên Tàm Thổ Đậu", slug: "thien-tam-tho-dau" },
    },
    {
      id: "suggest-2",
      title: "Tình Yêu Không Có Lỗi",
      slug: "tinh-yeu-khong-co-loi",
      description: "Một câu chuyện ngôn tình hiện đại...",
      cover_url: "https://picsum.photos/seed/suggest2/400/600",
      status: "completed" as const,
      total_chapters: 680,
      view_count_total: 8500000,
      view_count_daily: 12000,
      view_count_weekly: 85000,
      rating_average: 4.6,
      rating_count: 8900,
      last_chapter_at: "2024-12-20T08:30:00Z",
      author: { name: "Cố Mạn", slug: "co-man" },
    },
    {
      id: "suggest-3",
      title: "Trọng Sinh Chi Đô Thị Tu Tiên",
      slug: "trong-sinh-chi-do-thi-tu-tien",
      description: "Trọng sinh về quá khứ với ký ức 500 năm tu tiên...",
      cover_url: "https://picsum.photos/seed/suggest3/400/600",
      status: "ongoing" as const,
      total_chapters: 2100,
      view_count_total: 32000000,
      view_count_daily: 95000,
      view_count_weekly: 650000,
      rating_average: 4.9,
      rating_count: 28000,
      last_chapter_at: "2024-12-30T12:00:00Z",
      author: { name: "Ngã Ăn Tây Hồng Thị", slug: "nga-an-tay-hong-thi" },
    },
    {
      id: "suggest-4",
      title: "Kiếm Đạo Độc Tôn",
      slug: "kiem-dao-doc-ton",
      description: "Kiếm đạo vô song, một mình ta tôn!",
      cover_url: "https://picsum.photos/seed/suggest4/400/600",
      status: "ongoing" as const,
      total_chapters: 1580,
      view_count_total: 18000000,
      view_count_daily: 52000,
      view_count_weekly: 360000,
      rating_average: 4.7,
      rating_count: 15600,
      last_chapter_at: "2024-12-30T09:00:00Z",
      author: { name: "Kiếm Du Thái Hư", slug: "kiem-du-thai-hu" },
    },
    {
      id: "suggest-5",
      title: "Nữ Đế Trọng Sinh",
      slug: "nu-de-trong-sinh",
      description: "Từng là nữ đế thống trị vạn giới...",
      cover_url: "https://picsum.photos/seed/suggest5/400/600",
      status: "ongoing" as const,
      total_chapters: 890,
      view_count_total: 12000000,
      view_count_daily: 38000,
      view_count_weekly: 265000,
      rating_average: 4.8,
      rating_count: 11200,
      last_chapter_at: "2024-12-30T11:00:00Z",
      author: { name: "Phượng Khinh", slug: "phuong-khinh" },
    },
  ];

  const genres = novel.novel_genres.map((ng: any) => ng.genres);

  // Schema.org structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    author: {
      "@type": "Person",
      name: novel.authors.name,
    },
    genre: genres.map((g: any) => g.name).join(", "),
    description: novel.description,
    image: novel.cover_url,
    aggregateRating:
      novel.rating_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: novel.rating_average,
            ratingCount: novel.rating_count,
            bestRating: 5,
          }
        : undefined,
    numberOfPages: novel.total_chapters,
    inLanguage: "vi",
  };

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
          <Link href="/truyen" className="hover:text-primary">
            Truyện
          </Link>
          <span>/</span>
          <span className="text-foreground">{novel.title}</span>
        </nav>

        {/* Novel Info */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Cover Image */}
            <div className="md:col-span-1">
              <div className="sticky top-20 max-w-[280px] mx-auto md:mx-0">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border shadow-lg">
                  <Image
                    src={novel.cover_url || "/placeholder-cover.svg"}
                    alt={novel.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <Link
                    href={`/truyen/${novel.slug}/1`}
                    className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-center cursor-pointer"
                  >
                    Đọc từ đầu
                  </Link>
                  <button className="w-full px-4 py-2 border rounded-lg hover:bg-accent transition-colors font-medium cursor-pointer">
                    Đánh dấu
                  </button>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="md:col-span-3 space-y-6">
              {/* Title & Author */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {novel.title}
                </h1>
                {novel.alternative_titles &&
                  novel.alternative_titles.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Tên khác: {novel.alternative_titles.join(", ")}
                    </p>
                  )}
                <div className="flex items-center gap-3 mt-3">
                  {novel.authors ? (
                    <Link
                      href={`/tac-gia/${novel.authors.slug}`}
                      className="text-base text-gray-700 dark:text-gray-300 hover:text-primary"
                    >
                      {novel.authors.name}
                    </Link>
                  ) : (
                    <span className="text-base text-gray-700">
                      Unknown author
                    </span>
                  )}
                  <Badge
                    className={`${
                      statusColors[novel.status]
                    } text-white text-xs`}
                  >
                    {statusLabels[novel.status]}
                  </Badge>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any) => (
                  <Link
                    key={genre.id}
                    href={`/the-loai/${genre.slug}`}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:border-primary hover:text-primary transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Stats */}
              <div>
                <StatsDisplay
                  stats={{
                    totalChapters: novel.total_chapters,
                    totalWords: novel.total_words,
                    viewCount: novel.view_count_total,
                    rating: novel.rating_average,
                    ratingCount: novel.rating_count,
                    bookmarkCount: novel.bookmark_count,
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
                  Giới thiệu
                </h2>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p className="whitespace-pre-line">{novel.description}</p>
                </div>
              </div>

              {/* Author Bio */}
              {novel.authors?.bio && (
                <div className="p-4 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Về tác giả
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {novel.authors.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chapter List & Author Novels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Chapter List - Left Side */}
          <div className="lg:col-span-2">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">
                Danh sách chương ({chapters.length})
              </h2>
              {chapters.length > 0 ? (
                <ChapterList novelSlug={novel.slug} chapters={chapters} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Chưa có chương nào
                </div>
              )}
            </div>
          </div>

          {/* Author Novels - Right Side */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Truyện cùng tác giả</h3>
                <Link
                  href={`/tac-gia/${novel.authors.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  Xem thêm
                </Link>
              </div>
              {authorNovels.length > 0 ? (
                <div className="space-y-4">
                  {authorNovels.map((authorNovel: any) => (
                    <Link
                      key={authorNovel.id}
                      href={`/truyen/${authorNovel.slug}`}
                      className="flex gap-3 group"
                    >
                      <div className="relative w-16 h-20 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={
                            authorNovel.cover_url || "/placeholder-cover.svg"
                          }
                          alt={authorNovel.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {authorNovel.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span>
                            {authorNovel.view_count_total >= 10000
                              ? `${(
                                  authorNovel.view_count_total / 10000
                                ).toFixed(1)}k`
                              : authorNovel.view_count_total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Không có truyện nào khác
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Novels */}
        <div className="mb-12">
          <HorizontalSection title="Truyện đề xuất" href="/truyen">
            {mockSuggestedNovels.map((novel) => (
              <NovelCardCompact
                key={novel.id}
                novel={novel}
                showChapterCount={false}
                imageAspect="aspect-[0.9]"
                className="w-[40px] md:w-[60px]"
              />
            ))}
          </HorizontalSection>
        </div>
      </div>
    </>
  );
}
