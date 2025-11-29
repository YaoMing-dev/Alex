// frontend/src/app/(protected)/layout.tsx
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const HEADER_HEIGHT_PX = 72;

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            {/* padding-top để tránh Header che nội dung */}
            <main className="flex-1" style={{ paddingTop: `${HEADER_HEIGHT_PX}px` }}>
                {children}
            </main>
            <Footer />
        </div>
    );
}