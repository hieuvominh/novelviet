import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { NovelCard } from "@/components/novels/novel-card";

// Revalidate every 15 minutes
export const revalidate = 900;

interface PageProps {
  params: { slug: string };
}

async function getAuthor(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("authors")
    .select("id, name, slug, bio, avatar_url")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getAuthorNovels(authorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
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
      rating_average,
      rating_count,
      bookmark_count,
      last_chapter_at,
      published_at
    `
    )
    .eq("author_id", authorId)
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching author novels:", error);
    return [];
  }

  return data || [];
}

async function getAuthorStats(authorId: string) {
  const supabase = await createClient();

  const { data: novels } = await supabase
    .from("novels")
    .select(
      "view_count_total, total_chapters, rating_average, rating_count, bookmark_count"
    )
    .eq("author_id", authorId)
    .eq("is_published", true);

  if (!novels || novels.length === 0) {
    return {
      totalNovels: 0,
      totalChapters: 0,
      totalViews: 0,
      totalBookmarks: 0,
      avgRating: 0,
    };
  }

  const totalChapters = novels.reduce(
    (sum, n) => sum + (n.total_chapters || 0),
    0
  );
  const totalViews = novels.reduce(
    (sum, n) => sum + (n.view_count_total || 0),
    0
  );
  const totalBookmarks = novels.reduce(
    (sum, n) => sum + (n.bookmark_count || 0),
    0
  );

  // Calculate weighted average rating
  const totalRatingPoints = novels.reduce(
    (sum, n) => sum + (n.rating_average || 0) * (n.rating_count || 0),
    0
  );
  const totalRatingCount = novels.reduce(
    (sum, n) => sum + (n.rating_count || 0),
    0
  );
  const avgRating =
    totalRatingCount > 0 ? totalRatingPoints / totalRatingCount : 0;

  return {
    totalNovels: novels.length,
    totalChapters,
    totalViews,
    totalBookmarks,
    avgRating: Math.round(avgRating * 10) / 10,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const author = await getAuthor(params.slug);

  if (!author) {
    return {
      title: "Không tìm thấy tác giả",
    };
  }

  return generateSEO({
    title: `${author.name} - Tác giả truyện`,
    description:
      author.bio ||
      `Đọc tất cả truyện của tác giả ${author.name}. Danh sách truyện hay nhất, cập nhật liên tục.`,
    url: `/tac-gia/${params.slug}`,
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const author = await getAuthor(params.slug);

  if (!author) {
    notFound();
  }

  const [novels, stats] = await Promise.all([
    getAuthorNovels(author.id),
    getAuthorStats(author.id),
  ]);

  // Schema.org Person
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio,
    image: author.avatar_url,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tac-gia/${params.slug}`,
    worksFor: {
      "@type": "Organization",
      name: "TruyenDoc",
    },
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
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
          <Link href="/tac-gia" className="hover:text-primary">
            Tác giả
          </Link>
          <span>/</span>
          <span className="text-foreground">{author.name}</span>
        </nav>

        {/* Author Info Card */}
        <div className="bg-card border rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
                {author.avatar_url ? (
                  <Image
                    src={author.avatar_url}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-4xl font-bold text-muted-foreground">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{author.name}</h1>

              {author.bio && (
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {author.bio}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.totalNovels}
                  </div>
                  <div className="text-sm text-muted-foreground">Tác phẩm</div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(stats.totalChapters)}
                  </div>
                  <div className="text-sm text-muted-foreground">Chương</div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(stats.totalViews)}
                  </div>
                  <div className="text-sm text-muted-foreground">Lượt xem</div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Đánh giá TB
                  </div>
                </div>

                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {formatNumber(stats.totalBookmarks)}
                  </div>
                  <div className="text-sm text-muted-foreground">Đánh dấu</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Novels List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            Danh sách truyện ({novels.length})
          </h2>

          {novels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {novels.map((novel) => (
                <NovelCard
                  key={novel.id}
                  novel={{
                    ...novel,
                    author: { name: author.name, slug: author.slug },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tác giả chưa có truyện nào.
              </p>
            </div>
          )}
        </div>

        {/* SEO Content Block */}
        <div className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Giới Thiệu Về Tác Giả {author.name}</h2>
          <p>
            <strong>{author.name}</strong> là một trong những tác giả nổi tiếng
            trên nền tảng đọc truyện của chúng tôi. Với {stats.totalNovels} tác
            phẩm đã xuất bản và hơn {formatNumber(stats.totalChapters)} chương,
            {author.name} đã khẳng định được tài năng sáng tác của mình trong
            cộng đồng độc giả Việt Nam.
          </p>
          <p>
            Các tác phẩm của {author.name} đã thu hút được{" "}
            {formatNumber(stats.totalViews)} lượt xem và nhận được đánh giá
            trung bình {stats.avgRating.toFixed(1)}/5 sao từ độc giả. Phong cách
            viết đặc trưng và cốt truyện hấp dẫn đã giúp các truyện của tác giả
            luôn nằm trong danh sách những tác phẩm được yêu thích nhất.
          </p>

          <h3>Tại Sao Nên Đọc Truyện Của {author.name}?</h3>
          <ul>
            <li>
              <strong>Phong cách riêng biệt:</strong> {author.name} có phong
              cách viết độc đáo, dễ đọc và cuốn hút, mang lại trải nghiệm thú vị
              cho độc giả.
            </li>
            <li>
              <strong>Cốt truyện chặt chẽ:</strong> Các tác phẩm được xây dựng
              cẩn thận với cốt truyện logic, nhân vật sống động và nhiều tình
              tiết bất ngờ.
            </li>
            <li>
              <strong>Cập nhật đều đặn:</strong> Tác giả có lịch đăng chương ổn
              định, đảm bảo độc giả luôn có nội dung mới để theo dõi.
            </li>
            <li>
              <strong>Đa dạng thể loại:</strong> Từ huyền huyễn, tiên hiệp đến
              ngôn tình, đô thị,
              {author.name} chinh phục được nhiều thể loại khác nhau.
            </li>
          </ul>

          <h3>Các Tác Phẩm Nổi Bật</h3>
          <p>
            Tất cả {stats.totalNovels} tác phẩm của {author.name} đều có sẵn
            trên nền tảng của chúng tôi. Bạn có thể đọc miễn phí, không quảng
            cáo, với giao diện thân thiện và tốc độ tải nhanh. Mỗi truyện đều
            được cập nhật chương mới thường xuyên và có hệ thống bình luận để
            bạn trao đổi cảm nhận với cộng đồng độc giả.
          </p>
          <p>
            Hãy khám phá ngay danh sách truyện của {author.name} bên trên để tìm
            cho mình những tác phẩm yêu thích. Đừng quên đánh dấu và đánh giá để
            ủng hộ tác giả và giúp người khác dễ dàng tìm thấy những câu chuyện
            hay!
          </p>
        </div>
      </div>
    </>
  );
}
