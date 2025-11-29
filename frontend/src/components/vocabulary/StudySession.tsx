// frontend/src/components/vocabulary/StudySession.tsx
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StudySessionData } from '@/lib/types/study';
import { useRouter, useSearchParams } from 'next/navigation';
import { SoftWaveGradient } from '@/components/common/SoftWaveGradient';
import { VocabDisplay } from './VocabDisplay';
import { updateVocabProgress, saveStudyProgress } from '@/lib/api/vocab';
import { Status } from '@/lib/types/vocab';
// import { QuizMode } from './QuizMode'; // Tạm thời loại bỏ do chưa tích hợp Quiz
import { CompleteSession } from './CompleteSession';

interface StudySessionProps {
  data: StudySessionData & { startingIndex?: number };
  onEndSession: () => void; // Callback để báo StudyClient biết đã học xong
}

export const StudySession: React.FC<StudySessionProps> = ({ data, onEndSession }) => {
  const searchParams = useSearchParams();
  // Hiện tại chỉ tập trung vào mode 'lesson' (vocab)
  const mode = searchParams.get('mode') || 'vocab';
  const [currentIndex, setCurrentIndex] = useState(data.startingIndex || 0);
  const totalItems = data.vocabList.length; // Chỉ tính Vocab List
  const router = useRouter();

  const currentProgressValue = Math.min(currentIndex + 1, totalItems);

  // Cập nhật Vocab Progress (API 3 mới) và Lesson Progress (API mới)
  const updateProgress = useCallback(async (vocabId: number) => {
    try {
      // 1. Cập nhật trạng thái Vocab thành 'learned' (API 3 mới)
      await updateVocabProgress(vocabId, 'learned' as Status);

      // 2. Cập nhật vị trí học dở (Lesson Progress)
      await saveStudyProgress(data.lessonId, vocabId);
    } catch (error) {
      console.error("Failed to update vocab/lesson progress:", error);
      // Có thể thêm toast cảnh báo nhẹ ở đây nếu muốn
    }
  }, [data.lessonId]);

  const handleNext = () => {
    const currentVocab = data.vocabList[currentIndex];
    // Cập nhật trạng thái 'learned' cho từ hiện tại TRƯỚC KHI chuyển sang từ tiếp theo
    if (currentVocab) {
      updateProgress(currentVocab.id);
    }

    // Nếu là item cuối cùng, gọi onEndSession để chuyển trạng thái
    if (currentIndex === totalItems - 1) {
      onEndSession();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  // Hàm này được gọi khi người dùng muốn thoát giữa chừng (Exit button trên StudyHeader)
  const handleExit = async () => {
    // Lấy Vocab ID cuối cùng đã xem/đang xem
    const currentVocab = data.vocabList[currentIndex];

    if (currentVocab) {
      // Lưu vị trí đang học dở (API mới)
      await saveStudyProgress(data.lessonId, currentVocab.id);
    }

    // Chuyển hướng về trang chi tiết Theme (để Lesson hiển thị 'In progress')
    if (data.themeId) {
      router.push(`/vocabulary/themes/${data.themeId}`);
    }
  }

  const renderContent = useMemo(() => {
    console.log('StudySession mode:', mode); // Debug
    console.log('StudySession data:', { quizQuestions: data.quizQuestions, vocabList: data.vocabList }); // Debug

    // TẠM THỜI BỎ QUA LOGIC QUIZ MODE ĐỂ TẬP TRUNG VÀO STUDY MODE
    if (mode === 'quiz') {
      return <div className="text-edu-dark">Chế độ Quiz chưa được tích hợp.</div>;
    }

    // if (mode === 'quiz' && data.quizQuestions && data.quizQuestions.length > 0) {
    //   const question = data.quizQuestions[currentIndex];
    //   return (
    //     <QuizMode
    //       question={question}
    //       vocabItem={data.vocabList.find(v => v.id === question.vocab_id)}
    //       index={currentIndex}
    //       total={totalItems}
    //       onNext={handleNext}
    //       lessonName={data.lessonName}
    //       onExit={onEndSession}
    //       currentProgressValue={currentProgressValue}
    //     />
    //   );
    // }

    if (data.vocabList.length > 0) {
      const vocab = data.vocabList[currentIndex];
      return (
        <VocabDisplay
          vocab={vocab}
          index={currentIndex}
          total={totalItems}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirstItem={currentIndex === 0}
          lessonName={data.lessonName}
          onExit={handleExit}
          currentProgressValue={currentProgressValue}
        />
      );
    }

    // Nếu không có dữ liệu để học hoặc đã hoàn thành (isEnd=true, nhưng đã được xử lý ở StudyClient)
    return <div className="text-edu-dark">Không có dữ liệu để hiển thị</div>;
  }, [currentIndex, totalItems, data, handleNext, handleExit]);

  return (
    <div className="relative min-h-screen bg-background">
      <SoftWaveGradient />
      <div className="container mx-auto max-w-4xl py-4 sm:py-6 md:py-10 relative z-10">
        <div className="bg-card rounded-2xl shadow-xl p-4 sm:p-6 md:p-12 mb-6 sm:mb-8 md:mb-10 min-h-[70vh] sm:min-h-[75vh] flex flex-col justify-center items-center">
          <div className="w-full flex justify-center flex-grow items-center">
            {renderContent}
          </div>
        </div>
      </div>
    </div>
  );
};