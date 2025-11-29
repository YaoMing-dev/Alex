// eduaion/backend/src/services/VocabService.ts

import prisma from '../utils/prisma';
import { Status, Level, Lesson, Theme, LessonStatus, Prisma } from '@prisma/client';
import AppError from '../utils/AppError'; // Import AppError
import { StatsUpdaterService } from './StatsUpdaterService';

// Type Guard để kiểm tra lỗi Prisma (có thể đặt trong utils/shared)
function isPrismaError(error: any): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

// Helper Type để định nghĩa Lesson đã được include các quan hệ cần thiết
export type LessonSummaryWithProgress = Prisma.LessonGetPayload<{
    include: {
        theme: { select: { name: true, level: true, type: true, id: true, imageUrl: true, created_at: true } },
        lesson_progress: { select: { study_status: true } },
        vocabs: {
            select: {
                id: true,
                user_vocab_progress: { select: { status: true } },
            },
        },
        quizzes: {
            select: {
                completed_at: true,
                is_passed: true
            }
        }
    },
}>;

// Định nghĩa các Types/Interfaces cần thiết cho việc trả về
type VocabProgressStatus = 'not_started' | 'in_progress' | 'completed';

type LessonWithProgress = LessonSummaryWithProgress & {
    studyProgressStatus: 'not_started' | 'in_progress' | 'completed'; // Tiến độ học từ vựng
    quizCompleted: boolean;
    vocabCount: number;
    learnedVocabCount: number;
    progressPercent: number;
};

type ThemeWithProgress = Theme & {
    progressStatus: VocabProgressStatus;
    lessons: LessonWithProgress[];
    progressPercent: number;
};

/** 
 * HÀM HỖ TRỢ: TÍNH TOÁN PROGRESS CHUNG CHO UI
 * @param learnedCount Số lượng từ đã học (learned, review, mastered)
 * @param totalCount Tổng số từ
 * @returns 'not_started' | 'in_progress' | 'completed'
*/
const getStudyProgressStatus = (learnedCount: number, totalCount: number): 'not_started' | 'in_progress' | 'completed' => {
    if (totalCount === 0) return 'completed';
    if (learnedCount === totalCount) return 'completed';
    if (learnedCount > 0) return 'in_progress';
    return 'not_started';
}

/**
 * Hàm hỗ trợ: Chuyển đổi trạng thái Prisma.Status sang string Status cho Lesson/Theme
 * @param learnedCount Số lượng từ đã học (learned hoặc review)
 * @param totalCount Tổng số từ
 * @returns 'not_started' | 'in_progress' | 'completed'
 */
const getProgressStatus = (learnedCount: number, totalCount: number): VocabProgressStatus => {
    if (totalCount === 0) return 'completed'; // Xử lý trường hợp Lesson/Theme không có từ nào
    if (learnedCount === totalCount) return 'completed';
    if (learnedCount > 0) return 'in_progress';
    return 'not_started';
}

/**
 * Hàm hỗ trợ: Tính toán phần trăm tiến độ
 * @param learnedCount 
 * @param totalCount 
 * @returns number (0-100)
 */
const getProgressPercent = (learnedCount: number, totalCount: number): number => {
    if (totalCount === 0) return 100;
    return Math.min(100, Math.round((learnedCount / totalCount) * 100));
}

/**
 * API 1: Lấy danh sách Themes/Lessons kèm Tiến độ cho trang tổng quan.
 * @param userId ID người dùng
 * @param userLevel Level của người dùng
 */
