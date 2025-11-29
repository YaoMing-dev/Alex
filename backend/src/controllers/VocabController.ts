// eduaion/backend/src/controllers/VocabController.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { Status, Level } from '@prisma/client';
import {
    getThemesService,
    getLessonsByThemeService,
    getLessonDetailsService,
    updateVocabProgressService,
    completeLessonService,
    saveStudyProgressService
} from '../services/VocabService';

// Bọc toàn bộ Controller bằng catchAsync

export const getThemesController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Thêm logic trích xuất userLevel và userId
    const userId = req.user?.userId;
    const userLevel = req.user?.level;

    if (!userId || !userLevel) {
        // Kiểm tra đầy đủ: nếu thiếu userId (401) HOẶC thiếu userLevel (400 - Bad Request/Missing data)
        const errorMsg = !userId
            ? 'Authentication required.'
            : 'User level information missing. Please complete profile setup.';

        const statusCode = !userId ? 401 : 400;

        return next(new AppError(errorMsg, statusCode));
    }

    // Truyền userId và userLevel vào Service
    const numericUserId = parseInt(userId);
    const themesData = await getThemesService(numericUserId, userLevel);

    // Trả về dữ liệu đã được phân nhóm
    return res.status(200).json(themesData);
});

export const getLessonsByThemeController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const themeId = parseInt(req.params.themeId);
    const userId = req.user?.userId; // Lấy userId từ protect middleware

    if (isNaN(themeId)) {
        return next(new AppError('Invalid Theme ID format.', 400));
    }
    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    // Truyền userId vào Service để tính toán logic mở khóa
    const numericUserId = parseInt(userId);
    const lessons = await getLessonsByThemeService(themeId, numericUserId);
    return res.status(200).json(lessons);
});

export const getLessonDetailsController = async (req: Request, res: Response, next: NextFunction) => {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user?.userId;

    if (isNaN(lessonId)) {
        return next(new AppError('Invalid Lesson ID format.', 400));
    }
    if (!userId) {
        return next(new AppError('Authentication required for lesson details.', 401));
    }

    const numericUserId = parseInt(userId);
    const details = await getLessonDetailsService(lessonId, numericUserId);

    return res.status(200).json(details);
};

export const updateVocabProgressController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { vocabId, newStatus } = req.body;

    if (!userId) return next(new AppError('User not authenticated.', 401));
    if (!vocabId || !newStatus || !Object.values(Status).includes(newStatus as Status)) {
        return next(new AppError('Invalid vocabId or status.', 400));
    }

    try {
        const progress = await updateVocabProgressService(
            parseInt(userId),
            parseInt(vocabId),
            newStatus as Status
        );

        res.status(200).json({
            status: 'success',
            message: 'Vocab progress updated.',
            data: progress,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Lưu vị trí học dở của Lesson.
 * POST /api/vocab/lessons/:lessonId/progress/save
 */
export const saveStudyProgressController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { lessonId } = req.params;
    const { lastVocabId } = req.body; // ID của từ vựng cuối cùng đã xem

    if (!userId) return next(new AppError('User not authenticated.', 401));
    if (!lastVocabId) return next(new AppError('Missing lastVocabId.', 400));

    try {
        const progress = await saveStudyProgressService(
            parseInt(userId),
            parseInt(lessonId),
            parseInt(lastVocabId)
        );

        res.status(200).json({
            status: 'success',
            message: 'Lesson progress (last learned position) saved.',
            data: progress,
        });
    } catch (error) {
        next(error);
    }
};

export const checkAndCompleteLessonController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    // Lấy lessonId từ URL params thay vì body
    const lessonId = parseInt(req.params.lessonId);
    // Không cần req.body

    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    if (isNaN(lessonId)) {
        return next(new AppError('Invalid Lesson ID format.', 400));
    }

    const numericUserId = parseInt(userId);
    // Đổi tên hàm service cho đúng với logic hoàn thành (API 4)
    const result = await completeLessonService(numericUserId, lessonId);

    // Logic kiểm tra và hoàn thành này sẽ được xử lý hoàn toàn trong service
    // Service sẽ THROW Error nếu có vấn đề (ví dụ: Lesson không tồn tại)

    return res.status(200).json({
        message: result.message,
        isCompleted: true
    });
});
/**
 * Search vocab by word
 * GET /api/vocab/search?q=query
 */
export const searchVocabController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return next(new AppError('Search query is required', 400));
    }

    const prisma = (await import('../utils/prisma')).default;

    const vocabs = await prisma.vocab.findMany({
        where: {
            word: {
                contains: q,
                mode: 'insensitive',
            },
        },
        take: 10,
        include: {
            theme: true,
            lesson: true,
        },
    });

    res.status(200).json({
        success: true,
        data: vocabs,
    });
});
