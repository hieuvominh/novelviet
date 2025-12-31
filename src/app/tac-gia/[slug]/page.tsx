import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { AuthorNovelsList } from "@/components/novels/author-novels-list";

// Revalidate every 15 minutes
export const revalidate = 900;

interface PageProps {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const author = await getAuthor(slug);

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
    url: `/tac-gia/${slug}`,
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  let author = await getAuthor(slug);

  // TODO: Remove mock data - for testing only
  if (!author) {
    // Mock author data for testing
    const mockAuthors: Record<string, any> = {
      "nguyen-van-an": {
        id: "a1111111-1111-1111-1111-111111111111",
        name: "Nguyễn Văn An",
        slug: "nguyen-van-an",
        bio: "Tác giả nổi tiếng với thể loại tu tiên và huyền huyễn. Đã có 5 năm kinh nghiệm sáng tác.",
        avatar_url: null,
      },
      "tran-thi-binh": {
        id: "a2222222-2222-2222-2222-222222222222",
        name: "Trần Thị Bình",
        slug: "tran-thi-binh",
        bio: "Chuyên viết truyện ngôn tình, lãng mạn. Tác phẩm được độc giả yêu thích.",
        avatar_url: null,
      },
      "le-minh-chau": {
        id: "a3333333-3333-3333-3333-333333333333",
        name: "Lê Minh Châu",
        slug: "le-minh-chau",
        bio: "Tác giả trẻ với phong cách viết hiện đại, táo bạo. Chuyên đề tài đô thị và kiếm hiệp.",
        avatar_url: null,
      },
    };

    author = mockAuthors[slug];
    if (!author) {
      notFound();
    }
  }

  const [novels, stats] = await Promise.all([
    getAuthorNovels(author.id),
    getAuthorStats(author.id),
  ]);

  // TODO: Remove mock novels - for testing only
  const novelTitles = [
    "Võ Thần Thiên Hạ",
    "Kiếm Đạo Độc Tôn",
    "Trọng Sinh Chi Tu Tiên",
    "Đế Ba Thiên Hạ",
    "Thần Ấn Vương Tòa",
    "Tuyệt Thế Vũ Thần",
    "Vạn Cổ Thần Đế",
    "Huyết Ma Nhân Gian",
    "Thiên Đạo Đồ Thư Quán",
    "Ngã Là Chí Tôn",
    "Bất Tử Đế Tôn",
    "Long Vương Truyền Thuyết",
    "Đấu Phá Thương Khung",
    "Thái Cổ Thần Vương",
    "Võ Luyện Đỉnh Phong",
    "Tu La Vũ Thần",
    "Hồng Hoang Nguyên Đạo",
    "Vô Địch Kiếm Vực",
    "Hoàng Hôn Thần Quốc",
    "Tiên Nghịch Tu La",
    "Đế Tôn Trọng Sinh",
    "Ma Đế Thiên Hạ",
    "Thần Mộ",
    "Đại Chúa Tể",
    "Vĩnh Sinh",
    "Thiên Đạo Đồ Thư Quán",
    "Tu Tiên Truyện",
    "Phàm Nhân Tu Tiên",
    "Nguyên Tôn",
    "Thần Võ Đế Tôn",
    "Tối Cường Khí Vận",
    "Đạo Quỷ",
    "Bắc Đẩu Thần Quyền",
    "Ma Thần Kỷ",
    "Thôn Phệ Tinh Không",
    "Vạn Giới Thần Chủ",
    "Thiên Tài Đan Đế",
    "Tu La Thần Đế",
    "Hoang Thiên Đế",
    "Vũ Đạo Cuồng Phong",
    "Thần Ma Truyền Thuyết",
    "Vạn Đạo Long Hoàng",
    "Kiếm Nghịch",
    "Võ Động Càn Khôn",
    "Đấu La Đại Lục",
    "Bách Luyện Thành Thần",
    "Tuyệt Thế Đan Đế",
    "Vô Cực Thiên Tôn",
    "Tu Tiên Biên Niên Sử",
  ];

  const mockNovels =
    novels.length === 0
      ? Array.from({ length: 45 }, (_, i) => ({
          id: `d${i + 1}`,
          title: novelTitles[i] || `Truyện ${i + 1}`,
          slug: `truyen-${i + 1}`,
          description: `Một câu chuyện tu tiên hấp dẫn với nhiều tình tiết bất ngờ...`,
          cover_url: `https://picsum.photos/seed/novel${i + 1}/400/600`,
          status: (i % 3 === 0 ? "completed" : "ongoing") as const,
          total_chapters: Math.floor(Math.random() * 500) + 50,
          view_count_total: Math.floor(Math.random() * 500000) + 10000,
          rating_average: Math.random() * 1.5 + 3.5,
          rating_count: Math.floor(Math.random() * 3000) + 100,
          bookmark_count: Math.floor(Math.random() * 2000) + 50,
          last_chapter_at: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          published_at: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }))
      : novels;

  const mockStats =
    stats.totalNovels === 0
      ? {
          totalNovels: mockNovels.length,
          totalChapters: mockNovels.reduce(
            (sum, n) => sum + (n.total_chapters || 0),
            0
          ),
          totalViews: mockNovels.reduce(
            (sum, n) => sum + (n.view_count_total || 0),
            0
          ),
          totalBookmarks: mockNovels.reduce(
            (sum, n) => sum + (n.bookmark_count || 0),
            0
          ),
          avgRating:
            mockNovels.reduce((sum, n) => sum + (n.rating_average || 0), 0) /
            mockNovels.length,
        }
      : stats;

  // Schema.org Person
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio,
    image: author.avatar_url,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/tac-gia/${slug}`,
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
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
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

        {/* Author Name */}
        <h1 className="text-2xl font-bold mb-6">{author.name}</h1>

        {/* Novels List */}
        <AuthorNovelsList novels={mockNovels} authorName={author.name} />
      </div>
    </>
  );
}
