import { Metadata } from "next";
import Link from "next/link";
import { NovelCard } from "@/components/novels/novel-card";
import { CategoryFilters } from "@/components/category/category-filters";
import { CategoryPagination } from "@/components/category/category-pagination";
import { CategorySEOContent } from "@/components/category/category-seo-content";
import { CategoryEmptyState } from "@/components/category/category-empty-state";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

// Mock category data - Replace with real data fetching
const mockCategories: Record<
  string,
  {
    name: string;
    nameVi: string;
    description: string;
    metaDescription: string;
    novelCount: number;
  }
> = {
  "tien-hiep": {
    name: "Tiên Hiệp",
    nameVi: "Tiên Hiệp",
    description:
      "Truyện tu tiên, tu đạo, thế giới huyền ảo phương Đông với các tu sĩ, pháp bảo và đấu pháp kịch tính.",
    metaDescription:
      "Đọc truyện Tiên Hiệp hay nhất, cập nhật nhanh nhất. Hàng nghìn tác phẩm tu tiên, tu đạo hấp dẫn.",
    novelCount: 12345,
  },
  "huyen-huyen": {
    name: "Huyền Huyễn",
    nameVi: "Huyền Huyễn",
    description:
      "Thế giới huyền ảo với ma pháp, dị năng, sinh vật thần thoại và những cuộc phiêu lưu kỳ ảo.",
    metaDescription:
      "Truyện Huyền Huyễn hay, cập nhật liên tục. Khám phá thế giới phép thuật và phiêu lưu.",
    novelCount: 8756,
  },
  "ngon-tinh": {
    name: "Ngôn Tình",
    nameVi: "Ngôn Tình",
    description:
      "Truyện tình cảm lãng mạn, ngọt ngào với những câu chuyện về tình yêu, hôn nhân và gia đình.",
    metaDescription:
      "Đọc truyện Ngôn Tình hay nhất 2025. Tình cảm lãng mạn, ngọt ngào, cập nhật mỗi ngày.",
    novelCount: 15623,
  },
  "do-thi": {
    name: "Đô Thị",
    nameVi: "Đô Thị",
    description:
      "Cuộc sống thành thị hiện đại với những câu chuyện về công việc, tình yêu và cuộc sống đời thường.",
    metaDescription:
      "Truyện Đô Thị hay, gần gũi với cuộc sống. Cập nhật nhanh, đa dạng thể loại.",
    novelCount: 9834,
  },
};

// Mock novels - Replace with real data fetching
const generateMockNovels = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `novel-${i + 1}`,
    title: `Truyện Mẫu ${i + 1}`,
    slug: `truyen-mau-${i + 1}`,
    coverImage: `https://picsum.photos/seed/${i + 1}/400/600`,
    author: {
      id: `author-${i + 1}`,
      name: `Tác giả ${i + 1}`,
      slug: `tac-gia-${i + 1}`,
    },
    status: i % 3 === 0 ? ("completed" as const) : ("ongoing" as const),
    viewCount: Math.floor(Math.random() * 1000000),
    rating: 4.0 + Math.random(),
    totalChapters: Math.floor(Math.random() * 1000) + 50,
  }));
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = mockCategories[slug];

  if (!category) {
    return {
      title: "Thể loại không tồn tại",
    };
  }

  return {
    title: `Truyện ${category.nameVi} Hay Nhất 2025 | TruyenDoc`,
    description: category.metaDescription,
    openGraph: {
      title: `Truyện ${category.nameVi} Hay Nhất`,
      description: category.metaDescription,
      type: "website",
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;

  const category = mockCategories[slug];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Thể loại không tồn tại
          </h1>
          <Link href="/" className="text-primary hover:underline">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const currentPage = parseInt(page);
  const itemsPerPage = 24;
  const mockNovels = generateMockNovels(itemsPerPage);
  const totalNovels = category.novelCount;
  const totalPages = Math.ceil(totalNovels / itemsPerPage);

  const hasNovels = mockNovels.length > 0;

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <nav
        className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 py-3"
        aria-label="Breadcrumb"
      >
        <div className="container mx-auto px-4 md:px-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                Trang chủ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href="/the-loai"
                className="text-gray-600 dark:text-gray-400 hover:text-primary"
              >
                Thể loại
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 dark:text-gray-100 font-medium">
              {category.nameVi}
            </li>
          </ol>
        </div>
      </nav>

      {/* Category Header */}
      <header className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl">
            {/* H1 - SEO Critical */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {category.nameVi}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {category.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <span className="font-semibold">
                  {totalNovels.toLocaleString()} truyện
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Cập nhật mỗi ngày</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter & Sort Bar */}
      <CategoryFilters />

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        {hasNovels ? (
          <>
            {/* Section Title - H2 for SEO */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Danh sách truyện {category.nameVi}
            </h2>

            {/* Novel Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
              {mockNovels.map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>

            {/* Pagination */}
            <CategoryPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/the-loai/${slug}`}
            />
          </>
        ) : (
          <CategoryEmptyState />
        )}
      </main>

      {/* SEO Content Block */}
      <CategorySEOContent
        categoryName={category.nameVi}
        categorySlug={slug}
        description={category.description}
      />
    </div>
  );
}
