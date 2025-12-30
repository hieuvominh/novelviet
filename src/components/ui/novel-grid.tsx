import { ReactNode } from "react";

interface NovelGridProps {
  children: ReactNode;
  variant?: "default" | "compact";
}

export function NovelGrid({ children, variant = "default" }: NovelGridProps) {
  const gridClasses =
    variant === "compact"
      ? "grid grid-cols-1 gap-3"
      : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4";

  return <div className={gridClasses}>{children}</div>;
}
