import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import AppError from '../utils/AppError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import {
    SALT_ROUNDS,
    signUpService,
    signInService,
    updateLevelService,
    verifyRefreshService
} from '../services/AuthService';
import { Level, Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { text } from 'stream/consumers';
import FlashcardService from '../services/FlashcardService';

// --- COOKIE OPTIONS GLOBAL (Dùng chung để consistent flags) ---
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // True ở prod cho HTTPS
    sameSite: 'strict' as const, // Strict để chống CSRF full
    path: '/', // Toàn domain
};

// --- GOOGLE OAUTH CLIENT ---
const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// --- HELPER: GỬI RESPONSE + SET COOKIE ---
const sendAuthResponse = (user: any, accessToken: string, refreshToken: string, statusCode: number, res: Response, redirectUrl: string = '/dashboard') => {
    res.cookie('jwt', accessToken, {
        ...cookieOptions,
        maxAge: 120 * 60 * 1000, // 2h cho access
    });

    res.cookie('refreshJwt', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d cho refresh
    });

    res.status(statusCode).json({
        status: 'success',
        message: statusCode === 201 ? 'User registered and logged in.' : 'Login successful.',
        user,
        redirectTo: `http://localhost:3000${redirectUrl}`
    });
};

// --- SIGN UP ---
export const signUpController = async (req: Request, res: Response, next: NextFunction) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
        return next(new AppError('Missing required fields: email, username, or password.', 400));
    }

    const { user, accessToken, refreshToken } = await signUpService(email, username, password);
    sendAuthResponse(user, accessToken, refreshToken, 201, res, '/onboarding');
};

// --- SIGN IN ---
export const signInController = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Missing required fields: email or password.', 400));
    }

    const { user, accessToken, refreshToken } = await signInService(email, password);
    const redirectTo = user.username && user.level && user.avatar ? '/dashboard' : '/onboarding';
    sendAuthResponse(user, accessToken, refreshToken, 200, res, redirectTo);
};

// --- GOOGLE AUTH: BẮT ĐẦU OAUTH ---
export const googleAuth = async (req: Request, res: Response) => {
    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
        ],
        prompt: 'consent'
    });
    res.redirect(authUrl);
};

// --- GOOGLE CALLBACK: XỬ LÝ LOGIN / REGISTER ---
export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.query;

    if (!code) {
        return next(new AppError('Missing authorization code', 400));
    }

    try {
        // 1. Trao đổi code lấy token
        const { tokens } = await client.getToken(code as string);
        client.setCredentials(tokens);

        // 2. Xác minh token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token!,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload?.email || !payload.email_verified) {
            return next(new AppError('Google account not verified', 400));
        }

        const { email, name, picture } = payload;

        // 3. Tìm user
        let user = await prisma.users.findUnique({
            where: { email },
            include: { user_stats: true }
        });

        if (user) {
            if (!user.provider || user.provider === 'local') {
                user = await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        provider: 'google',
                        avatar: picture || user.avatar,
                        isVerified: true
                    },
                    include: { user_stats: true }
                });
            }
        } else {
            // 4. Tạo user mới atomic
            user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const createdUser = await tx.users.create({
                    data: {
                        email,
                        username: name || email.split('@')[0],
                        provider: 'google',
                        avatar: picture,
                        isVerified: true,
                        level: Level.Beginner,
                    },
                    include: { user_stats: true }
                });
                await tx.userStats.create({
                    data: { user_id: createdUser.id },
                });

                return createdUser;
            });

            // Tạo flashcard set mặc định cho user mới (Google OAuth)
            FlashcardService.createDefaultFlashcardSet(user.id).catch((err) => {
                console.error('Failed to create default flashcard set for Google user:', err);
            });
        }

        if (!user) {
            return next(new AppError('Failed to create or retrieve user', 500));
        }

        // 5. TẠO JWT + SET COOKIE
        const tokenPayload = {
            userId: user.id.toString(),
            email: user.email,
            level: user.level,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Hash và lưu refresh
        const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
        await prisma.users.update({
            where: { id: user.id },
            data: { refreshToken: hashedRefresh },
        });

        // Set cookies với consistent options
        res.cookie('jwt', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15m cho access
        });
        res.cookie('refreshJwt', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7d cho refresh
        });

        // 6. REDIRECT VỀ FRONTEND CALLBACK + MANG THEO QUERY PARAMS
        const frontendCallback = `http://localhost:3000/auth/callback${req.originalUrl.split('?')[1] ? '?' + req.originalUrl.split('?')[1] : ''}`;
        res.redirect(frontendCallback);

    } catch (error: any) {
        console.error('Google OAuth Error:', error);
        const errorParam = encodeURIComponent('Google login failed');
        res.redirect(`http://localhost:3000/signin?error=${errorParam}`);
    }
};

// --- UPDATE LEVEL ---
export const updateLevelController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    const { level } = req.body;

    if (!userId) return next(new AppError('User not authenticated.', 401));
    if (!level || !Object.values(Level).includes(level as Level)) {
        return next(new AppError('Invalid level provided.', 400));
    }

    const updatedUser = await updateLevelService(userId, level as Level);
    res.status(200).json({
        message: 'User level updated.',
        user: updatedUser
    });
};

// --- REFRESH TOKEN ---
export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshJwt;
    if (!refreshToken) {
        return next(new AppError('No refresh token provided', 401));
    }

    try {
        // Decode để lấy userId (không verify đầy đủ ở đây)
        const decoded = jwt.decode(refreshToken) as { userId: string };
        if (!decoded?.userId) {
            return next(new AppError('Invalid refresh token', 401));
        }

        const userId = parseInt(decoded.userId);

        // Verify từ service (check hash DB + signature)
        await verifyRefreshService(refreshToken, userId);

        // Generate new access
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { email: true, level: true }
        });
        if (!user) {
            return next(new AppError('User not found', 404));
        }

        const payload = {
            userId: userId.toString(),
            email: user.email,
            level: user.level,
        };
        const newAccessToken = generateAccessToken(payload);

        // Set new access cookie với consistent options
        res.cookie('jwt', newAccessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15m
        });

        res.status(200).json({ status: 'success', message: 'Token refreshed' });
    } catch (err) {
        return next(new AppError('Refresh failed', 401));
    }
};

// --- LOGOUT ---
export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshJwt;
    if (refreshToken) {
        // Decode để lấy userId
        const decoded = jwt.decode(refreshToken) as { userId: string };
        if (decoded?.userId) {
            await prisma.users.update({
                where: { id: parseInt(decoded.userId) },
                data: { refreshToken: null },
            });
        }
    }

    // Clear cookies với consistent options
    res.cookie('jwt', '', { ...cookieOptions, expires: new Date(0), maxAge: 0 });
    res.cookie('refreshJwt', '', { ...cookieOptions, expires: new Date(0), maxAge: 0 });
    localStorage.setItem('auth-logout', Date.now().toString());
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
};

// --- CSRF TOKEN (cho frontend lấy nếu cần) ---
export const csrfController = (req: Request, res: Response) => {
    res.status(200).json({ csrfToken: req.csrfToken() });
};