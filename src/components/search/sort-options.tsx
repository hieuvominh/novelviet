"use client";

interface SortOptionsProps {
  selectedSort: string;
  onSortChange: (sort: string) => void;
}

export function SortOptions({ selectedSort, onSortChange }: SortOptionsProps) {
  const sortOptions = [
    { value: "hot", label: "Hot nhất" },
    { value: "new", label: "Mới cập nhật" },
    { value: "rating", label: "Đánh giá cao" },
    { value: "views", label: "Lượt xem" },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-brown">Sắp xếp:</span>
      <div className="flex gap-2 overflow-x-auto">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              selectedSort === option.value
                ? "bg-clay text-paper"
                : "bg-paper-secondary text-brown hover:bg-clay/20"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
