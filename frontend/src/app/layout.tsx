// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "../styles/globals.css";
import { Inter, Xanh_Mono, Instrument_Sans } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-value",
  weight: ["400", "700"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrumentsans-value",
  weight: ["400", "500", "700"],
});

const xanhMono = Xanh_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-xanhmono-value",
});

export const metadata: Metadata = {
  title: "EduAion - Học Tiếng Anh Với AI",
  description: "Nền tảng học tiếng Anh thông minh sử dụng AI để hỗ trợ học tập hiệu quả.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${instrumentSans.variable} ${xanhMono.variable}`}>
      <body className={cn("min-h-screen bg-transparent text-foreground font-sans antialiased flex flex-col", inter.className)}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}