// eduaion/backend/src/services/StatsService.ts

import prisma from '../utils/prisma';
import { Status, UserStats, UserGoals, UserActivityLog, ActivityType, SubmissionStatus, Prisma } from '@prisma/client';
import AppError from '../utils/AppError';
import { format, eachDayOfInterval, subDays, startOfDay } from 'date-fns';

/**
 * 💡 Logic Khởi tạo UserStats: 
 * Khi UserStats không tồn tại (lần đầu người dùng đăng nhập sau migrate), 
 * ta cần tạo một entry mặc định cho họ.
 */
const getOrCreateUserStats = async (userId: number): Promise<UserStats> => {
    let stats = await prisma.userStats.findUnique({ where: { user_id: userId } });

    if (!stats) {
        stats = await prisma.userStats.create({
            data: { user_id: userId },
        });
    }
    return stats;
};

// 1. Dữ liệu tổng hợp (Stat Cards & Goal Widget)
/**
 * Lấy dữ liệu tổng quan cho Dashboard: Stat Cards và mục tiêu đang hoạt động.
 * @param userId ID của người dùng
 */
export const getUserStatsSummaryService = async (userId: number) => {
    const userStats = await getOrCreateUserStats(userId);

    // Tính toán số từ cần ôn tập (Review Count) từ UserVocabProgress
    const reviewCount = await prisma.userVocabProgress.count({
        where: {
            user_id: userId,
            status: Status.review,
        }
    });

    // Lấy mục tiêu đang hoạt động của người dùng
    const activeGoals = await prisma.userGoals.findMany({
        where: { user_id: userId, is_active: true },
        orderBy: { created_at: 'desc' },
        take: 1, // Chỉ lấy mục tiêu quan trọng nhất/gần nhất
    });

    return {
        // Dữ liệu Stat Cards
        totalWordsLearned: userStats.total_words_learned,
        quizzesCompleted: userStats.quizzes_completed,
        writingsCompleted: userStats.writings_completed,
        avgBandScore: userStats.avg_band_score,
        currentStreakDays: userStats.current_streak_days,

        // Dữ liệu bổ sung
        reviewCount: reviewCount,

        // Dữ liệu cho Goal Widget
        activeGoal: activeGoals.length > 0 ? activeGoals[0] : null,
    };
};

// 2. Log hoạt động gần đây (Activity Feed)
/**
 * Lấy danh sách hoạt động gần đây của người dùng.
 * @param userId ID của người dùng
 * @param limit Số lượng log muốn lấy
 */
export const getUserActivityLogService = async (
    userId: number,
    limit: number = 10
): Promise<any[]> => { // Dùng any[] vì cần Enrichment

    // 1. Truy vấn log hoạt động
    const rawLogs = await prisma.userActivityLog.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
    });

    // 2. Enrichment: Lấy thêm thông tin chi tiết (ví dụ: tên topic/điểm số)
    const enrichedLogs = await Promise.all(rawLogs.map(async (log) => {
        let details: any = {};

        if (log.activity_type === ActivityType.WRITING_COMPLETED && log.related_entity_id) {
            // Lấy thông tin Band Score và Topic
            const submission = await prisma.writingSubmissions.findUnique({
                where: { id: log.related_entity_id },
                select: { band_score: true, topics: { select: { description: true, type: true } } }
            });

            if (submission) {
                details.bandScore = submission.band_score;
                details.topicDescription = submission.topics?.description;
                details.writingType = submission.topics?.type;
            }
        }

        // Có thể thêm logic Enrichment cho các loại ActivityType khác (QUIZ_COMPLETED, v.v.)

        return {
            ...log,
            details,
        };
    }));

    return enrichedLogs;
};

// 3. Dữ liệu cho biểu đồ tiến độ (Charts)
/**
 * Lấy dữ liệu tiến độ theo thời gian (Daily) cho Charts.
 * @param userId ID người dùng
 * @param type Loại dữ liệu (writing/vocab)
 * @param period Khung thời gian (7d)
 */
