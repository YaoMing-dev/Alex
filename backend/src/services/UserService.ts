// eduaion/backend/src/services/UserService.ts

import prisma from '../utils/prisma';
import { Status, Level } from '@prisma/client';
import AppError from '../utils/AppError';

/**
 * Lấy thông tin người dùng và thống kê chi tiết từ userId (từ token)
 * @param userId ID người dùng
 */
export const getMeService = async (userId: string) => {
    const numericUserId = parseInt(userId);

    const user = await prisma.users.findUnique({
        where: { id: numericUserId },
        select: {
            id: true,
            email: true,
            username: true,
            level: true,
            created_at: true,
            user_stats: true, // Lấy thông tin stats
            avatar: true,
            user_vocab_progress: true,
            writing_submissions: true
        },
    });

    if (!user) {
        // Rất hiếm khi xảy ra: Token hợp lệ nhưng user đã bị xóa
        throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    return user;
};

export const updateProfileService = async (
    userId: string,
    data: { username?: string; level?: Level; avatar?: string }
) => {
    const numericId = parseInt(userId);

    const updated = await prisma.users.update({
        where: { id: numericId },
        data,
        include: { user_stats: true }
    });

    return updated;
};