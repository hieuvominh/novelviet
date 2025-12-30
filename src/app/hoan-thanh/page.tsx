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

async function getCompletedNovels(page: number = 1, perPage: number = 24) {
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
      rating_average,
      rating_count,
      bookmark_count,
      last_chapter_at,
      authors!inner(name, slug)
    `,
      { count: "exact" }
    )
    .eq("is_published", true)
    .eq("status", "completed")
    .order("view_count_total", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) {
    console.error("Error fetching completed novels:", error);
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
    title: `Truyện Hoàn Thành${pageText} - Danh Sách Truyện Full Hay Nhất`,
    description:
      "Đọc truyện hoàn thành, truyện full hay nhất. Danh sách truyện đã hoàn kết với cốt truyện chặt chẽ, kết thúc trọn vẹn. Cập nhật liên tục.",
    url: "/hoan-thanh",
  });
}

export default async function CompletedNovelsPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || "1");
  const { novels, total } = await getCompletedNovels(page);
  const totalPages = Math.ceil(total / 24);

  // Schema.org CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Truyện Hoàn Thành - Truyện Full",
    description: "Danh sách truyện hoàn thành, đã có kết thúc trọn vẹn",
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
          name: "Truyện Hoàn Thành",
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
          <span className="text-foreground">Truyện Hoàn Thành</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            📚 Truyện Hoàn Thành - Truyện Full
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Danh sách truyện đã hoàn kết, có kết thúc trọn vẹn. Đọc ngay không
            lo dở dang!
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Tìm thấy{" "}
            <span className="font-semibold text-foreground">{total}</span>{" "}
            truyện hoàn thành
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
                    href={`/hoan-thanh?page=${page - 1}`}
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
                        href={`/hoan-thanh?page=${pageNum}`}
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
                    href={`/hoan-thanh?page=${page + 1}`}
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
              Chưa có truyện hoàn thành nào.
            </p>
          </div>
        )}

        {/* SEO Content Block */}
        <div className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
          <h2>Truyện Hoàn Thành - Truyện Full Hay Nhất</h2>
          <p>
            <strong>Truyện hoàn thành</strong> hay <strong>truyện full</strong>{" "}
            là những tác phẩm đã được tác giả kết thúc trọn vẹn, không còn tình
            trạng dở dang hay bỏ nửa chừng. Đây là lựa chọn hoàn hảo cho những
            độc giả muốn có trải nghiệm đọc truyện liền mạch từ đầu đến cuối mà
            không phải chờ đợi chương mới.
          </p>
          <p>
            Trang web của chúng tôi tự hào sở hữu một kho tàng truyện hoàn thành
            đa dạng với hàng nghìn tác phẩm thuộc nhiều thể loại khác nhau:
            huyền huyễn, tiên hiệp, kiếm hiệp, ngôn tình, đô thị, và nhiều hơn
            nữa. Tất cả đều đã có kết thúc trọn vẹn, đảm bảo mang đến cho bạn
            những câu chuyện hoàn chỉnh với cái kết thỏa đáng.
          </p>

          <h3>Tại Sao Nên Đọc Truyện Hoàn Thành?</h3>
          <ul>
            <li>
              <strong>Không lo dở dang:</strong> Truyện đã có kết thúc, bạn có
              thể yên tâm đọc từ đầu đến cuối mà không lo tác giả bỏ dở hoặc
              ngừng viết giữa chừng.
            </li>
            <li>
              <strong>Đọc liền mạch:</strong> Không cần chờ đợi chương mới, bạn
              có thể "cày" hết cả bộ truyện trong thời gian ngắn nếu muốn.
            </li>
            <li>
              <strong>Cốt truyện hoàn chỉnh:</strong> Các tình tiết được triển
              khai và giải quyết trọn vẹn, mang lại sự hài lòng cho độc giả.
            </li>
            <li>
              <strong>Đánh giá chính xác:</strong> Với truyện full, bạn có thể
              đọc đánh giá của người khác về cả bộ truyện, không chỉ vài chương
              đầu.
            </li>
            <li>
              <strong>Tiết kiệm thời gian:</strong> Không mất thời gian theo dõi
              lịch ra chương, chỉ cần tải xuống hoặc đọc online khi rảnh rỗi.
            </li>
          </ul>

          <h3>Các Thể Loại Truyện Hoàn Thành Phổ Biến</h3>
          <p>
            <strong>Truyện Huyền Huyễn - Tiên Hiệp Full:</strong> Các tác phẩm
            tu tiên, tu chân đã hoàn kết với hành trình tu luyện đầy gian nan
            của nhân vật chính. Từ phàm nhân trở thành cao thủ, xưng bá thiên hạ
            với những trận chiến hoành tráng.
          </p>
          <p>
            <strong>Truyện Ngôn Tình Hoàn Thành:</strong> Câu chuyện tình yêu
            ngọt ngào đã có hồi kết với happy ending đầy lãng mạn. Các cặp đôi
            đã vượt qua mọi thử thách để đến với nhau.
          </p>
          <p>
            <strong>Truyện Kiếm Hiệp Full:</strong> Giang hồ võ lâm với những
            cao thủ tuyệt đỉnh, các môn phái tranh đấu quyết liệt đã được giải
            quyết ân oán, mang lại hòa bình cho võ lâm.
          </p>
          <p>
            <strong>Truyện Đô Thị Hoàn Thành:</strong> Cuộc sống hiện đại với
            những câu chuyện về tình yêu, sự nghiệp, gia đình đã có kết cục viên
            mãn, nhân vật đạt được mục tiêu cuộc sống.
          </p>

          <h3>Làm Thế Nào Để Tìm Truyện Full Hay?</h3>
          <p>
            Trên trang web của chúng tôi, tất cả truyện hoàn thành được sắp xếp
            theo lượt xem, đánh giá và độ phổ biến. Bạn có thể dễ dàng tìm thấy
            những tác phẩm chất lượng cao được cộng đồng độc giả yêu thích nhất.
          </p>
          <p>
            Mỗi truyện đều có thông tin chi tiết về tác giả, thể loại, số
            chương, đánh giá trung bình và tóm tắt nội dung. Hãy đọc qua phần mô
            tả và một vài chương đầu để xem tác phẩm có phù hợp với khẩu vị của
            bạn hay không.
          </p>
          <p>
            Đừng quên đánh giá và bình luận cho những truyện hoàn thành mà bạn
            yêu thích! Điều này sẽ giúp những độc giả khác dễ dàng tìm thấy
            những tác phẩm chất lượng và ủng hộ tác giả tiếp tục sáng tác những
            câu chuyện hay hơn nữa.
          </p>
        </div>
      </div>
    </>
  );
}