export const getThemesService = async (userId: number, userLevel: Level) => {
    // 1. Lấy tất cả Lessons, Vocabs, và LessonProgress của User theo level
    const allLessons = await prisma.lesson.findMany({
        where: {
            OR: [
                { level: userLevel },
                {
                    theme: {
                        // CHỈ LỌC THEO LEVEL CỦA NGƯỜI DÙNG HOẶC LÀ SPECIAL THEME
                        type: 'SPECIAL' as any,
                    }
                },
            ]
        },
        include: {
            theme: true,
            lesson_progress: {
                where: { user_id: userId },
                select: { study_status: true },
            },
            quizzes: {
                select: {
                    completed_at: true,
                    is_passed: true,
                }
            },
            vocabs: {
                select: {
                    id: true,
                    user_vocab_progress: {
                        where: { user_id: userId },
                        select: { status: true },
                    },
                },
            },
        },
        orderBy: {
            theme: { name: 'asc' },
        }
    }) as LessonWithProgress[]; // ÉP KIỂU ĐỂ CÁC BƯỚC SAU BIẾT CÓ CÁC FIELD INCLUDE

    // 2. Xử lý dữ liệu và Phân loại
    const regularThemesMap = new Map<number, ThemeWithProgress>();
    const specialLessons: LessonWithProgress[] = [];
    // Danh sách các ID của Regular Theme đã hoàn thành Study (tất cả lessons đều COMPLETED_STUDY)
    const completedRegularThemeIds = new Set<number>();
    // Danh sách các Special Lesson đã hoàn thành Study (COMPLETED_STUDY)
    const completedSpecialLessonsData: LessonWithProgress[] = [];

    for (const lesson of allLessons) {
        const vocabCount = lesson.vocabs.length;

        // --- TÍNH TOÁN PROGRESS (Vocab) ---
        const learnedCount = lesson.vocabs.filter(v =>
            v.user_vocab_progress[0]?.status !== Status.new && v.user_vocab_progress[0]?.status !== undefined
        ).length;
        const studyStatus = getStudyProgressStatus(learnedCount, vocabCount);
        const progressPercent = getProgressPercent(learnedCount, vocabCount);

        // Lấy trạng thái LessonProgress từ DB (ưu tiên dùng LessonProgress DB)
        const lessonDbStatus = lesson.lesson_progress[0]?.study_status;
        const isCompletedStudy = lessonDbStatus === LessonStatus.COMPLETED_STUDY;

        // Loại bỏ logic Quiz trong việc xác định Overall Status
        const overallStatus = isCompletedStudy ? 'completed' :
            (studyStatus !== 'not_started') ? 'in_progress' : 'not_started';

        // TÍNH TOÁN lessonDisplayStatus (cho Regular Themes) 
        let lessonDisplayStatus: string;

        if (isCompletedStudy) {
            // Thay thế 'completed-quiz' bằng 'completed-study'
            lessonDisplayStatus = 'completed-study';
        } else if (lesson.order === 1) {
            lessonDisplayStatus = studyStatus === 'in_progress' ? 'in-progress' : 'ready-to-learn';
        } else {
            lessonDisplayStatus = studyStatus === 'in_progress' ? 'in-progress' : 'ready-to-learn';
        }
        // ---------------------------------------------

        const lessonWithProgress: LessonWithProgress = {
            ...lesson,
            studyProgressStatus: studyStatus,
            // Giữ lại quizCompleted cho Frontend nếu nó vẫn cần (mặc dù hiện tại không dùng)
            quizCompleted: lesson.quizzes.some(q => q.completed_at !== null && q.is_passed === true),
            vocabCount: vocabCount,
            learnedVocabCount: learnedCount,
            progressPercent: progressPercent,
            lessonDisplayStatus: lessonDisplayStatus as any,
        } as LessonWithProgress; // Ép kiểu lại;

        const isSpecial = lesson.theme.type === 'SPECIAL';

        if (isSpecial) {
            if (overallStatus === 'completed') {
                // Thêm vào mảng Completed nếu đã hoàn thành Study
                completedSpecialLessonsData.push(lessonWithProgress);
            } else {
                // Thêm vào mảng In-Progress nếu chưa hoàn thành
                specialLessons.push(lessonWithProgress);
            }
        } else {
            // Regular Theme
            if (!regularThemesMap.has(lesson.theme_id)) {
                const themeProgress: ThemeWithProgress = {
                    ...lesson.theme,
                    progressStatus: 'not_started',
                    lessons: [],
                    progressPercent: 0,
                };
                regularThemesMap.set(lesson.theme_id, themeProgress);
            }
            regularThemesMap.get(lesson.theme_id)?.lessons.push(lessonWithProgress);
            // Ghi lại trạng thái hoàn thành Lesson trong Regular Theme (dùng cho bước 3)
            if (isCompletedStudy) {
                (lessonWithProgress as any).isCompletedStudy = true;
            }
        }

        // --- Logic cho Completed Section ---
        if (overallStatus === 'completed') {
            // Thêm vào một mảng tạm để phân loại Completed (sẽ xử lý ở bước 4)
            if (isSpecial) {
                (lessonWithProgress as any).isCompletedSpecial = true;
            } else {
                // Đánh dấu Lesson là đã hoàn thành Quiz trong Regular Theme
                (lessonWithProgress as any).isCompletedRegularQuiz = true;
            }
        }
    }

    // 3. Tính toán tiến độ cho Regular Themes (Dựa trên Study Status)
    const regularThemes: ThemeWithProgress[] = Array.from(regularThemesMap.values()).map(theme => {
        // Đếm số Lesson đã "completed" QUIZ
        const completedLessonCount = theme.lessons.filter(l => (l as any).isCompletedRegularQuiz).length;
        const totalLessonCount = theme.lessons.length;

        // Tính toán Theme Progress Percent (Dựa trên số Lesson đã hoàn thành Study)
        const themeProgressPercent = getProgressPercent(completedLessonCount, totalLessonCount);

        let themeStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';

        // TRẠNG THÁI HOÀN THÀNH THEME: TẤT CẢ LESSON ĐỀU ĐÃ COMPLETED_STUDY
        if (completedLessonCount === totalLessonCount && totalLessonCount > 0) {
            themeStatus = 'completed';
        } else if (completedLessonCount > 0 || theme.lessons.some(l => l.studyProgressStatus !== 'not_started')) {
            themeStatus = 'in_progress';
        }

        return {
            ...theme,
            progressStatus: themeStatus,
            progressPercent: themeProgressPercent,
            lessons: theme.lessons.sort((a, b) => a.order - b.order),
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    // 4. Phân nhóm Completed
    const completedThemes = regularThemes.filter(t => t.progressStatus === 'completed');
    // Sử dụng mảng đã thu thập từ bước 2
    const completedSpecialLessons = completedSpecialLessonsData;

    // 5. Trả về kết quả cuối cùng theo cấu trúc yêu cầu
    return {
        regularThemes: regularThemes.filter(t => t.progressStatus !== 'completed'),
        specialLessons: specialLessons, // Đã lọc ở bước 2
        completed: [
            ...completedThemes.map(t => ({
                ...t,
                // Định dạng lại Theme để phù hợp với CompletedItem của Frontend
                // Các trường name, level, id, created_at, progressPercent đều có sẵn
                type: 'regular-theme',
                progressStatus: 'completed',
                // Bổ sung vocabCount (tính lại dựa trên Theme lessons)
                vocabCount: t.lessons.reduce((sum, lesson) => sum + lesson.vocabCount, 0),
                // Bổ sung các trường cần thiết nếu ThemeSummary không có đủ
                id: t.id,
                name: t.name,
                level: t.level,
                imageUrl: t.imageUrl,
                createdAt: t.created_at,
            })),
            ...completedSpecialLessons.map(l => ({
                // LessonSummary + type
                id: l.id,
                name: l.name,
                order: l.order,
                level: l.level,
                imageUrl: l.imageUrl,
                progressStatus: 'completed' as VocabProgressStatus,
                vocabCount: l.vocabs.length,
                createdAt: l.created_at,
                progressPercent: 100, // Hoàn thành Quiz -> 100%
                type: 'special-lesson' as const,
            }))
        ].sort((a, b) => (a as any).name.localeCompare((b as any).name)),
    };
};

/**
 * API 2: Lấy danh sách Lessons thuộc một Theme, có logic mở khóa.
 */
export const getLessonsByThemeService = async (themeId: number, userId: number) => {
    // 1. Lấy Theme để kiểm tra tồn tại và level
    const theme = await prisma.theme.findUnique({
        where: { id: themeId },
        select: { id: true, name: true, level: true, type: true, imageUrl: true, lessons: { select: { id: true, order: true } } }
    });

    if (!theme) {
        throw new AppError('Theme not found.', 404);
    }

    // 2. Lấy danh sách Lessons, Vocabs, và Progress
    const lessons = await prisma.lesson.findMany({
        where: { theme_id: themeId },
        select: {
            id: true,
            name: true,
            order: true,
            level: true,
            imageUrl: true,
            created_at: true, // BỔ SUNG: Dùng cho LessonSummary
            // Lấy LessonProgress để kiểm tra study_status
            lesson_progress: {
                where: { user_id: userId },
                select: { study_status: true },
            },
            quizzes: { select: { id: true, completed_at: true, is_passed: true } }, // Thêm Quizzes
            vocabs: {
                select: {
                    id: true,
                    user_vocab_progress: {
                        where: { user_id: userId },
                        select: { status: true },
                    },
                },
            },
        },
        orderBy: {
            order: 'asc',
        },
    });

    // Logic Mở Khóa và Tiến độ
    let isPreviousLessonCompleted = true; // Lesson đầu tiên luôn mở
    const isRegularTheme = theme.type === 'REGULAR';

    const formattedLessons = lessons.map(lesson => {
        const vocabCount = lesson.vocabs.length;
        const learnedCount = lesson.vocabs.filter(v =>
            v.user_vocab_progress[0]?.status !== Status.new && v.user_vocab_progress[0]?.status !== undefined
        ).length;

        const progressStatus = getProgressStatus(learnedCount, vocabCount);
        const progressPercent = getProgressPercent(learnedCount, vocabCount);

        //  DÙNG progressStatus để xác định hoàn thành học từ 
        // Cần lấy trạng thái hoàn thành Study từ DB nếu có
        const userProgress = lesson.lesson_progress[0];
        // Cập nhật: isCompletedStudy được xác định DỰA TRÊN DB (LessonProgress) nếu có
        let isCompletedStudy = userProgress?.study_status === LessonStatus.COMPLETED_STUDY;
        // Nếu DB chưa có LessonProgress (chưa học), ta vẫn dùng progressStatus
        if (!isCompletedStudy && !userProgress) {
            isCompletedStudy = progressStatus === 'completed'; // Mặc định từ tính toán Vocab
        }

        // Kiểm tra logic mở khóa
        let isLocked = false;
        if (isRegularTheme) {
            // Lesson Regular bị khóa nếu Lesson trước đó chưa hoàn thành Study
            if (!isPreviousLessonCompleted) {
                isLocked = true;
            }
        }

        // Cập nhật trạng thái cho vòng lặp tiếp theo
        const isCurrentLessonCompleted = isCompletedStudy; // Chỉ cần hoàn thành Study để mở khóa Lesson tiếp theo

        if (isRegularTheme) {
            isPreviousLessonCompleted = isCurrentLessonCompleted;
        }

        // Kiểm tra trạng thái Quiz (Dựa trên bảng Quizzes, không dùng để xác định hoàn thành tổng thể))
        const isQuizCompleted = lesson.quizzes.some(q => q.completed_at !== null && q.is_passed === true);

        // XÁC ĐỊNH TRẠNG THÁI HIỂN THỊ (Frontend LessonStatus)
        let lessonDisplayStatus: string;

        if (isCompletedStudy) { // Thay thế logic 'isQuizCompleted' bằng 'isCompletedStudy'
            lessonDisplayStatus = 'completed-study'; // Đã hoàn thành Study (coi là hoàn thành cao nhất)
        } else if (isLocked) {
            lessonDisplayStatus = 'upcoming'; // Lesson bị khóa
        } else if (progressStatus === 'in_progress') {
            lessonDisplayStatus = 'in-progress'; // Đang học
        } else {
            lessonDisplayStatus = 'ready-to-learn'; // Sẵn sàng học
        }

        const lessonQuizzes = lesson.quizzes.length > 0 ? lesson.quizzes.map(q => ({
            id: q.id,
            isCompleted: !!q.completed_at,
            isPassed: q.is_passed,
        })) : [];

        // Định dạng lại kết quả
        const { vocabs, quizzes, lesson_progress, ...safeLesson } = lesson;

        return {
            ...safeLesson,
            vocabCount: vocabCount,
            learnedVocabCount: learnedCount,
            progressStatus: progressStatus,
            progressPercent: progressPercent,
            isLocked: isLocked, // Thêm trường isLocked
            quizzes: lessonQuizzes,
            isQuizCompleted: isQuizCompleted,
            lessonDisplayStatus: lessonDisplayStatus as any,
        };
    });

    return {
        themeName: theme.name,
        themeLevel: theme.level,
        themeImageUrl: theme.imageUrl,
        lessons: formattedLessons,
    };
};

/**
 * Lấy chi tiết một bài học (Lesson) bao gồm Vocab và tiến độ của người dùng.
 * @param lessonId ID của Lesson
 * @param userId ID người dùng (lấy từ token)
 */
export const getLessonDetailsService = async (lessonId: number, userId: number) => {
    // 1. Lấy Lesson và các Vocab liên quan
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            vocabs: {
                select: {
                    id: true,
                    word: true,
                    type: true,
                    cefr: true,
                    ipa_us: true,
                    ipa_uk: true,
                    meaning_en: true,
                    meaning_vn: true,
                    example: true,
                    audio_url: true,
                    audio_url_uk: true,
                    user_vocab_progress: {
                        where: {
                            user_id: userId,
                        },
                        select: {
                            status: true,
                        },
                    },
                },
            },
            lesson_progress: {
                where: { user_id: userId },
                select: { last_learned_vocab_id: true } // Lấy ID của từ đang học dở
            },
            theme: {
                select: { name: true }
            }
        },
    });

    if (!lesson) {
        // Thay thế bằng AppError 404
        throw new AppError('Lesson not found.', 404);
    }

    // 2. Định dạng lại Vocab (giữ nguyên logic của bạn)
    const formattedVocabs = lesson.vocabs.map(vocab => {
        const progressStatus = vocab.user_vocab_progress[0]?.status || 'new';
        const { user_vocab_progress, ...safeVocab } = vocab;

        return {
            ...safeVocab,
            progressStatus: progressStatus,
        };
    });

    // 3. Định dạng kết quả cuối cùng
    const { vocabs, lesson_progress, theme, ...safeLesson } = lesson;

    // Tìm kiếm vị trí bắt đầu
    const lastLearnedVocabId = lesson_progress[0]?.last_learned_vocab_id;
    let startingIndex = 0;

    if (lastLearnedVocabId) {
        // Tìm index của Vocab đó trong danh sách
        const index = formattedVocabs.findIndex(v => v.id === lastLearnedVocabId);
        // Bắt đầu từ từ vựng đó (index + 1) để người dùng xem lại từ cuối cùng đã học
        // Hoặc bắt đầu từ index của từ đó nếu Frontend muốn xem lại từ đó
        startingIndex = index !== -1 ? index : 0;
    }

    return {
        ...safeLesson,
        themeName: theme.name,
        vocabs: formattedVocabs,
        startingIndex: startingIndex,
    };
};

