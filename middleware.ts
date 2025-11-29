// // frontend/src/middleware.ts
// import { NextRequest, NextResponse } from 'next/server';

// // Khai báo các biến Public URL
// const PUBLIC_FILE = /\.(.*)$/; // Cho phép truy cập file tĩnh

// // URLs Backend của bạn
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// // Hàm kiểm tra trạng thái Auth (gọi Backend)
// async function checkAuthStatus(request: NextRequest): Promise<{ isAuthenticated: boolean; isProfileComplete: boolean; }> {
//     // Lấy token từ cookie của request Next.js (cần tên cookie chính xác)
//     const token = request.cookies.get('jwt')?.value;

//     if (!token) {
//         return { isAuthenticated: false, isProfileComplete: false };
//     }

//     // Gọi API Backend để xác thực token và lấy thông tin user
//     try {
//         const response = await fetch(`${BACKEND_URL}/api/user/me`, {
//             method: 'GET',
//             headers: {
//                 // Chuyển cookie sang header Authorization để Backend dễ đọc hơn, 
//                 // hoặc sử dụng 'Cookie' header nếu Backend của bạn yêu cầu.
//                 'Cookie': `jwt=${token}`,
//             },
//             // credentials: 'include' KHÔNG HỖ TRỢ trong Next.js Middleware.
//         });

//         if (response.ok) {
//             const data = await response.json();
//             const user = data.user;
//             // Kiểm tra trạng thái Onboarding
//             const isProfileComplete = !!user.level;
//             return { isAuthenticated: true, isProfileComplete };
//         }
//     } catch (error) {
//         // Log lỗi (tùy chọn)
//         console.error("Middleware Auth Check failed:", error);
//     }

//     return { isAuthenticated: false, isProfileComplete: false };
// }

// export async function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;

//     // 1. BỎ QUA các đường dẫn Auth, API, file tĩnh và các route công khai
//     if (
//         pathname.startsWith('/api') || // Các API routes của Next.js (nếu có)
//         pathname.startsWith('/_next') ||
//         pathname.startsWith('/static') ||
//         pathname.startsWith('/favicon.ico') ||
//         // pathname.startsWith('/signin') ||
//         // pathname.startsWith('/signup') ||
//         PUBLIC_FILE.test(pathname)
//     ) {
//         return NextResponse.next();
//     }

//     // ⚠️ CHỈ DÙNG checkAuthStatus() để bảo vệ route
//     const { isAuthenticated } = await checkAuthStatus(request); // Chỉ cần isAuthenticated

//     // Khai báo rõ các Auth Path
//     const AUTH_PATHS = ['/signin', '/signup'];

//     // 2. Xử lý người dùng CHƯA XÁC THỰC
//     if (!isAuthenticated) {
//         // Cho phép truy cập Auth Paths
//         if (AUTH_PATHS.includes(pathname)) {
//             return NextResponse.next();
//         }

//         // Chuyển hướng route bảo vệ về /signin
//         const signInUrl = new URL('/signin', request.url);
//         return NextResponse.redirect(signInUrl);
//     }

//     // 3. Xử lý người dùng ĐÃ XÁC THỰC

//     // Nếu đã xác thực và cố truy cập /signin hoặc /signup
//     if (AUTH_PATHS.includes(pathname)) {
//         const dashboardUrl = new URL('/dashboard', request.url);
//         return NextResponse.redirect(dashboardUrl);
//     }

//     // ⚠️ LOẠI BỎ logic Onboarding ở đây. Onboarding sẽ được xử lý ở Client-Side.

//     // Cho phép tiếp tục truy cập
//     return NextResponse.next();
// }

// // Cấu hình Middleware chạy trên các route cụ thể (tối ưu hiệu suất)
// export const config = {
//     // Chạy trên tất cả các route trừ những route đã loại trừ thủ công bên trên
//     // Nếu bạn muốn chi tiết hơn, bạn có thể chỉ định các route bảo vệ:
//     // matcher: ['/dashboard/:path*', '/settings/:path*', '/onboarding']
//     matcher: [
//         /*
//          * Match tất cả các path trừ:
//          * 1. API routes
//          * 2. Assets (._next, .vercel, v.v.)
//          * 3. Files (.:ext)
//          */
//         '/((?!api|_next/static|_next/image|images|favicon.ico|logogoogle.svg).*)',
//     ],
// };