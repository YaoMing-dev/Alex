// frontend/src/components/vocabulary/ThemeSection.tsx
import React, { useRef, useState, useCallback, MouseEventHandler } from 'react';
import { SortBySelect } from '../common/SortBySelect';
import { SearchInput } from '../common/SearchInput';
import { cn } from "@/lib/utils";

interface ThemeSectionProps {
  title: string;
  themeType: 'regular' | 'special' | 'completed';
  currentItems?: React.ReactNode[];
  className?: string;
  currentSort: string;
  onSortChange: (sort: string) => void;
  onSearch: (query: string) => void;
}

export const ThemeSection: React.FC<ThemeSectionProps> = ({
  title,
  className,
  currentSort,
  onSortChange,
  onSearch,
  currentItems
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    e.currentTarget.style.userSelect = 'none';
    setStartX(e.pageX - e.currentTarget.offsetLeft);
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsDragging(false);
    if (scrollRef.current) scrollRef.current.style.userSelect = 'auto';
  }, []);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
    if (scrollRef.current) scrollRef.current.style.userSelect = 'auto';
  }, []);

  const onMouseMove = useCallback<MouseEventHandler<HTMLDivElement>>((e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX) * 1;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const items = currentItems;
  const hasItems = items && items.length > 0; // Kiem tra neu co items

  return (
    <section className={cn("py-4 sm:py-6 md:py-8", className)}>
      <header className="flex flex-col md:flex-row items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left mb-2 md:mb-0">{title}</h2>
        <div className="flex flex-row justify-between items-center w-full md:w-auto gap-2 sm:gap-4">
          <SortBySelect currentSort={currentSort} onSortChange={onSortChange} />
          <SearchInput onSearch={onSearch} placeholder={`Search in ${title.toLowerCase()}...`} />
        </div>
      </header>

      {hasItems ? ( // LOGIC QUAN TRỌNG: CHỈ ÁP DỤNG CUỘN KHI CÓ ITEMS
        <div
          ref={scrollRef}
          className={cn(
            "grid grid-cols-1 justify-items-center gap-3 sm:gap-5 max-h-[60vh] overflow-y-auto",
            "md:flex md:flex-row md:overflow-x-auto md:max-h-none md:overflow-y-visible md:justify-start",
            "sm:pb-2 -mx-2 sm:-mx-4 px-2 sm:px-4",
            "lg:space-x-8",
            "no-scrollbar cursor-grab active:cursor-grabbing",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
        >
          {items}
        </div>
      ) : ( // HIỂN THỊ NOITEMS FOUND KHI KHÔNG CÓ ITEMS
        <div className="flex justify-center items-center w-full min-h-[250px]">
          {items} {/* Đây sẽ là NoItemsFound component */}
        </div>
      )}
    </section>
  );
};