// frontend/src/app/signup/layout.tsx
import { Metadata } from "next";
import { AuroraGradient } from "@/components/common/AuroraGradient";

export const metadata: Metadata = {
  title: "EduAion - Đăng Ký Tài Khoản",
  description: "Tạo tài khoản để bắt đầu học tiếng Anh với AI trên EduAion.",
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="no-header">
      {/* 2. Component Gradient làm nền */}
      <AuroraGradient />

      <div
        // 3. Đặt các class min-h-screen, flex, items-center, justify-center
        className="relative z-10 min-h-screen flex items-center justify-center p-8 bg-transparent"
      >
        {children}
      </div>
    </div>
  );
}

