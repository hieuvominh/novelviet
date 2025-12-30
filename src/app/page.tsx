import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { HeroSlider } from "@/components/novels/hero-slider";
import { NovelCardCompact } from "@/components/novels/novel-card-compact";
import { HorizontalSection } from "@/components/sections/horizontal-section";
import { TwoColumnSection } from "@/components/sections/two-column-section";
import { TrendingList } from "@/components/sections/trending-list";
import { CategorySection } from "@/components/sections/category-section";
import { RankingChart } from "@/components/sections/ranking-chart";

// Revalidate every 5 minutes
export const revalidate = 300;

async function getHotNovels(limit: number = 12) {
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
      view_count_daily,
      rating_average,
      rating_count,
      last_chapter_at,
      authors!inner(name, slug)
    `
    )
    .eq("is_published", true)
    .order("view_count_daily", { ascending: false })
    .order("rating_average", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching hot novels:", error);
    return [];
  }

  return data
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
}

async function getTrendingWeekly() {
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
      view_count_weekly,
      rating_average,
      rating_count,
      last_chapter_at,
      authors!inner(name, slug)
    `
    )
    .eq("is_published", true)
    .order("view_count_weekly", { ascending: false })
    .order("rating_average", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching trending novels:", error);
    return [];
  }

  return data
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
}

async function getLatestUpdated() {
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
      last_chapter_at,
      authors!inner(name, slug)
    `
    )
    .eq("is_published", true)
    .not("last_chapter_at", "is", null)
    .order("last_chapter_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching latest novels:", error);
    return [];
  }

  return data
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
}

async function getCompletedNovels() {
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
      last_chapter_at,
      authors!inner(name, slug)
    `
    )
    .eq("is_published", true)
    .eq("status", "completed")
    .order("view_count_total", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching completed novels:", error);
    return [];
  }

  return data
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
}

