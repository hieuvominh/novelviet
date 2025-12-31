import Link from "next/link";

interface CategorySEOContentProps {
  categoryName: string;
  categorySlug: string;
  description?: string;
}

export function CategorySEOContent({
  categoryName,
  categorySlug,
  description,
}: CategorySEOContentProps) {
  // Related genres mapping
  const relatedGenres: Record<string, Array<{ name: string; slug: string }>> = {
    "tien-hiep": [
      { name: "Huyền Huyễn", slug: "huyen-huyen" },
      { name: "Kiếm Hiệp", slug: "kiem-hiep" },
      { name: "Võng Du", slug: "vong-du" },
    ],
    "huyen-huyen": [
      { name: "Tiên Hiệp", slug: "tien-hiep" },
      { name: "Dị Giới", slug: "di-gioi" },
      { name: "Huyền Ảo", slug: "huyen-ao" },
    ],
    "ngon-tinh": [
      { name: "Đô Thị", slug: "do-thi" },
      { name: "Trọng Sinh", slug: "trong-sinh" },
      { name: "Nữ Cường", slug: "nu-cuong" },
    ],
    "do-thi": [
      { name: "Ngôn Tình", slug: "ngon-tinh" },
      { name: "Hài Hước", slug: "hai-huoc" },
      { name: "Đam Mỹ", slug: "dam-my" },
    ],
  };

  const related = relatedGenres[categorySlug] || [];

  return (
    <section className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto prose prose-gray dark:prose-invert">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Về thể loại {categoryName}
          </h2>

          {description ? (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {description}
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Truyện {categoryName} là một trong những thể loại được yêu thích
              hàng đầu tại TruyenDoc. Với hàng nghìn tác phẩm hay, cập nhật liên
              tục mỗi ngày, đây là nơi lý tưởng để bạn khám phá những câu chuyện
              hấp dẫn, đầy cảm xúc và giàu tưởng tượng.
            </p>
          )}

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Tại TruyenDoc, chúng tôi tuyển chọn và giới thiệu những tác phẩm{" "}
            {categoryName} chất lượng cao, từ những bộ truyện đình đám đến các
            sáng tác mới nổi. Mỗi tác phẩm đều được cập nhật nhanh chóng, đảm
            bảo bạn không bỏ lỡ bất kỳ chương nào.
          </p>

          {related.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Nếu bạn yêu thích {categoryName}, có thể bạn cũng quan tâm đến:
              </p>
              <div className="flex flex-wrap gap-2">
                {related.map((genre) => (
                  <Link
                    key={genre.slug}
                    href={`/the-loai/${genre.slug}`}
                    className="inline-block px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:text-primary transition-colors no-underline"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/hoan-thanh" className="text-primary hover:underline">
                Xem tất cả truyện hoàn thành
              </Link>{" "}
              |{" "}
              <Link href="/dang-ra" className="text-primary hover:underline">
                Truyện đang cập nhật
              </Link>{" "}
              |{" "}
              <Link href="/" className="text-primary hover:underline">
                Trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