/**
 * API 3: Cập nhật trạng thái học tập của một từ vựng cho người dùng cụ thể.
 * @param userId ID của người dùng (từ JWT)
 * @param vocabId ID của từ vựng
 * @param newStatus Trạng thái mới (new, review, learned)
 */
export const updateVocabProgressService = async (
    userId: number,
    vocabId: number,
    newStatus: Status
) => {
    try {
        // 1. Kiểm tra Vocab có tồn tại không
        const vocab = await prisma.vocab.findUnique({
            where: { id: vocabId },
            select: { id: true, lesson_id: true }
        });

        if (!vocab) {
            // Thay thế bằng AppError 404
            throw new AppError('Vocabulary item not found.', 404);
        }

        // 2. Upsert (Tạo hoặc Cập nhật) tiến độ của người dùng
        const progress = await prisma.userVocabProgress.upsert({
            where: {
                user_id_vocab_id: {
                    user_id: userId,
                    vocab_id: vocabId,
                },
            },
            update: {
                status: newStatus,
            },
            create: {
                user_id: userId,
                vocab_id: vocabId,
                status: newStatus,
            },
        });

        // 3. Kích hoạt cập nhật thống kê nếu Vocab đạt trạng thái 'learned'
        if (newStatus === Status.learned) {
            // Gọi StatsUpdaterService (Bất đồng bộ)
            StatsUpdaterService.updateStatsAfterVocabLearned(userId, 1).catch(error => { // <-- GỌI HÀM MỚI VÀ GỬI wordCount = 1
                // Ghi log lỗi mà không block luồng chính
                console.error("Error updating stats for vocab mastered:", error);
            });
        }

        return progress;
    } catch (error) {
        // Bắt lỗi khóa ngoại nếu người dùng (userId) không tồn tại, v.v.
        if (isPrismaError(error) && error.code === 'P2003') {
            throw new AppError('User ID or Vocab ID not valid (Foreign Key violation).', 400);
        }
        throw error;
    }
};

