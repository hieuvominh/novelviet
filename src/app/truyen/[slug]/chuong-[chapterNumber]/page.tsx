import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { generateSEO } from "@/lib/utils/seo";
import { ChapterReader } from "@/components/chapters/chapter-reader";

// Revalidate every 30 minutes
export const revalidate = 1800;

async function getChapterByNumber(novelSlug: string, chapterNumber: number) {
  const supabase = await createClient();

  // First get the novel
  const { data: novel } = await supabase
    .from("novels")
    .select("id, title, slug")
    .eq("slug", novelSlug)
    .eq("is_published", true)
    .single();

  if (!novel) return null;

  // Then get the chapter
  const { data: chapter, error } = await supabase
    .from("chapters")
    .select(
      `
      *,
      novels!inner(id, title, slug, authors!inner(name, slug))
    `
    )
    .eq("novel_id", novel.id)
    .eq("chapter_number", chapterNumber)
    .eq("is_published", true)
    .single();

  if (error || !chapter) return null;

  return chapter;
}

async function getAdjacentChapters(
  novelId: string,
  currentChapterNumber: number
) {
  const supabase = await createClient();

  const [prevResult, nextResult] = await Promise.all([
    // Previous chapter
    supabase
      .from("chapters")
      .select("id, chapter_number, slug, title")
      .eq("novel_id", novelId)
      .eq("is_published", true)
      .lt("chapter_number", currentChapterNumber)
      .order("chapter_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Next chapter
    supabase
      .from("chapters")
      .select("id, chapter_number, slug, title")
      .eq("novel_id", novelId)
      .eq("is_published", true)
      .gt("chapter_number", currentChapterNumber)
      .order("chapter_number", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    prev: prevResult.data,
    next: nextResult.data,
  };
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapterNumber: string }>;
}): Promise<Metadata> {
  const { slug, chapterNumber } = await params;
  const chapterNum = parseInt(chapterNumber);

  const chapter = await getChapterByNumber(slug, chapterNum);

  if (!chapter) {
    return generateSEO({
      title: "Chương không tồn tại",
      description: "Không tìm thấy chương này",
    });
  }

  const title = `Chương ${chapter.chapter_number}: ${chapter.title} - ${chapter.novels.title}`;
  const description = `Đọc ${title}. Tác giả: ${chapter.novels.authors.name}`;

  return generateSEO({
    title,
    description,
    url: `/truyen/${slug}/chuong-${chapterNum}`,
  });
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapterNumber: string }>;
}) {
  const { slug, chapterNumber } = await params;
  const chapterNum = parseInt(chapterNumber);

  const chapter = await getChapterByNumber(slug, chapterNum);

  if (!chapter) {
    notFound();
  }

  const adjacentChapters = await getAdjacentChapters(
    chapter.novel_id,
    chapter.chapter_number
  );

  // Schema.org structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: `Chương ${chapter.chapter_number}: ${chapter.title}`,
    description: chapter.title,
    isPartOf: {
      "@type": "Book",
      name: chapter.novels.title,
      author: {
        "@type": "Person",
        name: chapter.novels.authors.name,
      },
    },
    position: chapter.chapter_number,
    inLanguage: "vi",
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href={`/truyen/${slug}`} className="hover:text-primary">
            {chapter.novels.title}
          </Link>
          <span>/</span>
          <span className="text-foreground">
            Chương {chapter.chapter_number}
          </span>
        </nav>

        {/* Chapter Navigation Top */}
        <div className="flex items-center justify-between gap-4 mb-6 p-4 rounded-lg border bg-card">
          <Link
            href={`/truyen/${slug}`}
            className="flex items-center gap-2 text-sm hover:text-primary"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Danh sách chương
          </Link>

          <div className="flex items-center gap-2">
            {adjacentChapters.prev ? (
              <Link
                href={`/truyen/${slug}/chuong-${adjacentChapters.prev.chapter_number}`}
                className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
              >
                ← Chương trước
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2 border rounded-lg opacity-50 cursor-not-allowed text-sm"
              >
                ← Chương trước
              </button>
            )}

            {adjacentChapters.next ? (
              <Link
                href={`/truyen/${slug}/chuong-${adjacentChapters.next.chapter_number}`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                Chương sau →
              </Link>
            ) : (
              <button
                disabled
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg cursor-not-allowed text-sm"
              >
                Chương sau →
              </button>
            )}
          </div>
        </div>

        {/* Chapter Reader Component (Client-side for tracking) */}
        <ChapterReader
          chapter={{
            id: chapter.id,
            novelId: chapter.novel_id,
            novelSlug: slug,
            chapterNumber: chapter.chapter_number,
            title: chapter.title,
            content: chapter.content,
            wordCount: chapter.word_count,
          }}
        />

        {/* Chapter Navigation Bottom */}
        <div className="flex items-center justify-between gap-4 mt-8 p-4 rounded-lg border bg-card">
          {adjacentChapters.prev ? (
            <Link
              href={`/truyen/${slug}/chuong-${adjacentChapters.prev.chapter_number}`}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="text-xs text-muted-foreground mb-1">
                Chương trước
              </div>
              <div className="font-medium line-clamp-1">
                C{adjacentChapters.prev.chapter_number}:{" "}
                {adjacentChapters.prev.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1 px-4 py-3 border rounded-lg opacity-50">
              <div className="text-xs text-muted-foreground mb-1">
                Chương trước
              </div>
              <div className="font-medium">Không có</div>
            </div>
          )}

          <Link
            href={`/truyen/${slug}`}
            className="px-6 py-3 border rounded-lg hover:bg-accent transition-colors font-medium"
          >
            Danh sách
          </Link>

          {adjacentChapters.next ? (
            <Link
              href={`/truyen/${slug}/chuong-${adjacentChapters.next.chapter_number}`}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <div className="text-xs opacity-90 mb-1">Chương sau</div>
              <div className="font-medium line-clamp-1">
                C{adjacentChapters.next.chapter_number}:{" "}
                {adjacentChapters.next.title}
              </div>
            </Link>
          ) : (
            <div className="flex-1 px-4 py-3 bg-muted text-muted-foreground rounded-lg">
              <div className="text-xs mb-1">Chương sau</div>
              <div className="font-medium">Chưa có</div>
            </div>
          )}
        </div>

        {/* Back to novel */}
        <div className="text-center mt-8">
          <Link
            href={`/truyen/${slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-accent transition-colors"
          >
            Quay lại trang truyện
          </Link>
        </div>
      </div>
    </>
  );
}
