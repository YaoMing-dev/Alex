import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Thêm cấu hình images
  images: {
    // Thêm danh sách các tên miền bên ngoài (hostnames) được phép
    domains: [
      // Giữ lại các domains khác nếu có
      "www.ielts-mentor.com", // <--- THÊM DOMAIN NÀY
      "lh3.googleusercontent.com",
      "api.dicebear.com", // Avatar placeholder service
    ],
    remotePatterns: [
      {
        protocol: 'https',
        // Tên miền Cloudinary của bạn phải ở đây. Ví dụ:
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**'
      },
      // Nếu bạn dùng tên miền tùy chỉnh, hãy thêm vào đây
      // ...
    ],
    unoptimized: false, // Keep optimization but allow fallback
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Thêm cấu hình rewrites
  async rewrites() {
    return [
      {
        // Bắt bất kỳ thứ gì sau /api/
        source: '/api/:path*',
        // Chuyển hướng nó đến Backend
        destination: 'http://localhost:4001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
