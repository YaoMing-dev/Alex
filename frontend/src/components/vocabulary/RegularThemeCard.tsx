//frontend/src/components/vocabulary/RegularThemeCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LessonCard } from './LessonCard';
import { RegularThemeSummary, LessonStatus } from '@/lib/types/vocab';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const CARD_HEIGHT_BASE = 320;
const COVER_IMAGE_HEIGHT = 260;
const LESSON_CARD_HEIGHT = 70;
const LESSON_GAP = 8;
const DROPDOWN_VERTICAL_PADDING = 28;

// Tính toán để bao đủ 4 lesson card + shadow
const calculateDropdownHeight = (count: number) =>
  count > 0
    ? (count * LESSON_CARD_HEIGHT) +
    ((count - 1) * LESSON_GAP) +
    (2 * DROPDOWN_VERTICAL_PADDING) +
    16 // offset thêm cho shadow và border
    : 0;

export const RegularThemeCard: React.FC<{ theme: RegularThemeSummary, onClick: () => void }> = ({ theme, onClick }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isActive = isMobile ? isTapped : isHovered;
  const isStarted = theme.progressStatus !== 'not_started';

  // Xác định khi nào component đã mount
  useEffect(() => {
    setIsMounted(true); // Đảm bảo chỉ mount sau khi client sẵn sàng
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hiển thị Lesson: Nếu đã bắt đầu, hiển thị tối đa 4 Lessons. Nếu chưa, hiển thị Lesson đầu tiên.
  const lessonsToShow = theme.lessons
    .sort((a, b) => a.order - b.order) // Sắp xếp theo Order
    .filter((_, index) => isStarted || index === 0) // Lọc Lessons theo trạng thái
    .slice(0, 4);

  // *** THÊM LOGIC XỬ LÝ CLICK VÀO LESSON CARD ***
  const handleLessonCardClick = (lessonId: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation(); // Rất quan trọng: Ngăn event bubble up lên ThemeCard
    router.push(`/vocabulary/study/${lessonId}`);
  };

  const dropdownHeight = calculateDropdownHeight(lessonsToShow.length);
  const finalHeight = isActive ? CARD_HEIGHT_BASE + dropdownHeight : CARD_HEIGHT_BASE;

  const lessonsContainerClasses = cn(
    "absolute left-0 right-0 px-2 pt-4 sm:p-3 sm:pt-6 transition-all duration-300 ease-in-out overflow-hidden",
    { 'opacity-0': !isActive, 'opacity-100': isActive }
  );

  if (!isMounted) return <div style={{ height: `${finalHeight}px`, width: '300px' }} />;

  return (
    <div
      className={cn(
        "relative flex-shrink-0 cursor-pointer transition-all duration-300 ease-in-out",
        "w-[80vw] max-w-[300px] sm:max-w-[300px]",
        "hover:translate-y-2 hover:border-blue-200"
      )}
      style={{
        height: `${finalHeight}px`,
        transition: 'height 0.3s ease-in-out',
        zIndex: isActive ? 30 : 10,
      }}
      onClick={onClick}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onTouchStart={(e) => {
        if (isMobile) {
          setIsTapped(true);
          e.stopPropagation();
        }
      }}
      onTouchEnd={(e) => {
        if (isMobile) {
          setIsTapped(false);
        }
      }}
    >
      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-between bg-white rounded-lg border overflow-hidden z-20 transition-all duration-300",
          isActive
            ? "border-gray-400 shadow-xl scale-105"
            : "border-gray-300 shadow-sm"
        )}
        style={{ height: `${CARD_HEIGHT_BASE}px` }}
      >
        <div
          className="relative w-full h-full rounded-t-lg overflow-hidden"
          style={{ height: `${COVER_IMAGE_HEIGHT}px` }}
        >
          <Image
            src={theme.imageUrl || '/images/common/default-theme.jpg'}
            alt={theme.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
        <div className="flex flex-col p-2 sm:p-4 pt-2 sm:pt-3 z-30 bg-white">
          <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">
            {theme.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Status: {theme.progressStatus}
          </p>
        </div>
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 h-8 sm:h-10 bg-gray-100 backdrop-blur-[1px] flex items-center justify-between px-2 sm:px-3 rounded-b-lg transition-opacity duration-200",
            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <span className="text-xs sm:text-sm font-medium text-edu-primary">
            {isStarted ? "Tiếp tục học" : "Bắt đầu khóa học"}
          </span>
          <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-edu-primary" />
        </div>
      </div>

      <div
        className={lessonsContainerClasses}
        style={{
          height: isActive ? `${dropdownHeight}px` : '0px',
          top: `${CARD_HEIGHT_BASE}px`,
          zIndex: 40,
        }}
      >
        <div className="flex flex-col gap-2 sm:gap-3">
          {lessonsToShow.map((lesson) => {
            return (
              <LessonCard
                key={lesson.id}
                title={lesson.name}
                status={lesson.lessonDisplayStatus as LessonStatus} // Sử dụng trạng thái chi tiết
                progressValue={lesson.progressPercent}
                // isLocked được xác định bên trong LessonCard dựa trên status
                isLocked={lesson.lessonDisplayStatus === 'upcoming' || lesson.lessonDisplayStatus === 'upcoming-quiz'}
                imageSrc={lesson.imageUrl || '/images/default-lesson.jpg'}
                id={lesson.id}
                onClick={(id, e) => handleLessonCardClick(id, e)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
