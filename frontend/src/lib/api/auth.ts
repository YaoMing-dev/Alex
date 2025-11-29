// frontend/src/lib/api/auth.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';

// 1. Định nghĩa các Type cơ bản (Giúp TypeScript hoạt động hiệu quả hơn)

// Loại bỏ passwordHash khỏi User an toàn
export interface SafeUser {
    id: number;
    email: string;
    username: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    created_at: Date;
    avatar: string;
    // ... Thêm các trường khác nếu cần (ví dụ: user_stats)
    user_stats?: {
        total_words_learned: number;
        quizzes_completed: number;
        writings_completed: number;
        updated_at: Date;
    } | null;
}

// Response chung từ Backend
export interface AuthResponse {
    message: string;
    user: SafeUser;
    token?: string; // Token chỉ có trong response signin/social-signin (nhưng được lưu trong cookie)
}

// 2. Hàm xử lý Response chung
// Ném lỗi nếu status không phải 2xx
const handleResponse = async (response: Response): Promise<AuthResponse> => {
    if (!response.ok) {
        // Cố gắng đọc lỗi từ body nếu có
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        // Ném ra lỗi để catchAsync của controller có thể bắt
        throw new Error(errorBody.message || 'An unknown error occurred.');
    }
    return response.json();
};

/**
 * API Đăng ký người dùng mới
 * @param email Email
 * @param username Tên người dùng
 * @param password Mật khẩu
 * @returns Thông tin người dùng mới (không có token)
 */
export const signUpApi = async (email: string, username: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
        // Không cần credentials cho Signup vì chưa có cookie
    });

    return handleResponse(response);
};

/**
 * API Đăng nhập
 * LƯU Ý QUAN TRỌNG: Backend sẽ set HTTP-Only Cookie JWT vào response.
 * @param email Email
 * @param password Mật khẩu
 * @returns Thông tin người dùng (đã xác thực)
 */
export const signInApi = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        // Bắt buộc phải thêm 'include' để nhận Cookie JWT HTTP-Only
        credentials: 'include',
    });

    return handleResponse(response);
};

/**
 * API Đăng xuất
 * Backend sẽ xóa Cookie JWT (set maxAge=0)
 * @returns Response thành công
 */
export const logoutApi = async (): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // Bắt buộc phải thêm 'include' để gửi Cookie JWT
        credentials: 'include',
    });

    // Logout không trả về user, chỉ cần kiểm tra success
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorBody.message || 'An unknown error occurred during logout.');
    }

    return response.json();
};