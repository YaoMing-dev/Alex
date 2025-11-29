// eduaion/backend/src/middlewares/AuthMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';
import { Level } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_key';

/**
 * Middleware kiểm tra và xác thực JWT
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
    // 1. Lấy token từ header Authorization (Bearer Token)
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        // Nếu không có token từ Header VÀ Cookie, DỪNG LẠI và trả về 401
        // return res.status(401).json({ message: 'Not authorized, token missing or invalid.' });
        return next(new AppError('Not authorized, token missing or invalid.', 401));
    }

    try {
        // 2. Xác thực token
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            level: Level;
            iat: number;
            exp: number;
        };

        // 3. Đính kèm thông tin user (id, email) vào request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            level: decoded.level,
        };

        next();
    } catch (err) {
        console.error('JWT Verification Error:', err);
        // return res.status(401).json({ message: 'Not authorized, token failed.' });
        return next(new AppError('Not authorized, token failed.', 401));
    }
};