/**
 * API 4: Xác nhận hoàn thành một Bài học (Lesson).
 * (Đây chỉ là hoàn thành phần HỌC TỪ, không phải hoàn thành Quiz)
 * @param userId ID của người dùng
 * @param lessonId ID của bài học
 * @returns {message: string, isCompleted: boolean}
 */
export const completeLessonService = async (
    userId: number,
    lessonId: number
) => {
    // 1. Kiểm tra Lesson có tồn tại không
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { vocabs: { select: { id: true } } }
    });

    if (!lesson) {
        throw new AppError('Lesson not found.', 404);
    }

    const vocabIds = lesson.vocabs.map(v => v.id);
    const completedVocabCount = vocabIds.length; // Số lượng từ sẽ được cập nhật

    if (vocabIds.length === 0) {
        // Cập nhật LessonProgress thành COMPLETED_STUDY (nếu không có từ vựng)
        await prisma.lessonProgress.upsert({
            where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } },
            update: { study_status: LessonStatus.COMPLETED_STUDY, study_completed_at: new Date() },
            create: { user_id: userId, lesson_id: lessonId, study_status: LessonStatus.COMPLETED_STUDY, study_completed_at: new Date() },
        });

        // CHỈ GHI LOG LESSON COMPLETED (Dành cho Lesson không có Vocab)
        StatsUpdaterService.updateStatsAfterLessonCompleted(userId, lessonId).catch(error => {
            console.error("Error updating stats for Lesson Completed (No Vocab):", error);
        });

        return {
            message: `Lesson completed successfully! (No vocabs in lesson).`, // Cập nhật message
            isCompleted: true
        };
    }

    // 2. Cập nhật/Tạo tiến độ cho TẤT CẢ Vocab trong Lesson thành 'learned' và LessonProgress
    await prisma.$transaction([
        // A. Cập nhật tất cả Vocab thành 'learned'
        ...vocabIds.map(vocabId =>
            prisma.userVocabProgress.upsert({
                where: {
                    user_id_vocab_id: {
                        user_id: userId,
                        vocab_id: vocabId,
                    },
                },
                update: {
                    status: Status.learned,
                },
                create: {
                    user_id: userId,
                    vocab_id: vocabId,
                    status: Status.learned,
                },
            })
        ),
        // B. Cập nhật LessonProgress thành COMPLETED_STUDY
        prisma.lessonProgress.upsert({
            where: {
                user_id_lesson_id: {
                    user_id: userId,
                    lesson_id: lessonId,
                },
            },
            update: {
                study_status: LessonStatus.COMPLETED_STUDY,
                study_completed_at: new Date(),
            },
            create: {
                user_id: userId,
                lesson_id: lessonId,
                study_status: LessonStatus.COMPLETED_STUDY,
                study_completed_at: new Date(),
            },
        }),
    ]);

    // Kích hoạt cập nhật thống kê cho Lesson Completed (Sự kiện Lesson)
    StatsUpdaterService.updateStatsAfterLessonCompleted(userId, lessonId).catch(error => {
        console.error("Error updating stats for Lesson Completed:", error);
    });

    // BỔ SUNG: Kích hoạt cập nhật thống kê cho Vocab Mastered (Sự kiện Vocab/Stats)
    // Dùng số lượng từ vựng vừa học được
    // StatsUpdaterService.updateStatsAfterVocabLearned(userId, vocabIds.length, lessonId).catch(error => {
    //     console.error("Error updating stats for VOCABULARY_LEARNED:", error);
    // });

    return {
        message: `Lesson completed successfully! ${vocabIds.length} vocabs status updated to 'learned'.`,
        isCompleted: true
    };
};

