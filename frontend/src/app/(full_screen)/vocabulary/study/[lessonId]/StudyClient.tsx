// frontend/src/app/(full_screen)/vocabulary/study/[lessonId]/StudyClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StudySession } from '@/components/vocabulary/StudySession';
import { notFound } from 'next/navigation';
import { CompleteSession } from '@/components/vocabulary/CompleteSession';
import { fetchLessonDetails, completeLesson } from '@/lib/api/vocab';
import { LessonDetailsResponse, VocabDetails } from '@/lib/types/vocab';
import { StudySessionData } from '@/lib/types/study';
import { useToast } from '@/components/ui/use-toast';
import axiosInstance from '@/lib/api/axiosInstance';

export default function StudyClient({ lessonId }: { lessonId: string }) {
    const router = useRouter();
    const { toast } = useToast(); // Khởi tạo toast
    const [studyData, setStudyData] = useState<StudySessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false); // Trạng thái hoàn tất học từ vựng/quiz

    const lessonIdInt = parseInt(lessonId);

    if (isNaN(lessonIdInt)) return notFound();

    // --- LOGIC FETCH DATA (API 3) ---
    useEffect(() => {
        const loadLessonDetails = async () => {
            try {
                setLoading(true);
                // Gọi API 3
                const response = await fetchLessonDetails(lessonIdInt);

                // Mặc định mode là 'lesson' nếu không có tham số nào khác
                const mode: 'lesson' | 'review' | 'quiz' = 'lesson';

                // Chuyển đổi VocabDetails sang VocabItem (cần đảm bảo type match)
                const mappedVocabList = response.vocabs.map(v => ({
                    ...v,
                    level: 'Beginner', // Cần lấy từ Backend nếu không có trong VocabDetails
                    theme_id: response.theme_id,
                    lesson_id: response.id,
                }));

                setStudyData({
                    lessonId: response.id,
                    themeId: response.theme_id,
                    lessonName: response.name,
                    mode: mode,
                    vocabList: mappedVocabList as any, // Ép kiểu tạm thời
                    startingIndex: response.startingIndex || 0,
                    // quizQuestions: undefined // Logic quiz sẽ tích hợp sau
                });

            } catch (err: any) {
                console.error("Failed to fetch lesson details:", err);
                setError("Không thể tải chi tiết bài học. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadLessonDetails();
    }, [lessonIdInt]);

    // --- LOGIC HOÀN THÀNH (API 4) ---
    const handleCompleteLesson = async (themeId: number) => {
        try {
            await completeLesson(lessonIdInt); // Gọi API 4
            toast({
                title: "🎉 Hoàn thành bài học!",
                description: "Tiến độ của bạn đã được cập nhật.",
                variant: "default",
            });
            // Chuyển hướng về trang chi tiết Theme
            router.push(`/vocabulary/themes/${themeId}`);
        } catch (error) {
            console.error("Failed to complete lesson:", error);
            toast({
                title: "Lỗi",
                description: "Không thể cập nhật tiến độ. Vui lòng thử lại.",
                variant: "destructive",
            });
            // Nếu lỗi, vẫn cho phép người dùng quay lại
            router.push(`/vocabulary/themes/${themeId}`);
        }
    };

    // Callback từ StudySession khi hoàn tất học (chuyển sang màn hình CompleteSession)
    const handleEndSession = () => {
        setIsCompleted(true);
    };

    // Xử lý khi user click "Làm Quiz"
    const handleTakeQuiz = async (lessonId: number) => {
        try {
            setLoading(true);
            // Gọi API tạo quiz cho lesson
            const response = await axiosInstance.post(`/api/quiz/lesson/${lessonId}`, {
                type: 'mixed', // hoặc 'multiple_choice' / 'fill_blank'
            });

            const { quiz, questions } = response.data.data;

            // Lưu quiz data vào sessionStorage
            sessionStorage.setItem(
                `quiz_${quiz.id}`,
                JSON.stringify({
                    questions,
                    theme_tag: studyData?.lessonName,
                })
            );

            // Gọi completeLesson API để cập nhật progress
            await completeLesson(lessonId);

            toast({
                title: "🎉 Hoàn thành bài học!",
                description: "Tiến độ đã được lưu. Bắt đầu làm quiz!",
            });

            // Redirect đến quiz page
            router.push(`/vocabulary/quiz/${quiz.id}`);
        } catch (error: any) {
            console.error('Error creating quiz:', error);
            toast({
                title: 'Lỗi',
                description: error.response?.data?.message || 'Không thể tạo quiz',
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Đang tải bài học...</p></div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    // Nếu data null hoặc không có vocab nào để học
    if (!studyData || studyData.vocabList.length === 0) return notFound();

    // Nếu đã hoàn tất session học
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <CompleteSession
                    lessonId={studyData.lessonId}
                    themeId={studyData.themeId}
                    totalItems={studyData.vocabList.length}
                    lessonName={studyData.lessonName}
                    onCompleteAndRedirect={handleCompleteLesson}
                    onTakeQuiz={handleTakeQuiz} // Thêm callback cho quiz
                />
            </div>
        );
    }

    // Màn hình học tập
    return (
        <div className="min-h-screen bg-gray-50">
            <StudySession data={studyData} onEndSession={handleEndSession} />
        </div>
    );
}