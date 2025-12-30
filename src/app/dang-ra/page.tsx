import { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { NovelCard } from "@/components/novels/novel-card";

// Revalidate every 10 minutes
export const revalidate = 600;

interface PageProps {
  searchParams: { page?: string };
}

async function getOngoingNovels(page: number = 1, perPage: number = 24) {
  const supabase = await createClient();
  const offset = (page - 1) * perPage;

  const { data, error, count } = await supabase
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
      bookmark_count,
      last_chapter_at,
      authors!inner(name, slug)
    `,
      { count: "exact" }
    )
    .eq("is_published", true)
    .eq("status", "ongoing")
    .order("last_chapter_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    console.error("Error fetching ongoing novels:", error);
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
  searchParams,
}: PageProps): Promise<Metadata> {
  const page = parseInt(searchParams.page || "1");
  const pageText = page > 1 ? ` - Trang ${page}` : "";

  return generateSEO({
    title: `Truyện Đang Ra${pageText} - Truyện Mới Cập Nhật Hàng Ngày`,
    description:
      "Đọc truyện đang ra, truyện đang cập nhật chương mới hàng ngày. Theo dõi những tác phẩm hot nhất với nội dung mới liên tục.",
    url: "/dang-ra",
  });
}

export default async function OngoingNovelsPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const { novels, total } = await getOngoingNovels(page);
  const totalPages = Math.ceil(total / 24);

  // Schema.org CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Truyện Đang Ra - Truyện Đang Cập Nhật",
    description: "Danh sách truyện đang ra, cập nhật chương mới hàng ngày",
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
          name: "Truyện Đang Ra",
        },
      ],
    },
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
          <span className="text-foreground">Truyện Đang Ra</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🔥 Truyện Đang Ra - Cập Nhật Hàng Ngày
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Danh sách truyện đang cập nhật chương mới liên tục. Theo dõi ngay để
            không bỏ lỡ tình tiết mới nhất!
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Tìm thấy{" "}
            <span className="font-semibold text-foreground">{total}</span>{" "}
            truyện đang ra
          </p>
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
                    href={`/dang-ra?page=${page - 1}`}
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
                        href={`/dang-ra?page=${pageNum}`}
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
                    href={`/dang-ra?page=${page + 1}`}
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
            <p className="text-muted-foreground">Chưa có truyện đang ra nào.</p>
          </div>
        )}

        {/* SEO Content Block */}
        <div className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Truyện Đang Ra - Theo Dõi Truyện Cập Nhật Mới Nhất</h2>
          <p>
            <strong>Truyện đang ra</strong> là những tác phẩm đang trong quá
            trình sáng tác và cập nhật chương mới thường xuyên. Đây là lựa chọn
            hoàn hảo cho những độc giả thích cảm giác háo hức chờ đợi chương mới
            và muốn trải nghiệm câu chuyện từng chút một theo thời gian.
          </p>
          <p>
            Nền tảng của chúng tôi tập hợp hàng nghìn truyện đang cập nhật hàng
            ngày với nhiều thể loại đa dạng. Từ huyền huyễn, tiên hiệp đến ngôn
            tình, đô thị, bạn sẽ luôn tìm thấy những câu chuyện hấp dẫn với nội
            dung mới liên tục. Tất cả truyện đều được sắp xếp theo thời gian cập
            nhật mới nhất để bạn dễ dàng theo dõi.
          </p>

          <h3>Ưu Điểm Của Việc Đọc Truyện Đang Ra</h3>
          <ul>
            <li>
              <strong>Luôn có nội dung mới:</strong> Với truyện đang cập nhật,
              bạn luôn có chương mới để đọc, tránh tình trạng "khát truyện" sau
              khi đọc hết một bộ.
            </li>
            <li>
              <strong>Tham gia cộng đồng:</strong> Đọc cùng thời điểm với nhiều
              người khác, bạn có thể tham gia thảo luận, dự đoán cốt truyện và
              chia sẻ cảm xúc.
            </li>
            <li>
              <strong>Ủng hộ tác giả:</strong> Lượt xem, bình luận và đánh giá
              của bạn là động lực lớn để tác giả tiếp tục sáng tác.
            </li>
            <li>
              <strong>Trải nghiệm độc đáo:</strong> Cảm giác háo hức chờ đợi
              chương mới và theo dõi diễn biến từng ngày mang lại trải nghiệm
              đọc truyện đặc biệt.
            </li>
            <li>
              <strong>Chất lượng đảm bảo:</strong> Truyện đang ra thường được
              biên tập kỹ càng hơn theo từng chương, đảm bảo chất lượng nội
              dung.
            </li>
          </ul>

          <h3>Các Thể Loại Truyện Đang Ra Phổ Biến</h3>
          <p>
            <strong>Truyện Huyền Huyễn - Tiên Hiệp Đang Ra:</strong> Theo dõi
            hành trình tu luyện của nhân vật từ yếu đến mạnh, từ phàm nhân lên
            tiên giới. Mỗi chương mới là một bước tiến trong việc phá vỡ giới
            hạn và chinh phục đỉnh cao tu tiên.
          </p>
          <p>
            <strong>Truyện Ngôn Tình Đang Cập Nhật:</strong> Chứng kiến tình yêu
            nảy nở và phát triển qua từng chương. Những tình tiết ngọt ngào, đau
            khổ, hiểu lầm và hóa giải được cập nhật liên tục khiến độc giả không
            thể rời mắt.
          </p>
          <p>
            <strong>Truyện Đô Thị Đang Ra:</strong> Cuộc sống hiện đại với những
            câu chuyện về tình yêu, sự nghiệp, gia đình được kể lại chân thực và
            gần gũi. Mỗi chương là một lát cắt của cuộc sống đầy màu sắc.
          </p>
          <p>
            <strong>Truyện Kiếm Hiệp Đang Cập Nhật:</strong> Giang hồ võ lâm với
            những cuộc tranh đấu khốc liệt, ân oán tình thù được dệt nên từng
            ngày. Theo dõi các cao thủ tuyệt đỉnh trên hành trình xưng bá võ
            lâm.
          </p>

          <h3>Làm Thế Nào Để Theo Dõi Truyện Đang Ra?</h3>
          <p>
            Để không bỏ lỡ chương mới của những truyện yêu thích, bạn nên đánh
            dấu truyện vào danh sách theo dõi. Hệ thống sẽ thông báo khi có
            chương mới được cập nhật, giúp bạn đọc ngay lập tức.
          </p>
          <p>
            Trang "Truyện Đang Ra" của chúng tôi được sắp xếp theo thời gian cập
            nhật mới nhất, với những truyện vừa ra chương mới sẽ hiển thị ở đầu
            danh sách. Bạn có thể ghé thăm trang này hàng ngày để khám phá nội
            dung mới từ các tác phẩm đang hot.
          </p>
          <p>
            Hãy tương tác với truyện bằng cách bình luận, đánh giá và chia sẻ
            cảm nhận của bạn. Điều này không chỉ giúp cộng đồng độc giả sôi động
            hơn mà còn là động lực lớn để tác giả tiếp tục cống hiến những
            chương hay nhất!
          </p>
        </div>
      </div>
    </>
  );
}