// Mock data for testing UI
const mockNovels = [
  {
    id: "1",
    title: "Võ Thần Thiên Hạ",
    slug: "vo-than-thien-ha",
    description:
      "Một thiếu niên bình thường bước vào con đường tu luyện võ đạo, vượt qua muôn vàn thử thách để trở thành võ thần tối cao. Câu chuyện về nghị lực, tình bạn và sức mạnh vượt qua giới hạn.",
    cover_url: "https://picsum.photos/seed/novel1/400/600",
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
    id: "2",
    title: "Tình Yêu Không Có Lỗi",
    slug: "tinh-yeu-khong-co-loi",
    description:
      "Một câu chuyện ngôn tình hiện đại về hai con người từ hai thế giới khác nhau. Tình yêu có thể vượt qua mọi rào cản hay sẽ tan vỡ trước thực tại?",
    cover_url: "https://picsum.photos/seed/novel2/400/600",
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
    id: "3",
    title: "Trọng Sinh Chi Đô Thị Tu Tiên",
    slug: "trong-sinh-chi-do-thi-tu-tien",
    description:
      "Trọng sinh về quá khứ với ký ức 500 năm tu tiên, anh quyết tâm thay đổi vận mệnh, xây dựng đế chế và bảo vệ những người mình yêu thương trong đời này.",
    cover_url: "https://picsum.photos/seed/novel3/400/600",
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
    id: "4",
    title: "Kiếm Đạo Độc Tôn",
    slug: "kiem-dao-doc-ton",
    description:
      "Kiếm đạo vô song, một mình ta tôn! Thiếu niên mồ côi với thiên phú kiếm đạo bước vào con đường tu luyện gian nan, quyết tâm đạt đến đỉnh cao kiếm đạo.",
    cover_url: "https://picsum.photos/seed/novel4/400/600",
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
    id: "5",
    title: "Nữ Đế Trọng Sinh",
    slug: "nu-de-trong-sinh",
    description:
      "Từng là nữ đế thống trị vạn giới, sau khi trọng sinh cô quyết tâm thay đổi bi kịch kiếp trước. Lần này, cô sẽ mạnh mẽ hơn, thông minh hơn và không để ai làm tổn thương mình.",
    cover_url: "https://picsum.photos/seed/novel5/400/600",
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
  {
    id: "6",
    title: "Toàn Chức Pháp Sư",
    slug: "toan-chuc-phap-su",
    description:
      "Xuyên không đến thế giới ma pháp, anh phát hiện mình có thể học được mọi hệ ma pháp. Từ pháp sư tập sự đến pháp thần toàn năng, đây là hành trình chinh phục thế giới ma pháp.",
    cover_url: "https://picsum.photos/seed/novel6/400/600",
    status: "completed" as const,
    total_chapters: 2800,
    view_count_total: 45000000,
    view_count_daily: 28000,
    view_count_weekly: 195000,
    rating_average: 4.9,
    rating_count: 35000,
    last_chapter_at: "2024-11-15T14:00:00Z",
    author: { name: "Loạn", slug: "loan" },
  },
  {
    id: "7",
    title: "Đế Bá",
    slug: "de-ba",
    description:
      "Vạn đạo tranh hùng, ai mới là đế bá? Thiên tài tu luyện với tham vọng thống nhất vạn giới, viết nên huyền thoại bất diệt qua vô số cuộc chiến sinh tử.",
    cover_url: "https://picsum.photos/seed/novel7/400/600",
    status: "ongoing" as const,
    total_chapters: 3200,
    view_count_total: 52000000,
    view_count_daily: 88000,
    view_count_weekly: 615000,
    rating_average: 4.8,
    rating_count: 42000,
    last_chapter_at: "2024-12-30T13:00:00Z",
    author: { name: "Yến Vũ Giang Nam", slug: "yen-vu-giang-nam" },
  },
  {
    id: "8",
    title: "Linh Vũ Thiên Hạ",
    slug: "linh-vu-thien-ha",
    description:
      "Thiên hạ đại loạn, anh hùng xuất hiện. Thiếu niên với linh thú tối cường bước vào giang hồ đẫm máu, vượt qua muôn vàn kẻ địch để trở thành bá chủ một phương.",
    cover_url: "https://picsum.photos/seed/novel8/400/600",
    status: "ongoing" as const,
    total_chapters: 1420,
    view_count_total: 16500000,
    view_count_daily: 42000,
    view_count_weekly: 295000,
    rating_average: 4.6,
    rating_count: 13800,
    last_chapter_at: "2024-12-30T08:00:00Z",
    author: { name: "Phong Thanh Dương", slug: "phong-thanh-duong" },
  },
  {
    id: "9",
    title: "Hồng Hoang Chi Lực",
    slug: "hong-hoang-chi-luc",
    description:
      "Sức mạnh tuyệt đối là chân lý duy nhất! Xuyên không về thời kỳ hồng hoang, anh dựa vào sức mạnh thể chất vô song để chinh phục thế giới đầy nguy hiểm này.",
    cover_url: "https://picsum.photos/seed/novel9/400/600",
    status: "completed" as const,
    total_chapters: 1150,
    view_count_total: 9800000,
    view_count_daily: 8500,
    view_count_weekly: 59000,
    rating_average: 4.5,
    rating_count: 7200,
    last_chapter_at: "2024-10-05T10:00:00Z",
    author: {
      name: "Tuyết Nguyệt Ngụy Phong",
      slug: "tuyet-nguyet-nguy-phong",
    },
  },
  {
    id: "10",
    title: "Tu La Võ Thần",
    slug: "tu-la-vo-than",
    description:
      "Tu La đạo, võ thần lộ! Bị phản bội và giết hại, anh trọng sinh với lòng căm thù. Lần này, anh sẽ trở thành tu la võ thần, khiến những kẻ thù phải trả giá đắt.",
    cover_url: "https://picsum.photos/seed/novel10/400/600",
    status: "ongoing" as const,
    total_chapters: 1680,
    view_count_total: 21000000,
    view_count_daily: 58000,
    view_count_weekly: 405000,
    rating_average: 4.7,
    rating_count: 18500,
    last_chapter_at: "2024-12-30T07:00:00Z",
    author: { name: "Thiện Lương Đích Mi Mễ", slug: "thien-luong-dich-mi-me" },
  },
  {
    id: "11",
    title: "Ngạo Thế Cửu Trọng Thiên",
    slug: "ngao-the-cuu-trong-thien",
    description:
      "Chín tầng trời, ai dám xưng tôn? Thiên tài kiếm đạo với tâm kiếm bất diệt, dù bị cả thế giới chống lại vẫn kiên định bước trên con đường của mình.",
    cover_url: "https://picsum.photos/seed/novel11/400/600",
    status: "completed" as const,
    total_chapters: 1950,
    view_count_total: 28000000,
    view_count_daily: 15000,
    view_count_weekly: 105000,
    rating_average: 4.9,
    rating_count: 25000,
    last_chapter_at: "2024-09-20T16:00:00Z",
    author: { name: "Phong Lăng Thiên Hạ", slug: "phong-lang-thien-ha" },
  },
  {
    id: "12",
    title: "Huyết Sắc Lãng Mạn",
    slug: "huyet-sac-lang-man",
    description:
      "Ma cà rồng và thợ săn, kẻ thù truyền kiếp nhưng lại yêu nhau. Một mối tình bi kịch giữa ánh sáng và bóng tối, giữa tình yêu và nghĩa vụ.",
    cover_url: "https://picsum.photos/seed/novel12/400/600",
    status: "ongoing" as const,
    total_chapters: 520,
    view_count_total: 6500000,
    view_count_daily: 22000,
    view_count_weekly: 154000,
    rating_average: 4.6,
    rating_count: 5800,
    last_chapter_at: "2024-12-30T06:00:00Z",
    author: { name: "Dạ Thần Cánh", slug: "da-than-canh" },
  },
  {
    id: "13",
    title: "Huyết Sắc Lãng Mạn",
    slug: "huyet-sac-lang-man",
    description:
      "Ma cà rồng và thợ săn, kẻ thù truyền kiếp nhưng lại yêu nhau. Một mối tình bi kịch giữa ánh sáng và bóng tối, giữa tình yêu và nghĩa vụ.",
    cover_url: "https://picsum.photos/seed/novel12/400/600",
    status: "ongoing" as const,
    total_chapters: 520,
    view_count_total: 6500000,
    view_count_daily: 22000,
    view_count_weekly: 154000,
    rating_average: 4.6,
    rating_count: 5800,
    last_chapter_at: "2024-12-30T06:00:00Z",
    author: { name: "Dạ Thần Cánh", slug: "da-than-canh" },
  },
  {
    id: "14",
    title: "Huyết Sắc Lãng Mạn",
    slug: "huyet-sac-lang-man",
    description:
      "Ma cà rồng và thợ săn, kẻ thù truyền kiếp nhưng lại yêu nhau. Một mối tình bi kịch giữa ánh sáng và bóng tối, giữa tình yêu và nghĩa vụ.",
    cover_url: "https://picsum.photos/seed/novel12/400/600",
    status: "ongoing" as const,
    total_chapters: 520,
    view_count_total: 6500000,
    view_count_daily: 22000,
    view_count_weekly: 154000,
    rating_average: 4.6,
    rating_count: 5800,
    last_chapter_at: "2024-12-30T06:00:00Z",
    author: { name: "Dạ Thần Cánh", slug: "da-than-canh" },
  },
  {
    id: "15",
    title: "Huyết Sắc Lãng Mạn",
    slug: "huyet-sac-lang-man",
    description:
      "Ma cà rồng và thợ săn, kẻ thù truyền kiếp nhưng lại yêu nhau. Một mối tình bi kịch giữa ánh sáng và bóng tối, giữa tình yêu và nghĩa vụ.",
    cover_url: "https://picsum.photos/seed/novel12/400/600",
    status: "ongoing" as const,
    total_chapters: 520,
    view_count_total: 6500000,
    view_count_daily: 22000,
    view_count_weekly: 154000,
    rating_average: 4.6,
    rating_count: 5800,
    last_chapter_at: "2024-12-30T06:00:00Z",
    author: { name: "Dạ Thần Cánh", slug: "da-than-canh" },
  },
  {
    id: "16",
    title: "Huyết Sắc Lãng Mạn",
    slug: "huyet-sac-lang-man",
    description:
      "Ma cà rồng và thợ săn, kẻ thù truyền kiếp nhưng lại yêu nhau. Một mối tình bi kịch giữa ánh sáng và bóng tối, giữa tình yêu và nghĩa vụ.",
    cover_url: "https://picsum.photos/seed/novel12/400/600",
    status: "ongoing" as const,
    total_chapters: 520,
    view_count_total: 6500000,
    view_count_daily: 22000,
    view_count_weekly: 154000,
    rating_average: 4.6,
    rating_count: 5800,
    last_chapter_at: "2024-12-30T06:00:00Z",
    author: { name: "Dạ Thần Cánh", slug: "da-than-canh" },
  },
  {
    id: "17",
    title: "Huyết Sắc Lãng Mạn",
    slug: "huyet-sac-lang-man",
    description:
      "Ma cà rồng và thợ săn, kẻ thù truyền kiếp nhưng lại yêu nhau. Một mối tình bi kịch giữa ánh sáng và bóng tối, giữa tình yêu và nghĩa vụ.",
    cover_url: "https://picsum.photos/seed/novel12/400/600",
    status: "ongoing" as const,
    total_chapters: 520,
    view_count_total: 6500000,
    view_count_daily: 22000,
    view_count_weekly: 154000,
    rating_average: 4.6,
    rating_count: 5800,
    last_chapter_at: "2024-12-30T06:00:00Z",
    author: { name: "Dạ Thần Cánh", slug: "da-than-canh" },
  },
];

export default async function Home() {
  // Use mock data for testing
  const heroNovels = mockNovels.slice(0, 5); // Get 5 novels for slider
  const hotNovelsList = mockNovels.slice(5, 12);
  const latestUpdated = mockNovels.slice(0, 10); // 10 items for 2x5 grid
  const trendingWeekly = mockNovels.slice(3, 9);
  const trendingTop10 = mockNovels.slice(0, 10); // Top 10 for ranking list
  const completedNovels = mockNovels.slice(0, 20); // 20 novels for completed section

  // Mock categories for CategorySection
  const mockCategories = [
    { id: "romance", name: "Ngôn Tình", slug: "ngon-tinh" },
    { id: "fantasy", name: "Huyền Huyễn", slug: "huyen-huyen" },
    { id: "cultivation", name: "Tu Tiên", slug: "tu-tien" },
    { id: "historical", name: "Cổ Đại", slug: "co-dai" },
    { id: "modern", name: "Đô Thị", slug: "do-thi" },
    { id: "scifi", name: "Khoa Huyễn", slug: "khoa-huyen" },
  ];

  // Organize novels by category (mock data - in production, fetch from database)
  const novelsByCategory = {
    romance: mockNovels.slice(0, 10),
    fantasy: mockNovels.slice(2, 12),
    cultivation: mockNovels.slice(1, 11),
    historical: mockNovels.slice(3, 13),
    modern: mockNovels.slice(4, 14),
    scifi: mockNovels.slice(5, 15),
  };

  /* Real data fetching - uncomment when ready to use database
  const [hotNovels, trendingWeekly, latestUpdated, completedNovels] =
    await Promise.all([
      getHotNovels(5), // Get 5 for hero slider
      getTrendingWeekly(),
      getLatestUpdated(),
      getCompletedNovels(),
    ]);

  const heroNovels = hotNovels;
  const moreHotNovels = await getHotNovels(20);
  const hotNovelsList = moreHotNovels.slice(5, 17);
  */

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider novels={heroNovels} />

      {/* Hot Today Section */}
      <HorizontalSection title="Hot Hôm Nay" href="/dang-ra">
        {hotNovelsList.map((novel) => (
          <NovelCardCompact
            key={novel.id}
            novel={novel}
            showChapterCount={false}
            imageAspect="aspect-[0.7]"
          />
        ))}
      </HorizontalSection>

      {/* Latest Updates + Trending Weekly */}
      <TwoColumnSection
        left={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                Siêu Phẩm Đang Hot
              </h2>
              <Link
                href="/dang-ra"
                className="text-primary hover:underline text-sm md:text-base flex items-center gap-1"
              >
                Xem thêm
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
              {latestUpdated.map((novel) => (
                <NovelCardCompact
                  key={`${novel.id}-${novel.slug}`}
                  novel={novel}
                  className="w-full"
                  imageAspect="aspect-[0.8]"
                />
              ))}
            </div>
          </div>
        }
        right={<TrendingList title="Xu Hướng Tuần" novels={trendingTop10} />}
      />

      {/* Category Section */}
      <CategorySection
        categories={mockCategories}
        novelsByCategory={novelsByCategory}
      />

      {/* Completed Novels Section */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            Top Truyện Thịnh Hành
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {completedNovels.slice(0, 4).map((novel) => (
              <NovelCardCompact
                key={novel.id}
                novel={novel}
                imageAspect="aspect-[4/5]"
                className="w-full"
                showChapterCount={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Ranking Chart Section */}
      <RankingChart
        risingNovels={mockNovels.slice(0, 9)}
        newReleasesNovels={mockNovels.slice(3, 12)}
        popularityNovels={mockNovels.slice(1, 10)}
      />

      {/* Completed Novels - 2 rows x 10 columns */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold">Truyện Hoàn Thành</h2>
            <Link
              href="/hoan-thanh"
              className="text-primary hover:underline text-sm md:text-base flex items-center gap-1"
            >
              Xem thêm
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3 md:gap-4">
            {completedNovels.map((novel) => (
              <NovelCardCompact
                key={novel.id}
                novel={novel}
                className="w-full"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
