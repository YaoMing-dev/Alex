// eduaion/backend/src/app.ts

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './middlewares/ErrorMiddleware';
import AppError from './utils/AppError';
import { csrfController } from './controllers/AuthController';
import { csrfMiddleware } from './utils/csrf';
import AuthRoute from './routes/AuthRoute';
import FlashcardRoute from './routes/FlashcardRoute';
import QuizRoute from './routes/QuizRoute';

dotenv.config();

const app = express();
const port = process.env.PORT || 4001;

// Cấu hình CORS - Cho phép frontend
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
];

app.use(cors({
    origin: function (origin, callback) {
        // Cho phép requests không có origin (như Postman, mobile apps)
        if (!origin) return callback(null, true);
        
        // Kiểm tra origin có trong whitelist không
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // Trong development, log ra để debug
            console.log('CORS blocked origin:', origin);
            callback(null, true); // Tạm thời vẫn cho phép trong development
        }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'x-csrf-token'],
    exposedHeaders: ['Set-Cookie']
}));

// Middleware cần thiết
app.use(express.json()); // Cho phép Express đọc JSON body từ request
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(csurf({ cookie: true })); // Cookie-based CSRF, secret lưu ở cookie '_csrf'
// Rate limiter cho auth routes (chống brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 10, // Giới hạn 10 req/IP
    message: 'Too many requests from this IP, please try again after 15 minutes',
    // @ts-ignore - Suppress TS error vì @types chưa hỗ trợ 'standardHeaders'
    legacyHeaders: false,
});

// --- TÁCH ROUTE LẤY CSRF KHỎI LIMITER ---
// Endpoint này cần được gọi thường xuyên bởi frontend, KHÔNG nên bị giới hạn.
// Tuy nhiên, nó vẫn cần CSRF Protection để thiết lập cookie csurf.
app.get('/api/auth/csrf', csrfMiddleware, csrfController);

// Định nghĩa các Route API - FLASHCARD & QUIZ SYSTEM ONLY
app.use('/api/auth', authLimiter, AuthRoute); // Apply limiter chỉ cho auth
app.use('/api/flashcards', FlashcardRoute);
app.use('/api/quiz', QuizRoute);

// 1. GLOBAL ERROR HANDLER- BẮT BUỘC PHẢI Ở ĐÂY (TRƯỚC 404)
// Khi một lỗi được next() (ví dụ: lỗi 401 từ protect), nó sẽ nhảy vào đây
app.use(globalErrorHandler);

// 2. Xử lý Route không tìm thấy (404 Not Found) - BẮT BUỘC PHẢI Ở CUỐI CÙNG
// Chỉ chạy khi không có route nào khớp VÀ KHÔNG có lỗi nào được next()
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Khởi động server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});