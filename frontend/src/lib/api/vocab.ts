// frontend/src/lib/api/vocab.ts
import axiosInstance from './axiosInstance';
import { VocabThemesResponse, ThemeDetailsResponse, LessonDetailsResponse, Status } from '@/lib/types/vocab';

/**
 * API 1: Lấy danh sách tổng quan Themes và Special Lessons kèm tiến độ.
 * GET /api/vocab/themes
 */
export async function fetchVocabThemes(): Promise<VocabThemesResponse> {
    const response = await axiosInstance.get('/api/vocab/themes'); // Request GET -> Bỏ qua CSRF Interceptor
    return response.data;
}

/**
 * API 2: Lấy chi tiết Theme và Lessons bên trong (bao gồm logic mở khóa).
 * GET /api/vocab/themes/:themeId/lessons
 */
export async function fetchThemeDetails(themeId: number): Promise<ThemeDetailsResponse> {
    const response = await axiosInstance.get(`/api/vocab/themes/${themeId}/lessons`);
    return response.data;
}

/**
 * API 3: Lấy chi tiết Lesson và danh sách Vocab.
 * GET /api/vocab/lessons/:lessonId/details
 */
export async function fetchLessonDetails(lessonId: number): Promise<LessonDetailsResponse> {
    const response = await axiosInstance.get(`/api/vocab/lessons/${lessonId}/details`);
    return response.data;
}

/**
 * API 4: Hoàn thành Lesson.
 * POST /api/vocab/lessons/:lessonId/complete
 */
export async function completeLesson(lessonId: number) {
    const response = await axiosInstance.post(`/api/vocab/lessons/${lessonId}/complete`);
    return response.data;
}

/**
 * API 5: Cập nhật trạng thái học tập của một từ vựng cho người dùng cụ thể.
 * POST /api/vocab/progress/update
 */
export async function updateVocabProgress(vocabId: number, newStatus: Status) {
    // newStatus sẽ là 'LEARNED' khi người dùng chuyển qua card
    const response = await axiosInstance.post(`/api/vocab/progress/update`, {
        vocabId: vocabId,
        newStatus: newStatus,
    });
    return response.data;
}

/**
 * API 6: Cập nhật vị trí học dang dở của Lesson.
 * POST /api/vocab/lessons/:lessonId/progress/save
 */
export async function saveStudyProgress(lessonId: number, lastVocabId: number) {
    const response = await axiosInstance.post(`/api/vocab/lessons/${lessonId}/progress/save`, {
        lastVocabId: lastVocabId,
    });
    return response.data;
}