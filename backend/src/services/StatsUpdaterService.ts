// eduaion/backend/src/services/StatsUpdaterService.ts

import prisma from '../utils/prisma';
import { ActivityType, Status, LessonStatus } from '@prisma/client';

// Định nghĩa các hằng số Event/Activity Type
const WRITING_COMPLETED = ActivityType.WRITING_COMPLETED;
const VOCABULARY_MASTERED = ActivityType.VOCABULARY_MASTERED;
const LESSON_COMPLETED = ActivityType.LESSON_COMPLETED;
// const QUIZ_COMPLETED = ActivityType.QUIZ_COMPLETED; // Giả định có nếu triển khai Quiz

/**
 * Lớp chịu trách nhiệm cập nhật BẤT ĐỒNG BỘ các bảng Thống kê (UserStats, UserActivityLog, UserGoals).
 */
export const StatsUpdaterService = {

    /**
     * ----------------------------------------------------
     * HÀM CƠ SỞ: Ghi Log và Cập nhật Stats chung
     * ----------------------------------------------------
     * Hàm này được sử dụng để cập nhật UserStats (Dùng increment) và ghi ActivityLog.
     * @param userId ID người dùng
     * @param type Loại hoạt động (Enum ActivityType)
     * @param incrementField Trường cần tăng (ví dụ: 'total_words_learned')
     * @param incrementValue Giá trị tăng (mặc định là 1)
     * @param relatedId ID của bản ghi liên quan (vocabId, submissionId, lessonId)
     */
    async _logAndIncrementStats( // Đặt tên thành _logAndIncrementStats để đánh dấu là hàm nội bộ
        userId: number,
        type: ActivityType,
        incrementField: keyof Omit<typeof prisma.userStats.fields, 'user_id' | 'id'>, // Trường cần tăng
        incrementValue: number,
        relatedId: number
    ) {
        try {
            await prisma.$transaction([
                // 1. Ghi Activity Log
                prisma.userActivityLog.create({
                    data: {
                        user_id: userId,
                        activity_type: type,
                        related_entity_id: relatedId,
                        value: incrementValue,
                    }
                }),

                // 2. Cập nhật UserStats (Upsert: Tạo nếu chưa có, Cập nhật nếu đã có)
                prisma.userStats.upsert({
                    where: { user_id: userId },
                    update: {
                        [incrementField]: {
                            increment: incrementValue
                        },
                        // BỔ SUNG: Cập nhật last_activity_at 
                        // Tuy không có trong UserStats của bạn, nếu có sẽ giúp tính streak
                        // Ta sẽ thêm một trường update cho last_activity_at nếu nó tồn tại
                        // TẠM THỜI BỎ QUA last_activity_at TRONG UPDATE VÌ KHÔNG CÓ TRONG SCHEMA CŨ
                    },
                    create: {
                        user_id: userId,
                        // KHỞI TẠO TẤT CẢ CÁC TRƯỜNG VỀ GIÁ TRỊ MẶC ĐỊNH
                        total_words_learned: 0,
                        quizzes_completed: 0,
                        writings_completed: 0,
                        avg_band_score: 0.0, // Đảm bảo trường Float? cũng được khởi tạo
                        current_streak_days: 0,

                        // Sau đó áp dụng giá trị đang được cập nhật
                        [incrementField]: incrementValue,
                    }
                }),

                // TODO (Trong tương lai): Cập nhật UserGoals
                // prisma.userGoals.updateMany({
                //     // Logic: Tăng progress_value cho các mục tiêu liên quan
                // })
            ]);
        } catch (error) {
            console.error(`[StatsUpdater] Failed to update stats for user ${userId} and activity ${type}:`, error);
            // Cân nhắc thêm cơ chế retry/dead letter queue trong môi trường Production
        }
    },


    /**
     * ----------------------------------------------------
     * CẬP NHẬT: VOCABULARY FLOW
     * ----------------------------------------------------
     * Cập nhật khi người dùng hoàn thành học từ vựng (chuyển sang 'learned').
     * @param userId ID người dùng
     * @param wordCount số lượng từ vựng đã được học (learned)
     */
    updateStatsAfterVocabLearned: async (
        userId: number,
        wordCount: number,
        relatedLessonId: number = 0 // NHẬN relatedLessonId (Mặc định là 0 nếu không truyền)
    ) => {
        // Ta dùng Lesson ID làm relatedId trong trường hợp này, vì đây là sự kiện cấp Lesson
        // Nhưng vì Lesson ID không được truyền, ta sẽ dùng 0 hoặc Lesson ID nếu có thể truyền thêm.
        // Giả sử ta muốn log Event này với số lượng từ vựng (wordCount)
        const relatedId = relatedLessonId;

        // Tăng total_words_learned (bằng wordCount)
        await StatsUpdaterService._logAndIncrementStats(
            userId,
            VOCABULARY_MASTERED, // <-- GIỮ NGUYÊN ActivityType để không cần sửa DB Schema
            'total_words_learned',
            wordCount, // <-- SỬ DỤNG wordCount làm giá trị tăng
            relatedId // <-- relatedId: lessonId
        );
    },

    /**
     * ----------------------------------------------------
     * CẬP NHẬT: LESSON COMPLETED STUDY
     * ----------------------------------------------------
     * Cập nhật khi người dùng hoàn thành Study của một bài học (Không cần Quiz).
     * @param userId ID người dùng
     * @param lessonId ID của bài học đã hoàn thành Study
     * @param vocabCount Tổng số từ vựng trong Lesson
     */
    updateStatsAfterLessonCompleted: async (
        userId: number,
        lessonId: number,
        // vocabCount: number
    ) => {
        // Chỉ cần ghi Log Lesson Completed (vì từ vựng đã được tính ở VocabMastered)
        // Nếu cần tracking Lesson Completed, ta có thể dùng một trường khác trong UserStats, 
        // nhưng hiện tại chỉ cần Log.
        try {
            await prisma.userActivityLog.create({
                data: {
                    user_id: userId,
                    activity_type: LESSON_COMPLETED,
                    related_entity_id: lessonId,
                    // value: vocabCount, // Có thể lưu số lượng từ đã học
                }
            });

            // Cập nhật last_activity_at trong UserStats (không cần increment)
            await prisma.userStats.upsert({
                where: { user_id: userId },
                update: {},
                create: { user_id: userId }
            });

        } catch (error) {
            console.error(`[StatsUpdater] Failed to log lesson completed for user ${userId}:`, error);
        }
    },


    /**
     * ----------------------------------------------------
     * CẬP NHẬT: WRITING FLOW
     * ----------------------------------------------------
     * Cập nhật khi bài viết hoàn thành chấm điểm.
     * @param submissionId ID của bài nộp
     * @param bandScore Band Score nhận được (ví dụ: 6.5)
     * @param userId ID người dùng
     */
    updateStatsAfterWritingCompleted: async (
        submissionId: number,
        bandScore: number,
        userId: number
    ) => {
        // 1. Tăng writings_completed (+1)
        // 2. Cập nhật avg_band_score (Logic này phức tạp hơn Increment)

        try {
            // Lấy Stats hiện tại trong một transaction
            const [userStats, totalSubmissions, totalScoreSum] = await prisma.$transaction([
                // Lấy UserStats hiện tại
                prisma.userStats.findUnique({ where: { user_id: userId } }),

                // Tính tổng số bài nộp đã hoàn thành (bao gồm cả bài nộp hiện tại nếu ta coi nó là bài N+1)
                prisma.writingSubmissions.count({
                    where: {
                        user_id: userId,
                        status: 'COMPLETED' as any
                    }
                }),

                // Tính tổng điểm (chỉ những bài đã có điểm)
                prisma.writingSubmissions.aggregate({
                    _sum: { band_score: true },
                    where: {
                        user_id: userId,
                        status: 'COMPLETED' as any,
                        band_score: { not: null }
                    }
                })
            ]);

            // Tổng điểm hiện tại (cũ + mới)
            const currentTotalSum = (totalScoreSum._sum.band_score || 0) + bandScore;
            const newTotalCount = totalSubmissions; // Total count hiện tại đã bao gồm bản ghi mới
            const newAverage = newTotalCount > 0 ? currentTotalSum / newTotalCount : bandScore;

            await prisma.$transaction([
                // 1. Ghi Activity Log (Giống logAndIncrementStats)
                prisma.userActivityLog.create({
                    data: {
                        user_id: userId,
                        activity_type: WRITING_COMPLETED,
                        related_entity_id: submissionId,
                        value: bandScore,
                    }
                }),

                // 2. Cập nhật UserStats
                prisma.userStats.upsert({
                    where: { user_id: userId },
                    update: {
                        writings_completed: { increment: 1 }, // Tăng count
                        avg_band_score: newAverage,           // Cập nhật AVG mới
                    },
                    create: {
                        user_id: userId,
                        writings_completed: 1,
                        avg_band_score: bandScore,
                    }
                }),
            ]);

        } catch (error) {
            console.error(`[StatsUpdater] Failed to update stats after writing completed for submission ${submissionId}:`, error);
        }
    },


    /**
     * ----------------------------------------------------
     * CẬP NHẬT: QUIZ FLOW (Giả định - Chưa triển khai)
     * ----------------------------------------------------
     * Cập nhật khi Quiz hoàn thành.
     * @param quizId ID của Quiz
     * @param userId ID người dùng
     * @param score Điểm đạt được
     */
    updateStatsAfterQuizCompleted: async (
        quizId: number,
        userId: number,
        score: number
    ) => {
        // Tăng quizzes_completed (+1)
        await StatsUpdaterService._logAndIncrementStats(
            userId,
            ActivityType.QUIZ_COMPLETED,
            'quizzes_completed',
            1,
            quizId
        );
        // Lưu ý: Logic AVG score cần tính toán phức tạp như Writing, nếu cần
    },


    /**
     * ----------------------------------------------------
     * CẬP NHẬT: DAILY STREAK
     * ----------------------------------------------------
     * Hàm này cần được gọi qua một Scheduled Job (Cron Job) hoặc trong các luồng chính
     * @param userId ID người dùng
     */
    updateStreak: async (userId: number) => {
        // **Logic tính Streak** (Đây là một logic phức tạp, cần lịch sử hoạt động chính xác)

        // GIẢ ĐỊNH LOGIC TÍNH TOÁN STREAK:
        // 1. Lấy ngày hoạt động gần nhất (từ UserStats.last_activity_at)
        // 2. So sánh với ngày hôm qua:
        //    - Nếu hôm qua có hoạt động: Tăng current_streak_days (+1)
        //    - Nếu hôm qua không có hoạt động: Reset current_streak_days = 0 (hoặc 1 nếu có hoạt động hôm nay)

        try {
            // Lấy Stats hiện tại và Activity Log (cho mục đích demo)
            const userStats = await prisma.userStats.findUnique({ where: { user_id: userId } });

            // Logically: 
            // const today = new Date();
            // const yesterday = new Date(today);
            // yesterday.setDate(today.getDate() - 1);

            // const lastActivity = userStats?.last_activity_at;

            // // Logic đơn giản: Nếu có hoạt động hôm nay, ta chỉ cần update streak
            // if (/* logic kiểm tra đã có hoạt động hôm nay */) {
            //     let newStreak = (userStats?.current_streak_days || 0) + 1;
            // }

            // Giữ nguyên logic cập nhật last_activity_at trong các hàm trên. 
            // Việc tính toán streak nên được xử lý bởi một **Cron Job Service riêng** để đảm bảo tính nhất quán hàng ngày. 
            // Ta sẽ bỏ qua logic tính toán chi tiết ở đây để không làm phức tạp hóa StatsUpdater.

        } catch (error) {
            console.error(`[StatsUpdater] Failed to update streak for user ${userId}:`, error);
        }
    }
};