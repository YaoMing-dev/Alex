// frontend/src/lib/api/axiosInstance.ts

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
console.log('AXIOS_CONFIG: BASE_URL set to', BASE_URL);

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    // Rất quan trọng: cho phép gửi cookies (như JWT hoặc CSRF token)
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR TỰ ĐỘNG THÊM CSRF TOKEN CHO CÁC REQUEST KHÔNG AN TOÀN ---

axiosInstance.interceptors.request.use(
    async (config) => {
        // Kiểm tra URL trước khi chỉnh sửa
        const requestURL = axios.getUri(config);
        console.log(`AXIOS_INTERCEPTOR: Starting request [${config.method?.toUpperCase()}] to path: ${config.url}`); // <-- LOG 2

        // Kiểm tra nếu là các phương thức cần CSRF protection (POST, PUT, DELETE)
        if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
            console.log('AXIOS_INTERCEPTOR: Method is POST/PUT/DELETE. Checking CSRF token...');
            // 1. Cố gắng lấy CSRF token từ cookie do Backend đặt (tên mặc định của csurf là _csrf)
            // Tuy nhiên, csurf đặt secret token này là HTTP-only, nên Frontend không thể đọc.
            // Phương pháp đúng là: Lấy token từ endpoint GET /csrf (Frontend đã làm ở AuthContext)

            // 2. Lấy token từ backend endpoint GET /csrf
            try {
                // Tránh gọi CSRF endpoint nếu request hiện tại đã là request lấy token
                if (config.url && !config.url.endsWith('/auth/csrf')) {

                    // Gọi API lấy token từ Backend. 
                    console.log('AXIOS_INTERCEPTOR: Fetching new CSRF token...');
                    const csrfRes = await axios.get(`${BASE_URL}/api/auth/csrf`, { withCredentials: true });
                    const { csrfToken } = csrfRes.data;

                    // Đính kèm token vào header theo yêu cầu của Backend
                    config.headers['X-CSRF-Token'] = csrfToken;
                    config.headers['x-csrf-token'] = csrfToken; // Đảm bảo cả hai dạng đều được gửi
                    console.log('AXIOS_INTERCEPTOR: CSRF Token attached successfully.');
                }
            } catch (error) {
                console.error("Failed to fetch CSRF token:", error);
                // Ném lỗi để chặn request không an toàn
                return Promise.reject(new Error("CSRF token acquisition failed."));
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;