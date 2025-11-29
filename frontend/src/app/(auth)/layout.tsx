// frontend/src/app/(auth)/layout.tsx
// Layout này không có Header/Footer
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Có thể đặt background hoặc cấu trúc căn giữa chung ở đây
    return (
        <div className="min-h-screen w-full flex items-center justify-center">
            {children}
        </div>
    );
}