// eduaion/backend/src/controllers/StatsController.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import {
    getUserStatsSummaryService,
    getUserActivityLogService,
    getDailyProgressService
} from '../services/StatsService';
import { StatsUpdaterService } from '../services/StatsUpdaterService';


// 1. Lấy dữ liệu tổng hợp (Stat Cards, Goal Data)
export const getUserSummaryStatsController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    const numericUserId = parseInt(userId);

    // Gọi service mới để lấy Summary và Goal
    const summaryData = await getUserStatsSummaryService(numericUserId);

    res.status(200).json({
        status: 'success',
        data: summaryData,
    });
});

// 2. Lấy Activity Feed
export const getRecentActivityController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    // Lấy query param 'limit', default là 10
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const numericUserId = parseInt(userId);

    const activityLog = await getUserActivityLogService(numericUserId, limit);

    res.status(200).json({
        status: 'success',
        data: activityLog,
    });
});

// 3. Lấy dữ liệu cho Biểu đồ
export const getProgressChartController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    // Lấy query params: type (writing/vocab) và period (7d/4w)
    const { type, period } = req.query;

    if (!type || !period) {
        return next(new AppError('Missing required query parameters: type and period.', 400));
    }

    const numericUserId = parseInt(userId);

    const chartData = await getDailyProgressService(numericUserId, type as string, period as string);

    res.status(200).json({
        status: 'success',
        data: chartData,
    });
});

// 4. Controller cho Web Hook từ AI Service
/**
 * Nhận request từ AI Service (Non-user request) để cập nhật thống kê.
 * KHÔNG CẦN AUTHENTICATION (Bảo mật qua tường lửa/shared secret nếu cần)
 */
export const updateStatsFromExternalServiceController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validate Payload từ AI Service
    const { userId, submissionId, bandScore, topicType } = req.body;

    if (!userId || !submissionId || bandScore === undefined || bandScore === null) {
        // Trả về 400 nếu thiếu dữ liệu quan trọng
        return next(new AppError('Missing required data: userId, submissionId, or bandScore.', 400));
    }

    // 2. Chuyển đổi sang dạng số (Nếu TypeScript không tự nhận)
    const numericUserId = parseInt(userId);
    const numericSubmissionId = parseInt(submissionId);
    const numericBandScore = parseFloat(bandScore);

    // 3. Kích hoạt logic cập nhật thống kê
    // Hàm này chạy bất đồng bộ nhưng ta phải await để đảm bảo logic hoàn tất
    await StatsUpdaterService.updateStatsAfterWritingCompleted(
        numericSubmissionId,
        numericBandScore,
        numericUserId
    );

    // 4. Trả về 200 OK cho AI Service (Không cần đợi quá lâu)
    res.status(200).json({
        status: 'success',
        message: `Stats updated successfully for submission ${submissionId}.`,
    });
});