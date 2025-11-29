// frontend/src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// import toast from 'react-hot-toast';
import { toast } from '@/components/ui/use-toast';

interface User {
    id: number;
    email: string;
    username: string;
    level: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname(); // ← THEO DÕI ROUTE

    const fetchUser = async () => {
        try {
            console.log('🔍 [Auth] Fetching /api/user/me...');
            const res = await fetch('/api/user/me', { credentials: 'include' });
            if (!res.ok) throw new Error('Not logged in');
            const data = await res.json();
            console.log('✅ [Auth] User loaded:', data.user);
            setUser(data.user);
        } catch (err) {
            console.log('❌ [Auth] No user (logged out)');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // === RE-FETCH KHI ROUTE THAY ĐỔI HOẶC TAB FOCUS ===
    useEffect(() => {
        fetchUser();
    }, [pathname]); // ← CRITICAL: re-fetch khi đi link khác

    useEffect(() => {
        const handleFocus = () => fetchUser();
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'auth-logout') fetchUser();
        };
        window.addEventListener('focus', handleFocus);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const login = async (email: string, password: string) => {
        const csrfRes = await fetch('/api/auth/csrf');
        const { csrfToken } = await csrfRes.json();
        const res = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Login failed');
        await fetchUser();
    };

    const signup = async (email: string, username: string, password: string) => {
        const csrfRes = await fetch('/api/auth/csrf');
        const { csrfToken } = await csrfRes.json();
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken },
            body: JSON.stringify({ email, username, password }),
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Signup failed');
        await fetchUser();
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            setUser(null);

            // BROADCAST: DÙNG TIMESTAMP ĐỂ ĐẢM BẢO TAB MỚI NHẬN
            localStorage.setItem('auth-logout', Date.now().toString());
            localStorage.removeItem('auth-logout'); // Xóa ngay để tránh loop
            console.log('LOGOUT BROADCASTED');

            // ✅ Sử dụng custom toast (thay vì toast.error)
            toast({
                title: "Thành công!",
                description: "Bạn đã đăng xuất khỏi phiên làm việc.",
                variant: "default", // Hoặc variant: "info" nếu muốn dùng màu primary
            });
            router.push('/signin');

        } catch (err) {
            toast({
                title: "Lỗi đăng xuất",
                description: "Đã xảy ra lỗi trong quá trình đăng xuất. Vui lòng thử lại.",
                variant: "destructive",
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, refetch: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be inside AuthProvider');
    return context;
};