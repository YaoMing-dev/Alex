'use client';

import React, { useState, useEffect } from 'react';
import { ThemeDetails } from '@/components/vocabulary/ThemeDetails';
import { notFound } from 'next/navigation';
import { DynamicMeshGradient } from '@/components/common/DynamicMeshGradient';
import { fetchThemeDetails } from '@/lib/api/vocab';
import { ThemeDetailsResponse, ThemeLessonDetails, LessonStatus } from '@/lib/types/vocab';
import { useRouter } from 'next/navigation';

// Tối ưu hóa mapLessonDetailsStatus để hiển thị tất cả trạng thái
const mapLessonDetailsStatus = (details: ThemeLessonDetails): LessonStatus => {
    // 1. Trạng thái bị khóa luôn là ưu tiên
    if (details.isLocked) return 'upcoming';

    // 2. Nếu Study đã Completed (tức là 100% từ vựng)
    if (details.progressStatus === 'completed') {
        // Nếu Quiz đã hoàn thành và Passed, coi là hoàn thành cuối cùng
        if (details.isQuizCompleted) return 'completed';
        // Nếu Quiz chưa hoàn thành (hoặc Fail), coi là sẵn sàng làm Quiz
        return 'ready-to-do-quiz';
    }

    // 3. Nếu Study đang In Progress
    if (details.progressStatus === 'in_progress') return 'in-progress';

    // 4. Mặc định: Ready to learn (progressStatus === 'not_started' và không bị khóa)
    return 'ready-to-learn';
};

export default function ThemeClient({ themeId }: { themeId: string }) {
    const router = useRouter();
    const [themeData, setThemeData] = useState<ThemeDetailsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const themeIdInt = parseInt(themeId);
    if (isNaN(themeIdInt)) {
        notFound();
    }

    // --- LOGIC FETCH DATA (API 2) ---
    useEffect(() => {
        const loadThemeDetails = async () => {
            try {
                setLoading(true);
                const data = await fetchThemeDetails(themeIdInt);
                setThemeData(data);
                setError(null);
            } catch (err: any) {
                console.error("Failed to fetch theme details:", err);
                setError("Không thể tải chi tiết chủ đề. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };
        loadThemeDetails();
    }, [themeIdInt]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><p>Đang tải chi tiết chủ đề...</p></div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    if (!themeData) return notFound();

    // Chuẩn bị dữ liệu cho ThemeDetails component
    const mappedLessons = themeData.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.name,
        imageSrc: lesson.imageUrl || '/images/default-lesson.jpg',
        progressValue: lesson.progressPercent,
        status: mapLessonDetailsStatus(lesson), // Map status chi tiết
        isLocked: lesson.isLocked, // TRƯỜNG ISLOCKED QUAN TRỌNG
    }));

    // Trạng thái Theme tổng thể
    const isCompletedTheme = mappedLessons.every(l => l.status === 'completed');
    const isStartedTheme = mappedLessons.some(l => l.status !== 'ready-to-learn' && l.status !== 'upcoming');

    const currentProgressText = isCompletedTheme
        ? "Hoàn thành 100%"
        : isStartedTheme
            ? "Đang học"
            : "Chưa bắt đầu";
    const totalLessons = mappedLessons.length;

    // Backend cung cấp thêm imageSrc cho Theme
    const themeImageSrc = themeData.themeImageUrl || '/images/common/default-theme.jpg';
    const themeType: 'regular' | 'special' | 'completed' = isCompletedTheme
        ? 'completed'
        : (totalLessons > 1 ? 'regular' : 'special');

    return (
        <div>
            <DynamicMeshGradient />
            <ThemeDetails
                id={themeIdInt}
                name={themeData.themeName}
                description={`Chủ đề ${themeData.themeName} level ${themeData.themeLevel}. Bao gồm ${totalLessons} bài học.`}
                imageSrc={themeImageSrc}
                type={themeType}
                currentProgress={currentProgressText}
                lessons={mappedLessons as any}
                isStarted={isStartedTheme}
                totalLessons={totalLessons}
                onBack={() => router.push('/vocabulary')}
            />
        </div>
    );
}