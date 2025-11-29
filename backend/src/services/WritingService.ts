// eduaion/backend/src/services/WritingService.ts

import prisma from '../utils/prisma';
import { WritingType, Level, SubmissionStatus } from '@prisma/client';
import AppError from '../utils/AppError'; // Import AppError
import { StatsUpdaterService } from './StatsUpdaterService';
import axios from 'axios';

// Type Guard để kiểm tra lỗi Prisma
function isPrismaError(error: any): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

// Lấy URL của AI Service từ biến môi trường
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000/api/grade';

/**
 * Lấy danh sách các đề tài Writing (IeltsRepository) với các bộ lọc tùy chọn.
 * @param type Loại bài viết (Task1 hoặc Task2)
 * @param level Cấp độ (Beginner, Intermediate, Advanced)
 * @param userId ID người dùng để tính submissionCount
 * @param limit Giới hạn bản ghi
 * @param offset Bỏ qua N bản ghi
 * @param sort Tiêu chí sắp xếp ('recent', 'level_asc', 'level_desc')
 * @param searchQuery Chuỗi tìm kiếm
 */
export const getWritingTopicsService = async (
    type?: WritingType,
    level?: Level,
    userId?: number,
    limit: number = 20,
    offset: number = 0,
    sort: 'recent' | 'popular' = 'recent',
    searchQuery?: string
) => {
    const where: any = {};

    if (type) {
        where.type = type;
    }

    if (level) {
        where.level = level;
    }

    // Logic Search
    if (searchQuery) {
        // Áp dụng tìm kiếm trên description và prompt
        where.OR = [
            { description: { contains: searchQuery, mode: 'insensitive' as const } },
            { prompt: { contains: searchQuery, mode: 'insensitive' as const } },
        ];
    }

    // XÁC ĐỊNH ORDER BY (Hiện tại chỉ hỗ trợ 'recent')
    const orderBy: any = [];
    if (sort === 'recent') {
        orderBy.push({ created_at: 'desc' });
    }
    // Nếu có hỗ trợ popular (sắp xếp theo số lần nộp), cần một cách tính toán khác

    orderBy.push({ id: 'asc' }); // Thêm secondary sort để đảm bảo thứ tự ổn định

    // 1. Thực hiện truy vấn topics với PHÂN TRANG
    const topics = await prisma.ieltsRepository.findMany({
        where: where,
        orderBy: orderBy, // <--- DÙNG ORDERBY ĐÃ TẠO
        take: limit,
        skip: offset,
        select: {
            id: true,
            type: true,
            level: true,
            description: true,
            prompt: true,
            created_at: true,
            image_url: true,
        }
    });

    // 2. Tính toán tổng số lượng topic (cho Frontend biết tổng trang)
    const totalCount = await prisma.ieltsRepository.count({ where });

    // 3. THÊM submissionCount cho mỗi Topic (CÁCH TỐI ƯU HƠN)
    let submissionCounts: { topic_id: number, count: number }[] = [];

    // Chỉ tính count nếu userId tồn tại và có topics
    if (userId && topics.length > 0) {
        // Lấy ID của tất cả topics hiện tại
        const topicIds = topics.map(t => t.id);

        // Truy vấn số lượng submission cho TẤT CẢ topics đó cùng lúc
        // Dùng Prisma's raw query hoặc groupBy/count (groupBy nhanh hơn)
        submissionCounts = await prisma.writingSubmissions.groupBy({
            by: ['topic_id'],
            where: {
                user_id: userId,
                topic_id: { in: topicIds }
            },
            _count: {
                id: true,
            },
        }).then(results => results.map(r => ({
            topic_id: r.topic_id!, // topic_id không null do where
            count: r._count.id,
        })));
    }

    // 4. Map count vào Topics
    const topicsWithProgress = topics.map((topic) => {
        const submissionData = submissionCounts.find(sc => sc.topic_id === topic.id);
        const submissionCount = submissionData ? submissionData.count : 0;

        return {
            ...topic,
            submissionCount, // <--- FIELD MỚI CHO FRONTEND
        };
    });

    // Trả về cả dữ liệu topics và tổng số lượng
    return {
        topics: topicsWithProgress,
        totalCount: totalCount,
        limit: limit,
        offset: offset
    };
};

/**
 * Lấy chi tiết một đề tài Writing (IeltsRepository) bằng ID.
 * @param topicId ID của đề tài
 */
export const getWritingTopicByIdService = async (topicId: number) => {
    // Sử dụng findUnique để đảm bảo chỉ lấy 1 bản ghi
    const topic = await prisma.ieltsRepository.findUnique({
        where: { id: topicId },
        select: {
            id: true,
            type: true,
            level: true,
            description: true,
            prompt: true,
            created_at: true,
            image_url: true,
            sample_answer: true,
            // Thêm các trường cần thiết khác nếu có
        }
    });

    if (!topic) {
        // Rất quan trọng: Bắt lỗi 404 nếu không tìm thấy Topic
        throw new AppError(`Writing topic with ID ${topicId} not found.`, 404);
    }

    return topic;
};

