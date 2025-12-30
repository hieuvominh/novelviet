import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { StatsDisplay } from "@/components/novels/stats-display";
import { ChapterList } from "@/components/chapters/chapter-list";
import { Badge } from "@/components/ui/badge";

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
      authors!inner(id, name, slug, bio),
      novel_genres!inner(
        genres!inner(id, name, slug)
      )
    `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return null;
  }

  // Supabase returns authors as array with !inner, extract first element
  const author =
    Array.isArray(data.authors) && data.authors.length > 0
      ? data.authors[0]
      : data.authors;

  return {
    ...data,
    authors: author,
  };
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

  const title = novel.meta_title || `${novel.title} - ${novel.authors.name}`;
  const description =
    novel.meta_description ||
    `Đọc truyện ${novel.title} của ${
      novel.authors.name
    }. ${novel.description.slice(0, 150)}...`;

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

  const chapters = await getChapters(novel.id);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Cover Image */}
          <div className="md:col-span-1">
            <div className="sticky top-20">
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
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Đọc từ đầu
                </button>
                <button className="w-full px-4 py-2 border rounded-lg hover:bg-accent transition-colors font-medium">
                  Đánh dấu
                </button>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            {/* Title & Author */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-3">{novel.title}</h1>
              {novel.alternative_titles &&
                novel.alternative_titles.length > 0 && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Tên khác: {novel.alternative_titles.join(", ")}
                  </p>
                )}
              <div className="flex items-center gap-4">
                <Link
                  href={`/tac-gia/${novel.authors.slug}`}
                  className="text-lg text-primary hover:underline"
                >
                  {novel.authors.name}
                </Link>
                <Badge className={`${statusColors[novel.status]} text-white`}>
                  {statusLabels[novel.status]}
                </Badge>
              </div>
            </div>

            {/* Genres */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {genres.map((genre: any) => (
                  <Link
                    key={genre.id}
                    href={`/the-loai/${genre.slug}`}
                    className="px-3 py-1 text-sm border rounded-full hover:bg-accent transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{novel.description}</p>
              </div>
            </div>

            {/* Author Bio */}
            {novel.authors.bio && (
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Về tác giả</h3>
                <p className="text-sm text-muted-foreground">
                  {novel.authors.bio}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter List */}
        <div className="mb-12">
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
    </>
  );
}
