// eduaion/backend/src/middlewares/ErrorMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

/**
 * Middleware xử lý lỗi toàn cục.
 * Luôn là middleware cuối cùng trong pipeline của Express.
 */
const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // 1. Gán giá trị mặc định nếu lỗi không phải AppError
    let error = err;
    if (!(error instanceof AppError)) {
        // Đây là lỗi lập trình hoặc lỗi 500 không mong muốn
        error = new AppError(error.message || 'Something went wrong!', 500);
    }

    // 2. Xử lý lỗi Prisma/DB đặc biệt (nếu cần, ví dụ: 404 Not Found từ findUnique/findOrFail)
    // Tạm thời bỏ qua các lỗi DB phức tạp để giữ đơn giản, nhưng đây là nơi ta sẽ xử lý chúng.

    // 3. Gửi phản hồi lỗi chuẩn hóa
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        // Chỉ hiển thị stack trace trong môi trường phát triển (DEV)
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};

export default globalErrorHandler;