"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Bell, Menu, LogOut, User, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAuthenticated = user !== null;
  const userName = user?.username || "Người dùng";
  const userAvatar = user?.avatar || "";

  return (
    <header className="w-full h-[72px] bg-background shadow-sm flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 fixed top-0 left-0 z-50 overflow-visible border-b border-border">
      {/* Logo */}
      <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center shrink-0">
        <Image
          src="/images/common/logo-header.svg"
          alt="Logo EduAion"
          width={150}
          height={40}
          className="object-contain"
        />
      </Link>

      {/* Menu giữa */}
      <nav className="hidden lg:flex items-center gap-6 xl:gap-10">
        {isAuthenticated ? (
          <>
            <NavItem href="/dashboard" label="Trang chủ" />
            <NavItem href="/vocabulary" label="Từ vựng" />
            <NavItem href="/flashcard" label="Thẻ ghi nhớ" />
            <NavItem href="/quiz" label="Trắc nghiệm" />
            <NavItem href="/writing" label="Luyện viết" />
          </>
        ) : (
          <>
            <NavItem href="/introduction" label="Giới thiệu" />
            <NavItem href="/about" label="Về chúng tôi" />
          </>
        )}
      </nav>

      {/* Khu vực phải */}
      <div className="hidden lg:flex items-center gap-4">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-edu-primary" />
        ) : isAuthenticated ? (
          <>
            <button aria-label="Thông báo" className="bg-muted rounded-xl p-2 hover:bg-accent transition">
              <Bell size={18} className="text-muted-foreground" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
                {userAvatar ? (
                  <div className="w-[38px] h-[38px] rounded-full overflow-hidden border border-border">
                    <Image
                      src={userAvatar}
                      alt="Ảnh đại diện người dùng"
                      width={38}
                      height={38}
                      className="w-full h-full object-cover"
                      key={userAvatar}
                    />
                  </div>
                ) : (
                  <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                    <User size={20} />
                  </div>
                )}
                <span className="font-semibold text-[15px] text-foreground font-inter">
                  {userName}
                </span>
                <ChevronDown size={20} className="text-muted-foreground" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48 mt-2 rounded-lg border border-border shadow-lg">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User size={16} /> Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings size={16} /> Cài đặt
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <button className="flex items-center gap-2 text-destructive w-full" onClick={logout}>
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button variant="edu-outline">Dùng thử</Button>
            <Link href="/signin">
              <Button variant="edu-primary">Đăng nhập</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu */}
      <button
        className="lg:hidden flex items-center justify-center p-2 rounded-lg hover:bg-accent"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Menu size={22} className="text-foreground" />
      </button>

      {isMenuOpen && (
        <div className="absolute top-[72px] left-0 w-full bg-background border-t border-border shadow-md flex flex-col px-8 py-4 gap-4 lg:hidden">
          {isAuthenticated ? (
            <>
              <NavItem href="/dashboard" label="Trang chủ" mobile />
              <NavItem href="/vocabulary" label="Từ vựng" mobile />
              <NavItem href="/flashcard" label="Thẻ ghi nhớ" mobile />
              <NavItem href="/quiz" label="Trắc nghiệm" mobile />
              <NavItem href="/writing" label="Luyện viết" mobile />
              <button className="w-full text-destructive text-left font-semibold py-2" onClick={logout}>
                <LogOut size={16} className="inline mr-2" /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavItem href="/introduction" label="Giới thiệu" mobile />
              <NavItem href="/about" label="Về chúng tôi" mobile />
              <Button variant="edu-outline" className="w-full">Dùng thử</Button>
              <Button variant="edu-primary" className="w-full">Đăng nhập</Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  mobile?: boolean;
}

function NavItem({ href, label, mobile = false }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`font-semibold text-[15px] text-foreground no-underline hover:text-primary hover:underline underline-offset-4 transition ${mobile ? "block w-full py-2" : ""
        }`}
    >
      {label}
    </Link>
  );
}