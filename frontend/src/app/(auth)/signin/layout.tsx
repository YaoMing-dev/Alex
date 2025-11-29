// frontend/src/app/signin/layout.tsx
import { Metadata } from "next";
import { AuroraGradient } from "@/components/common/AuroraGradient";

export const metadata: Metadata = {
  title: "EduAion - Đăng Nhập",
  description: "Đăng nhập để tiếp tục học tiếng Anh với AI trên EduAion.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="no-header">
      <AuroraGradient />

      <div
        className="relative z-10 min-h-screen flex items-center justify-center p-8 bg-transparent"
      >
        {children}
      </div>
    </div>
  );
}