/**
 * Lưu trữ bài viết mới được gửi bởi người dùng.
 * @param userId ID của người dùng (từ JWT)
 * @param topicId ID của đề tài trong IeltsRepository
 * @param content Nội dung bài viết của người dùng
 */
export const submitWritingService = async (
    userId: number,
    topicId: number,
    content: string
) => {
    // 1. Kiểm tra đề tài (topic) có tồn tại không
    const topic = await prisma.ieltsRepository.findUnique({
        where: { id: topicId },
        select: { id: true, type: true, level: true, sample_answer: true, prompt: true }
    });

    if (!topic) {
        throw new AppError('Writing topic not found.', 404);
    }

    // Lấy thông tin cần thiết cho AI Service
    const topicType = topic.type;
    // Dữ liệu Task 2 có thể không cần sample_answer, nhưng ta vẫn truyền
    const sampleAnswer = topic.sample_answer;

    try {
        // 2. Tạo bản ghi Submission mới
        const submission = await prisma.writingSubmissions.create({
            data: {
                user_id: userId,
                topic_id: topicId,
                content: content,
                band_score: null,
                // Sử dụng Enum SubmissionStatus
                status: SubmissionStatus.SUBMITTED,
            },
            select: {
                id: true,
                status: true,
                submitted_at: true, // Đã đổi tên trong schema
                content: true,
            }
        });

        // 3. Cập nhật trạng thái thành PROCESSING
        const processingSubmission = await prisma.writingSubmissions.update({
            where: { id: submission.id },
            data: { status: SubmissionStatus.PROCESSING },
            select: { id: true, status: true, submitted_at: true }
        });

        // 4. Kích hoạt tiến trình chấm điểm AI (Bất đồng bộ - Không dùng await)
        // Nếu việc gọi này thất bại, hàm catch bên trong sẽ cập nhật trạng thái ERROR.
        callAIService(
            submission.id,
            content,
            topic.type,
            topic.sample_answer,
            topic.prompt,
            userId,
            topicId,
        );

        return processingSubmission;
    } catch (error) {
        // 3. Bắt lỗi Khóa Ngoại (Foreign Key) nếu User không tồn tại (P2003)
        if (isPrismaError(error) && error.code === 'P2003') {
            throw new AppError('User not found. Invalid User ID.', 404);
        }
        throw error; // Chuyển lỗi khác sang Global Handler
    }
};

/**
 * Lấy lịch sử các bài viết đã nộp của người dùng.
 * @param userId ID của người dùng (từ JWT)
 */
export const getWritingHistoryService = async (userId: number) => {
    return prisma.writingSubmissions.findMany({
        where: { user_id: userId },
        orderBy: { submitted_at: 'desc' }, // Sắp xếp theo ngày nộp mới nhất
        select: {
            id: true,
            status: true,
            content: true,
            band_score: true,
            submitted_at: true,
            processed_at: true,
            topics: {
                select: {
                    id: true,
                    description: true,
                    prompt: true,
                    type: true,
                    level: true,
                    image_url: true,
                    sample_answer: true,
                }
            }
        }
    });
};

/**
 * [HÀM BẤT ĐỒNG BỘ] Gọi AI Service để chấm điểm.
 * Hàm này CHẠY KHÔNG CHẶN (NON-BLOCKING) và không cần đợi kết quả.
 */
const callAIService = async (
    submissionId: number,
    content: string,
    topicType: WritingType,
    sampleAnswer: string | null,
    topicText: string,
    userId: number,
    topicId: number,
) => {
    // Không dùng try/catch ở đây để không chặn submission
    axios.post(AI_SERVICE_URL, {
        submission_id: submissionId,
        content: content,
        topic_type: topicType,
        sample_answer: sampleAnswer,
        topic_text: topicText,
        user_id: userId,
        topic_id: topicId,
    })
        .then(response => {
            // Ghi log thành công (Optional)
            console.log(`AI Service call dispatched successfully for submission ${submissionId}`);
        })
        .catch(async (error) => {
            // RẤT QUAN TRỌNG: Nếu gọi AI Service thất bại, cập nhật trạng thái ERROR
            console.error(`Error dispatching job to AI Service for submission ${submissionId}:`, error.message);

            // Cập nhật trạng thái trong DB
            await prisma.writingSubmissions.update({
                where: { id: submissionId },
                data: {
                    status: SubmissionStatus.ERROR,
                    processed_at: new Date(),
                    // Có thể thêm chi tiết lỗi vào raw_ai_response nếu cần
                }
            });
        });
};
