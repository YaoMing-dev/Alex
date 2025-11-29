// eduaion/backend/src/controllers/WritingController.ts

import { Request, Response, NextFunction, RequestHandler } from 'express';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { WritingType, Level } from '@prisma/client';
import prisma from '../utils/prisma';
import {
    getWritingTopicsService,
    getWritingTopicByIdService,
    submitWritingService,
    getWritingHistoryService,
} from '../services/WritingService';

// Controller lấy danh sách đề tài Writing
export const getWritingTopicsController = async (req: Request, res: Response, next: NextFunction) => {
    const { type, level, limit, offset, sort, searchQuery } = req.query;
    const userId = req.user?.userId; // <--- LẤY userId TỪ JWT (Middleware protect có thể không chạy, nên phải kiểm tra)

    // Kiểm tra và chuyển đổi tham số Phân trang
    const parsedLimit = parseInt(limit as string, 10) || 20; // Default 20
    const parsedOffset = parseInt(offset as string, 10) || 0;

    // Kiểm tra tính hợp lệ của Sort (Mặc định là 'recent')
    const validSort = sort === 'popular' ? 'popular' : 'recent'; // Chỉ chấp nhận 'popular' hoặc 'recent'

    // Kiểm tra tính hợp lệ của type và level (giữ nguyên logic)
    const validTypes = Object.values(WritingType);
    const validType = type && validTypes.includes(type as WritingType) ? type as WritingType : undefined;

    const validLevels = Object.values(Level);
    const validLevel = level && validLevels.includes(level as Level) ? level as Level : undefined;

    // Convert userId string sang number (nếu tồn tại)
    const numericUserId = userId ? parseInt(userId) : undefined;

    // Convert searchQuery (nếu tồn tại)
    const validSearchQuery = (searchQuery as string)?.trim() || undefined;

    // Gọi Service với các tham số mới
    const result = await getWritingTopicsService(
        validType,
        validLevel,
        numericUserId,
        parsedLimit,
        parsedOffset,
        validSort,
        validSearchQuery
    );

    // Trả về object chứa topics và metadata
    return res.status(200).json(result);
};

// Controller lấy chi tiết một đề tài Writing theo ID
export const getWritingTopicByIdController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const topicId = parseInt(req.params.topicId, 10);

    if (isNaN(topicId)) {
        return next(new AppError('Topic ID không hợp lệ.', 400));
    }

    // Lấy chi tiết topic
    const topic = await getWritingTopicByIdService(topicId);

    // Kiểm tra xem topic có tồn tại hay không (đã được handle trong service, nhưng cẩn thận)
    if (!topic) {
        return next(new AppError('Không tìm thấy đề tài.', 404));
    }

    // Trả về một object duy nhất (khác với /topics trả về mảng)
    return res.status(200).json(topic);
});

export const submitWritingController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { topicId, content } = req.body;

    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    const numericTopicId = parseInt(topicId);
    if (isNaN(numericTopicId) || !content || content.length < 50) {
        return next(new AppError('Invalid input. Ensure topicId is valid and content is at least 50 characters long.', 400));
    }

    const numericUserId = parseInt(userId);
    const submission = await submitWritingService(numericUserId, numericTopicId, content);

    return res.status(202).json({
        message: 'Writing submitted successfully and is being processed by AI.',
        submission: submission
    });
};

export const getWritingHistoryController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
        return next(new AppError('Authentication required.', 401));
    }

    const numericUserId = parseInt(userId);
    const history = await getWritingHistoryService(numericUserId);

    return res.status(200).json(history);
};

export const getSubmissionStatusController: RequestHandler = async (req, res, next) => {
    // 1. Lấy và kiểm tra ID từ URL
    const submissionId = parseInt(req.params.submissionId, 10);
    if (isNaN(submissionId)) {
        return next(new AppError('Submission ID không hợp lệ.', 400));
    }

    // 2. Tìm kiếm submission trong DB bằng Prisma Client
    try {
        const submission = await prisma.writingSubmissions.findUnique({
            where: { id: submissionId },
            select: {
                status: true,
                overall_feedback_json: true, // Cần những trường này để Frontend map kết quả
                grammar_feedback_json: true,
                band_score: true,
                // Thêm các trường khác nếu cần (ví dụ: created_at, user_id)
            }
        });

        if (!submission) {
            // Log lỗi nếu không tìm thấy để dễ debug
            console.error(`Submission ID ${submissionId} not found.`);
            return next(new AppError('Không tìm thấy Submission.', 404));
        }

        // 3. Trả về kết quả Polling
        if (submission.status === 'COMPLETED') {
            // Trả về 200 OK và toàn bộ dữ liệu để Frontend map và dừng Polling
            // res.status(200).json(submission);

            // ⚠️ SỬA MẠNH TAY: CHUYỂN OBJECT/NULL VỀ CHUỖI JSON ĐỂ FRONTEND LUÔN NHẬN CHUỖI.
            const overallJson = submission.overall_feedback_json ? JSON.stringify(submission.overall_feedback_json) : null;
            const grammarJson = submission.grammar_feedback_json ? JSON.stringify(submission.grammar_feedback_json) : null;

            res.status(200).json({
                ...submission,
                overall_feedback_json: overallJson,
                grammar_feedback_json: grammarJson,
            });
        } else if (submission.status === 'ERROR') {
            // Trả về 200 OK nhưng kèm status ERROR
            res.status(200).json({ status: 'ERROR' });
        } else {
            // Trả về 202 Accepted và trạng thái hiện tại (PROCESSING, PENDING,...)
            res.status(202).json({ status: submission.status });
        }
    } catch (error) {
        console.error("Lỗi truy vấn DB Polling:", error);
        return next(new AppError('Lỗi Server khi truy vấn trạng thái Submission.', 500));
    }
};