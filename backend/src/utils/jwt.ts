// eduaion/backend/src/utils/jwt.ts

import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Level } from '@prisma/client';
dotenv.config();

// Đảm bảo SECRET_KEY được định nghĩa trong file .env
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key'; // Access token secret
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_fallback_secret_key'; // Refresh token secret riêng
const ACCESS_EXPIRES_IN = '15m'; // Ngắn hạn cho access
const REFRESH_EXPIRES_IN = '7d'; // Dài hạn cho refresh

interface TokenPayload {
    userId: string;
    email: string;
    level: Level;
}

/**
 * Tạo JSON Web Token (JWT) cho access (ngắn hạn)
 * @param payload Dữ liệu cơ bản của người dùng để đưa vào token
 * @returns Chuỗi JWT access
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_EXPIRES_IN,
    });
};

/**
 * Tạo Refresh Token (dài hạn, dùng để renew access)
 * @param payload Dữ liệu cơ bản
 * @returns Chuỗi refresh JWT
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: REFRESH_EXPIRES_IN,
    });
};