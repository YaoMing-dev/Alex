// frontend/src/components/vocabulary/CompletedThemeCard.tsx
"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CompletedItem } from '@/lib/types/vocab';
import { RefreshCw, CheckCircle, BookOpen, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface CompletedThemeCardProps {
  item: CompletedItem;
  onClick: () => void;
}

export const CompletedThemeCard: React.FC<CompletedThemeCardProps> = ({ item, onClick }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  // Kiểm tra loại item
  const isRegularTheme = item.type === 'regular-theme';
  const isSpecialLesson = item.type === 'special-lesson';
  const name = item.name;
  const imageUrl = item.imageUrl || '/images/default-completed.jpg';
  const progressPercent = item.progressPercent;
  // Đối với Regular Theme, chúng ta sẽ cần logic tìm Quiz ID sau này

  useEffect(() => {
    setIsMounted(true); // Đảm bảo chỉ mount sau khi client sẵn sàng
  }, []);

  // Xử lý hành động học lại/ôn tập/làm lại Quiz
  const handleRedoClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn điều hướng từ thẻ cha (onClick của div ngoài)

    if (isRegularTheme) {
      // Regular Theme: Điều hướng đến Theme Detail để người dùng chọn Lesson/Quiz
      console.log(`Tiếp tục ôn tập Regular Theme: ${name}`);
      router.push(`/vocabulary/themes/${item.id}`);
    } else {
      // Special Lesson: Điều hướng thẳng đến Study Session (Lesson ID chính là item.id)
      console.log(`Bắt đầu học lại Special Lesson: ${name}`);
      router.push(`/vocabulary/study/${item.id}`);
    }
  }

  if (!isMounted) return <div style={{ height: '350px', width: '280px' }} />;

  // Tùy chỉnh Text và Icon cho nút hành động
  const actionButtonText = isRegularTheme ? "Xem lại & Ôn tập" : "Học lại";
  const actionButtonIcon = isRegularTheme ? BookOpen : RefreshCw;

  // Tùy chỉnh mô tả trạng thái hoàn thành
  const statusDescription = isRegularTheme
    ? "Đã Hoàn thành Study & Theme"
    : "Đã Hoàn thành Study Session";

  // Tùy chỉnh icon hiển thị loại nội dung
  const typeIcon = isRegularTheme ? BookOpen : Star;
  const typeText = isRegularTheme ? "Chủ đề Thường" : "Bài học Đặc biệt";

  return (
    <div
      className="relative w-full max-w-[280px] sm:max-w-[280px] h-[350px] flex-shrink-0 bg-white rounded-xl border border-gray-300 shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl tap:scale-105 z-20 mb-4 sm:mb-10 hover:translate-y-2 hover:border-blue-200"
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="relative w-full h-[260px] rounded-t-lg overflow-hidden">
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
        </div>
        <div className="p-2 sm:p-4 pt-2 sm:pt-3 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate" title={name}>{name}</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{isRegularTheme ? "Chủ đề" : "Bài học Đặc biệt"}</p>
          </div>

          <div>
            <div className="flex items-center mt-2 sm:mt-3">
              <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 mr-1 sm:mr-2" />
              <p className="text-xs sm:text-sm font-medium text-green-700">
                {statusDescription}
              </p>
            </div>
            <Progress value={progressPercent} className="h-1.5 sm:h-2 bg-green-200 [&>div]:bg-green-600 mt-1 sm:mt-2" />
          </div>

          <div className="flex justify-end mt-1 sm:mt-2">
            <div className="flex justify-end mt-2 sm:mt-3">
              <button
                onClick={handleRedoClick}
                className="flex items-center text-xs sm:text-sm font-semibold text-edu-primary hover:text-edu-primary/80 transition-colors"
              >
                {React.createElement(actionButtonIcon, { className: "h-3 sm:h-4 w-3 sm:w-4 mr-0.5 sm:mr-1" })}
                {actionButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};