/**
 * Cập nhật vị trí học dở và trạng thái IN_PROGRESS.
 * Được gọi khi người dùng thoát hoặc chuyển card.
 * @param userId 
 * @param lessonId 
 * @param lastVocabId ID của từ vựng cuối cùng đã xem
 * @returns 
 */
export const saveStudyProgressService = async (
    userId: number,
    lessonId: number,
    lastVocabId: number // ID của từ vựng cuối cùng đã xem/chuyển đến
) => {
    try {
        // 1. Lấy LessonProgress hiện tại
        const existingProgress = await prisma.lessonProgress.findUnique({
            where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } },
            select: { study_status: true }
        });

        // 2. Xác định trạng thái cần cập nhật
        let newStatus: LessonStatus = LessonStatus.IN_PROGRESS;

        // KIỂM TRA QUAN TRỌNG: Nếu Lesson đã là COMPLETED_STUDY, KHÔNG ĐƯỢC ĐỔI sang IN_PROGRESS.
        // Đây là lỗi logic nặng nhất. Nếu Lesson đã hoàn thành, nó vẫn là đã hoàn thành.
        if (existingProgress?.study_status === LessonStatus.COMPLETED_STUDY) {
            newStatus = LessonStatus.COMPLETED_STUDY; // GIỮ NGUYÊN trạng thái đã hoàn thành
        }
        // Nếu không có progress hoặc trạng thái khác, giữ nguyên IN_PROGRESS (mặc định)

        // 3. Upsert (Tạo hoặc Cập nhật) LessonProgress
        const progress = await prisma.lessonProgress.upsert({
            where: { user_id_lesson_id: { user_id: userId, lesson_id: lessonId } },
            update: {
                // Sử dụng newStatus (sẽ là COMPLETED_STUDY nếu Lesson đã hoàn thành)
                study_status: newStatus,
                last_learned_vocab_id: lastVocabId,
            },
            create: {
                user_id: userId,
                lesson_id: lessonId,
                study_status: LessonStatus.IN_PROGRESS, // Lần đầu luôn là IN_PROGRESS
                last_learned_vocab_id: lastVocabId,
            },
        });
        return progress;
    } catch (error) {
        throw error;
    }
}