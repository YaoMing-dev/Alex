"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function GoogleCallback() {
    const router = useRouter();
    const { refetch } = useAuth(); // Sử dụng refresh để sync sau callback (backend set cookie)

    useEffect(() => {
        const handle = async () => {
            try {
                console.log('GOOGLE CALLBACK: Refetch user...');
                await refetch();
                router.push('/dashboard');
            } catch {
                router.push('/signin?error=' + encodeURIComponent('Google login failed'));
            }
        };
        handle();
    }, [router, refetch]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <p className="text-lg">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
}