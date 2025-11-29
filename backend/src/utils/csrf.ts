import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

// 1. Khởi tạo CSRF Protection Middleware
// Đảm bảo csurf được cấu hình để đọc token từ cookie và header 'x-csrf-token'
// Cookies được dùng cho CSRF KHÔNG phải là HTTP-only để JS có thể đọc (token là secret).
// Tuy nhiên, chúng ta đang dùng cookie HTTP-only cho JWT, và csurf mặc định 
// sẽ dùng cookie HTTP-only cho secret. Frontend phải lấy token từ req.csrfToken()
// qua endpoint GET /csrf. Cấu hình hiện tại là đúng.
export const csrfProtection = csurf({
    cookie: true
});

// 2. CSRF Error Handler Middleware
// Middleware này phải được chạy SAU csrfProtection và chỉ bắt lỗi của csurf
export const csrfErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // CHỈ BẮT LỖI TỪ CSURF
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(400).json({ // Dùng 400 (Bad Request) thay vì 403 cho lỗi token
            status: 'fail',
            message: 'Invalid or missing CSRF token (Code 400).',
        });
    }
    next(err);
};

// 3. Middlewares để áp dụng CSRF cho POST/PUT/DELETE
// Kết hợp cả 2: Protection (để tạo và validate token) + Error Handler (để bắt lỗi)
export const csrfMiddleware = [
    csrfProtection,
    csrfErrorHandler,
];