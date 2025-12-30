import { ReactNode } from "react";

interface TwoColumnSectionProps {
  left: ReactNode;
  right: ReactNode;
}

export function TwoColumnSection({ left, right }: TwoColumnSectionProps) {
  return (
    <section className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          {/* Left Section - Wider */}
          <div>{left}</div>

          {/* Right Section - Narrower */}
          <div>{right}</div>
        </div>
      </div>
    </section>
  );
}
