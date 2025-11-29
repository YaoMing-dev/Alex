// eduaion/backend/src/utils/AppError.ts

/**
 * Lớp lỗi tùy chỉnh cho ứng dụng.
 * Giúp chuẩn hóa các lỗi và mã HTTP status code.
 */
class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    /**
     * @param message Thông điệp lỗi
     * @param statusCode Mã HTTP status code (ví dụ: 404, 400, 401)
     */
    constructor(message: string, statusCode: number) {
        super(message); // Gọi constructor của lớp Error

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Đánh dấu đây là lỗi có thể dự đoán/xử lý

        // Giữ lại stack trace để tiện debug
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;