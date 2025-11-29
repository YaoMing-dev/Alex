// frontend/src/components/auth/AuthForm.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import React from 'react';
import { useAuth } from "@/context/AuthContext"; // Thêm để dùng hooks

interface AuthErrorResponse {
  message?: string;
}

export default function AuthForm({ type }: { type: 'signin' | 'signup' }) {
  const { login, signup } = useAuth(); // Sử dụng hooks từ context
  const router = useRouter();
  const searchParams = useSearchParams();

  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const isSignUp = type === 'signup';

  // Xử lý lỗi từ URL
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      router.replace(`/${type}`, undefined);
    }
  }, [searchParams, router, type]);

  // Implement login/signup với CSRF
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const csrfRes = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfRes.json();

      const body = isSignUp ? { email, username, password } : { email, password };
      const res = await fetch(`/api/auth/${isSignUp ? 'signup' : 'signin'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Xác thực thất bại');
      }

      const data = await res.json();
      console.log('AUTH SUCCESS, REDIRECT TO:', data.redirectTo);
      router.push(data.redirectTo); // Backend trả redirectTo
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="container relative mx-auto h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      {/* GRADIENT NỀN */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 97, 88, 0.15) 0%, rgba(196, 211, 210, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      />

      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-card/95 shadow-2xl backdrop-blur-xl border border-edu-light/50 
                      grid grid-cols-1 md:grid-cols-2 animate-fade-in-up">

        {/* BÊN TRÁI: BRANDING */}
        <div className="flex flex-col justify-center space-y-8 p-8 md:p-12 text-center md:text-left bg-gradient-to-br from-edu/10 to-edu-light/20">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/images/common/logo-header.svg"
              alt="EduAion Logo"
              width={180}
              height={60}
              className="drop-shadow-md"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-edu-dark">
              {isSignUp ? 'CHÀO MỪNG BẠN ĐẾN VỚI EDUAION' : 'CHÀO MỪNG BẠN TRỞ LẠI'}
            </h1>
            <h3 className="text-lg md:text-xl italic text-edu-dark/80">
              {isSignUp
                ? 'Bắt đầu hôm nay, thành công ngày mai'
                : 'Mỗi ngày một bài học, từng bước một thành công'
              }
            </h3>
            <p className="text-edu-dark/70 leading-relaxed max-w-md mx-auto md:mx-0">
              {isSignUp
                ? 'Cảm ơn bạn đã chọn EduAion. Tạo tài khoản để bắt đầu hành trình học tập.'
                : 'Cảm ơn bạn đã tin tưởng và gắn bó. Đăng nhập để tiếp tục học tập.'
              }
            </p>
          </div>
        </div>

        {/* BÊN PHẢI: FORM */}
        <div className="flex items-center justify-center p-8 md:p-12 bg-card">
          <div className="w-full max-w-sm space-y-6">
            <h2 className="text-3xl font-serif text-center text-card-foreground">
              {isSignUp ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Tên của bạn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 bg-input/80 text-foreground border-edu-light/50 focus:border-edu"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-input/80 text-foreground border-edu-light/50 focus:border-edu"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 bg-input/80 text-foreground border-edu-light/50 focus:border-edu"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className="text-sm font-semibold text-destructive text-center animate-shake">
                  {error}
                </p>
              )}

              <Button
                variant="edu-primary"
                type="submit"
                className="w-full rounded-full font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : (isSignUp ? 'Đăng ký' : 'Đăng nhập')}
              </Button>

              <div className="flex items-center justify-center text-muted-foreground text-sm">hoặc</div>

              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full border-edu-light/50 text-card-foreground hover:bg-edu-light/20 
                         flex items-center justify-center gap-2"
              >
                <Image src="/images/auth/logogoogle.svg" alt="Google" width={18} height={18} />
                {isSignUp ? 'Đăng ký' : 'Đăng nhập'} với Google
              </Button>

              <p className="text-center text-sm text-card-foreground">
                {isSignUp ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
                <Link
                  href={isSignUp ? '/signin' : '/signup'}
                  className="font-semibold text-edu hover:underline"
                >
                  {isSignUp ? 'Đăng nhập' : 'Đăng ký'}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}