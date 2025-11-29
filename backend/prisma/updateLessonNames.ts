// eduaion/scripts/updateLessonNames.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLessonNames() {
    console.log('Bắt đầu cập nhật tên Lesson...');

    try {
        // 1. Lấy tất cả Lessons, bao gồm Theme và Vocab đầu tiên
        const lessonsToUpdate = await prisma.lesson.findMany({
            include: {
                theme: {
                    select: {
                        name: true,
                        level: true,
                    },
                },
                vocabs: {
                    select: {
                        word: true,
                    },
                    take: 1, // Chỉ lấy từ đầu tiên để đặt tên
                    orderBy: {
                        id: 'asc', // Giả định ID thấp nhất là từ đầu tiên
                    },
                },
            },
        });

        const updates = lessonsToUpdate.map(lesson => {
            const themeName = lesson.theme.name;
            const lessonOrder = lesson.order;

            // Lấy từ vựng đầu tiên, nếu không có thì dùng tên Theme
            const firstWord = lesson.vocabs[0]?.word;

            let newLessonName: string;

            if (firstWord) {
                // Ví dụ: Basic Function Words - Lesson 33: a
                newLessonName = `${themeName} - Lesson ${lessonOrder}: ${firstWord}`;
            } else {
                // Trường hợp dự phòng nếu Lesson không có từ nào (không nên xảy ra)
                newLessonName = `${themeName} - Lesson ${lessonOrder}`;
            }

            return {
                id: lesson.id,
                newName: newLessonName,
            };
        });

        // 2. Thực hiện cập nhật hàng loạt
        const updatePromises = updates.map(update =>
            prisma.lesson.update({
                where: { id: update.id },
                data: { name: update.newName },
            })
        );

        const results = await prisma.$transaction(updatePromises);

        console.log(`✅ Hoàn thành cập nhật tên cho ${results.length} Lessons.`);

    } catch (error) {
        console.error('❌ Lỗi khi cập nhật tên Lesson:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

updateLessonNames();