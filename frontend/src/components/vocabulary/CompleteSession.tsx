// frontend/src/components/vocabulary/CompleteSession.tsx

import React from 'react';
import { Check, Award, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompleteSessionProps {
  totalItems: number;
  lessonName: string;
  lessonId: number;
  themeId: number;
  onCompleteAndRedirect: (themeId: number) => void;
  onTakeQuiz: (lessonId: number) => void; // Thêm callback cho quiz
}

export const CompleteSession: React.FC<CompleteSessionProps> = ({
  totalItems,
  lessonName,
  lessonId,
  themeId,
  onCompleteAndRedirect,
  onTakeQuiz,
}) => {
  return (
    <div className="text-center p-6 sm:p-10 bg-card rounded-xl sm:rounded-2xl w-full max-w-lg border-2 border-edu-light shadow-md">
      <div className="relative bg-primary text-primary-foreground p-6 rounded-xl flex flex-col items-center mb-8 sm:mb-10 shadow-md">
        <div className="absolute -top-6 bg-edu-highlight rounded-full p-2">
          <Check className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold mt-6 mb-2">Hoàn thành bài học!</h2>
        <p className="text-sm sm:text-md font-medium">
          Bạn đã học xong <strong>{totalItems}</strong> từ vựng quan trọng.
        </p>
      </div>

      <p className="text-lg sm:text-xl text-edu-dark mb-6 sm:mb-8">
        Bạn có muốn làm quiz để kiểm tra kiến thức?
      </p>

      <div className="space-y-3">
        {/* Nút Làm Quiz - Primary */}
        <Button
          onClick={() => onTakeQuiz(lessonId)}
          className="w-full h-12 text-md sm:text-lg font-semibold bg-[#4CAF50] hover:bg-[#45A049] text-white rounded-2xl sm:rounded-xl px-6 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Award className="h-5 w-5" />
          Làm Quiz Ngay
        </Button>

        {/* Nút Bỏ qua - Secondary */}
        <Button
          onClick={() => onCompleteAndRedirect(themeId)}
          variant="outline"
          className="w-full h-12 text-md sm:text-lg font-semibold rounded-2xl sm:rounded-xl px-6 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <SkipForward className="h-5 w-5" />
          Bỏ qua, về trang chủ đề
        </Button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Quiz giúp bạn ghi nhớ từ vựng lâu hơn!
      </p>
    </div>
  );
};