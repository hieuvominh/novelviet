interface ChapterHeaderProps {
  chapterNumber: number;
  chapterTitle: string;
}

export function ChapterHeader({
  chapterNumber,
  chapterTitle,
}: ChapterHeaderProps) {
  return (
    <div className="mb-8 pb-6 border-b border-gray-200/40">
      <div className="text-sm opacity-60 mb-2">Chương {chapterNumber}</div>
      <h1 className="text-2xl md:text-3xl font-bold">{chapterTitle}</h1>
    </div>
  );
}
