// frontend/src/app/(full_screen)/layout.tsx
// Layout này không có Header/Footer, lý tưởng cho trải nghiệm học tập toàn màn hình
export default function FullScreenLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full">
            {children}
        </div>
    );
}