"use client";

interface Genre {
  id: string;
  name: string;
  slug: string;
  name_vi: string;
}

interface FilterChipsProps {
  genres: Genre[];
  selectedGenres: string[];
  selectedStatus: string;
  onGenreToggle: (genreId: string) => void;
  onStatusChange: (status: string) => void;
}

export function FilterChips({
  genres,
  selectedGenres,
  selectedStatus,
  onGenreToggle,
  onStatusChange,
}: FilterChipsProps) {
  const statusOptions = [
    { value: "", label: "Tất cả" },
    { value: "completed", label: "Hoàn thành" },
    { value: "ongoing", label: "Đang ra" },
  ];

  return (
    <div className="space-y-4">
      {/* Status Chips */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-brown">Trạng thái</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedStatus === option.value
                  ? "bg-clay text-paper"
                  : "bg-paper-secondary border border-brown/20 text-brown hover:border-clay"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Chips */}
      <div>
        <h3 className="text-sm font-semibold mb-2 text-brown">Thể loại</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onGenreToggle(genre.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedGenres.includes(genre.id)
                  ? "bg-clay text-paper"
                  : "bg-paper-secondary border border-brown/20 text-brown hover:border-clay"
              }`}
            >
              {genre.name_vi}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