export const getDailyProgressService = async (
    userId: number,
    type: string,
    period: string
): Promise<any[]> => {
    // Luôn lấy 7 ngày gần nhất cho period='7d'
    const numDays = 7;
    const today = startOfDay(new Date()); // Bắt đầu ngày hôm nay (00:00)
    const startDate = subDays(today, numDays - 1); // Bắt đầu ngày thứ 7 trước (00:00)

    // TẠO KHUNG 7 NGÀY (SCAFFOLDING)
    const dateRange = eachDayOfInterval({
        start: startDate,
        end: today
    }).map(date => format(date, 'yyyy-MM-dd')); // Định dạng YYYY-MM-DD

    // Khởi tạo đối tượng map với 7 ngày, giá trị mặc định là 0
    const scaffoldMap = dateRange.reduce((acc, dateString) => {
        if (type === 'writing') {
            // Khởi tạo avgBandScore là null (N/A) nếu không có dữ liệu
            acc[dateString] = { date: dateString, count: 0, avgBandScore: null };
        } else if (type === 'vocab') {
            acc[dateString] = { date: dateString, wordsMastered: 0 };
        }
        return acc;
    }, {} as Record<string, any>);

    // --- LOGIC TRUY VẤN DỮ LIỆU THỰC TẾ SỬ DỤNG PRISMA CLIENT API ---

    if (type === 'writing') {
        const rawProgress = await prisma.writingSubmissions.findMany({
            where: {
                user_id: userId,
                status: SubmissionStatus.COMPLETED,
                submitted_at: {
                    gte: startDate, // Lấy từ startDate (Đã là Date object - start of day)
                },
            },
            select: {
                submitted_at: true,
                band_score: true,
            },
            orderBy: {
                submitted_at: 'asc',
            }
        });

        // TÍNH TOÁN VÀ HỢP NHẤT DỮ LIỆU TẠI BACKEND
        const dailyDataMap = rawProgress.reduce((acc, submission) => {
            // Format ngày theo chuẩn YYYY-MM-DD
            const dateKey = format(submission.submitted_at, 'yyyy-MM-dd');

            if (submission.band_score === null) return acc; // Bỏ qua nếu Band Score là null

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    totalBandScore: 0,
                    count: 0,
                };
            }

            acc[dateKey].totalBandScore += submission.band_score;
            acc[dateKey].count += 1;
            return acc;
        }, {} as Record<string, { totalBandScore: number, count: number }>);


        // HỢP NHẤT VÀO SCAFFOLD MAP
        Object.keys(dailyDataMap).forEach(dateKey => {
            if (scaffoldMap[dateKey]) {
                const dailyStats = dailyDataMap[dateKey];
                scaffoldMap[dateKey] = {
                    date: dateKey,
                    count: dailyStats.count,
                    // Tính Band Score Trung bình và làm tròn 2 chữ số thập phân
                    avgBandScore: parseFloat((dailyStats.totalBandScore / dailyStats.count).toFixed(2)),
                };
            }
        });

    } else if (type === 'vocab') {
        // Truy vấn UserActivityLog cho VOCABULARY_MASTERED
        const rawProgress = await prisma.userActivityLog.findMany({
            where: {
                user_id: userId,
                activity_type: ActivityType.VOCABULARY_MASTERED,
                created_at: {
                    gte: startDate,
                },
            },
            select: {
                created_at: true,
                value: true, // Giá trị mặc định là 1 (từ mastered)
            },
            orderBy: {
                created_at: 'asc',
            }
        });

        // TÍNH TOÁN VÀ HỢP NHẤT DỮ LIỆU TẠI BACKEND
        const dailyDataMap = rawProgress.reduce((acc, log) => {
            const dateKey = format(log.created_at, 'yyyy-MM-dd');

            if (!acc[dateKey]) {
                acc[dateKey] = {
                    wordsMastered: 0,
                };
            }

            // Cộng dồn giá trị (số từ)
            acc[dateKey].wordsMastered += log.value;
            return acc;
        }, {} as Record<string, { wordsMastered: number }>);

        // HỢP NHẤT VÀO SCAFFOLD MAP
        Object.keys(dailyDataMap).forEach(dateKey => {
            if (scaffoldMap[dateKey]) {
                scaffoldMap[dateKey] = {
                    date: dateKey,
                    wordsMastered: dailyDataMap[dateKey].wordsMastered,
                };
            }
        });
    }

    // Trả về dữ liệu đã được Scaffolding, đảm bảo có đủ 7 ngày, theo thứ tự ngày tăng dần
    return Object.values(scaffoldMap).sort((a, b) => a.date.localeCompare(b.date));
};