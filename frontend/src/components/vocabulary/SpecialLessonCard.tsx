// frontend/src/components/vocabulary/SpecialLessonCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { LessonSummary } from '@/lib/types/vocab';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SpecialLessonCard: React.FC<{ lesson: LessonSummary, onClick: () => void }> = ({ lesson, onClick }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const isCompleted = lesson.progressStatus === 'completed';
  const isInProgress = lesson.progressStatus === 'in_progress';
  const isUpcoming = lesson.progressStatus === 'not_started';
  const progressValue = lesson.progressPercent;

  const progressClasses = isCompleted
    ? "h-2 [&>div]:bg-green-500 bg-green-200"
    : "h-2 [&>div]:bg-blue-600 bg-blue-200";

  // // Logic hiển thị trạng thái text phải được cập nhật
  // let statusDisplayText = "Chưa bắt đầu";
  // if (isCompleted) {
  //   statusDisplayText = "Hoàn thành!";
  // } else if (isInProgress) {
  //   if (progressValue >= 100) {
  //     statusDisplayText = "Sẵn sàng kết thúc bài học!";
  //   } else {
  //     statusDisplayText = `${Math.floor(progressValue)}% Hoàn thành`;
  //   }
  // }

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height: '370px', width: '380px' }} />;

  return (
    <div
      className={cn(
        "w-full max-w-[380px] sm:max-w-[750px] h-[370px] flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden cursor-pointer transition-all duration-300",
        "flex flex-col sm:flex-row",
        "hover:shadow-xl tap:scale-105 z-20 my-4 sm:my-8",
        "hover:translate-y-2 hover:border-blue-200"
      )}
      onClick={onClick}
    >
      <div className="relative w-full h-1/2 sm:w-1/2 sm:h-full">
        <Image
          // Cập nhật: sử dụng lesson.imageUrl
          src={lesson.imageUrl || '/images/default-special.jpg'}
          alt={lesson.name}
          fill className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 400px"
        />
      </div>
      <div className="flex flex-col justify-between p-2 sm:p-6 w-full sm:w-1/2 h-1/2 sm:h-full">
        <div>
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <h3 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{lesson.name}</h3>
            <div className="bg-yellow-500 text-white text-sm sm:text-lg font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              Lesson {lesson.order}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">{lesson.vocabCount} từ vựng mới</p>
        </div>
        <div>
          <div className="mb-1 sm:mb-3">
            <Progress value={progressValue} className={progressClasses} />
            <p className={cn("text-xs sm:text-sm mt-1 sm:mt-2 font-medium", isCompleted ? "text-green-600" : "text-blue-600")}>
              {`${Math.floor(progressValue)}% Hoàn thành`}
            </p>
          </div>
          <div className="flex justify-end">
            <span
              className="flex items-center text-xs sm:text-sm font-semibold text-edu-primary hover:text-edu-primary/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {progressValue <= 0 ? "Bắt đầu" : (progressValue >= 100 ? "Ôn tập" : "Tiếp tục")}
              <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 ml-0.5 sm:ml-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};