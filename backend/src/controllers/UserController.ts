// eduaion/backend/src/controllers/UserController.ts (REFACCTOR)

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError'; // Import AppError
import catchAsync from '../utils/catchAsync';
import { getMeService, updateProfileService } from '../services/UserService';

// Dùng protect middleware để đảm bảo req.user đã có
export const getMeController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // req.user được gắn bởi AuthMiddleware.protect
    const userId = req.user?.userId;

    if (!userId) {
        // Lỗi này đáng lẽ không xảy ra nếu protect hoạt động, nhưng thêm để an toàn
        return res.status(401).json({ message: 'User not authenticated' });
    }

    // Lấy thông tin chi tiết người dùng và stats
    const user = await getMeService(userId);

    res.status(200).json({
        status: 'success',
        user: user,
    });
});

export const updateProfileController = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId!;
    const { username, level, avatar } = req.body;

    const updatedUser = await updateProfileService(userId, { username, level, avatar });

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        user: updatedUser
    });
});