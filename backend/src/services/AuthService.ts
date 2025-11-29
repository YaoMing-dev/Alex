// eduaion/backend/src/services/AuthService.ts

import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import { Level } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import AppError from '../utils/AppError';
import jwt from 'jsonwebtoken';
import FlashcardService from './FlashcardService';

// Số lần băm mật khẩu (nên dùng >= 10)
export const SALT_ROUNDS = 10;

// Type Guard để kiểm tra xem lỗi có thuộc tính 'code' (như lỗi Prisma) không
function isPrismaError(error: any): error is { code: string; message: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
}

/**
 * Hàm service để xử lý nghiệp vụ đăng ký
 * @param email Email người dùng
 * @param username Tên người dùng
 * @param password Mật khẩu thô
 * @returns { }
 */
export const signUpService = async (email: string, username: string, password: string) => {
    // 1. Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.users.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new AppError('Email already registered.', 409); // 409 Conflict
    }

    // 2. Băm (Hash) mật khẩu trước khi lưu
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Tạo user mới
    const newUser = await prisma.users.create({
        data: {
            email,
            username,
            passwordHash,
            level: Level.Beginner,
        },
        select: { id: true, email: true, username: true, level: true, created_at: true },
    });

    // 4. Tạo flashcard set mặc định cho user mới
    // Chạy async nhưng không await để không block response
    FlashcardService.createDefaultFlashcardSet(newUser.id).catch((err) => {
        console.error('Failed to create default flashcard set:', err);
    });

    // Generate tokens + lưu refresh (ngoài transaction vì không critical)
    const payload = { userId: newUser.id.toString(), email: newUser.email, level: newUser.level };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash refresh và lưu vào DB
    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await prisma.users.update({
        where: { id: newUser.id },
        data: { refreshToken: hashedRefresh },
    });

    return { user: newUser, accessToken, refreshToken };
};

/**
 * Hàm service để xử lý nghiệp vụ đăng nhập
 * @param email Email người dùng
 * @param password Mật khẩu thô
 * @returns { user: Users }
 */
export const signInService = async (email: string, password: string) => {
    // Tìm người dùng theo email (cần lấy cả passwordHash để so sánh)
    const user = await prisma.users.findUnique({
        where: { email },
    });

    // Kiểm tra người dùng tồn tại
    if (!user) {
        throw new AppError('Invalid email or password.', 401);
    }

    // KIỂM TRA: Nếu passwordHash là null → người dùng đăng nhập bằng Google
    if (!user.passwordHash) {
        throw new AppError('This account uses Google login. Please sign in with Google.', 401);
    }

    // So sánh mật khẩu (bây giờ passwordHash chắc chắn là string)
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        throw new AppError('Invalid email or password.', 401);
    }

    // Generate tokens
    const payload = {
        userId: user.id.toString(),
        email: user.email,
        level: user.level,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Hash và update refresh vào DB
    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await prisma.users.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefresh },
    });

    // Trả về safe user + tokens
    const { passwordHash, refreshToken: _, ...safeUser } = user; // Loại bỏ refresh DB
    return { user: safeUser, accessToken, refreshToken };
};

/**
 * Cập nhật level của người dùng đã có.
 * @param userId ID người dùng (lấy từ token)
 * @param newLevel Level mới (phải là một giá trị của enum Level)
 */
export const updateLevelService = async (userId: string, newLevel: Level) => {
    // 1. Chuyển userId từ string (từ token) về number (cho DB)
    const numericUserId = parseInt(userId);

    try {
        const updatedUser = await prisma.users.update({
            where: { id: numericUserId },
            data: {
                level: newLevel,
            },
            select: {
                id: true,
                email: true,
                username: true,
                level: true, // Trả về level mới
            },
        });

        // --- TẠO ACCESS TOKEN MỚI VỚI LEVEL MỚI ---
        const payload = {
            userId: updatedUser.id.toString(),
            email: updatedUser.email,
            level: updatedUser.level // Level mới
        };
        const newAccessToken = generateAccessToken(payload);

        // Trả về user và token mới (Controller sẽ dùng token này để set cookie)
        return { user: updatedUser, newAccessToken };

    } catch (error) {
        // SỬ DỤNG TYPE GUARD ĐÃ ĐỊNH NGHĨA
        if (isPrismaError(error) && error.code === 'P2025') {
            throw new AppError('User not found.', 404);
        }
        throw error; // Chuyển lỗi khác sang Controller/Global Handler
    }
};

// Thêm hàm verify refresh (dùng cho refresh endpoint sau)
export const verifyRefreshService = async (refreshToken: string, userId: number) => {
    const user = await prisma.users.findUnique({ where: { id: userId }, select: { refreshToken: true } });
    if (!user || !user.refreshToken) {
        throw new AppError('Invalid refresh token', 401);
    }

    // So sánh hash
    const match = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!match) {
        throw new AppError('Invalid refresh token', 401);
    }

    // Verify signature
    try {
        jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'your_refresh_fallback_secret_key');
    } catch {
        throw new AppError('Refresh token expired or invalid', 401);
    }

    return true; // Valid
};