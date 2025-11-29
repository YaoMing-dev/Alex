// frontend/src/components/common/Footer.tsx
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    // Tái cấu trúc: bg-white -> bg-background (màu nền chung)
    // Tái cấu trúc: text-[#1F2F2F] -> text-foreground (màu chữ chính)
    // Tái cấu trúc: border-gray-200 -> border-border
    <footer className="bg-background text-foreground border-t border-border">
      <div className="container mx-auto px-6 lg:px-20 py-10 flex flex-col lg:flex-row justify-between gap-10">
        {/* Cột trái: Logo + Thông tin liên hệ */}
        <div className="flex-1 min-w-[280px]">
          {/* Logo và slogan */}
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/images/common/logo-header.svg"
              alt="EduAion Logo"
              width={140}
              height={40}
              className="object-contain"
            />
          </div>
          {/* Tái cấu trúc: text-[#1F2F2F] -> text-foreground */}
          <p className="text-[13px] text-foreground mb-6 opacity-80">
            ENGLISH MADE EASY, SMARTER WITH AI
          </p>

          {/* Thông tin liên hệ */}
          <ul className="space-y-3 text-[14px]">
            <li className="flex items-start gap-2">
              {/* Tái cấu trúc: text-[#166158] -> text-primary */}
              <Phone size={16} className="text-primary mt-[2px]" />
              <span>84 28 3620 5544</span>
            </li>
            <li className="flex items-start gap-2">
              {/* Tái cấu trúc: text-[#166158] -> text-primary */}
              <Mail size={16} className="text-primary mt-[2px]" />
              <span>info@eduAion.com.vn</span>
            </li>
            <li className="flex items-start gap-2">
              {/* Tái cấu trúc: text-[#166158] -> text-primary */}
              <MapPin size={16} className="text-primary mt-[2px]" />
              <span>
                45A Lê Duẩn, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh,
                Vietnam
              </span>
            </li>
          </ul>
        </div>

        {/* Cột phải: Quick Links + Support */}
        <div className="flex flex-1 justify-between min-w-[280px]">
          {/* Quick Links */}
          <div>
            {/* Tái cấu trúc: text-[#166158] -> text-primary */}
            <h3 className="font-semibold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2 text-[14px]">
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/about" className="hover:text-primary transition-colors">
                  About us
                </Link>
              </li>
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/signup" className="hover:text-primary transition-colors">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            {/* Tái cấu trúc: text-[#166158] -> text-primary */}
            <h3 className="font-semibold text-primary mb-4">Support</h3>
            <ul className="space-y-2 text-[14px]">
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/user-guide" className="hover:text-primary transition-colors">
                  User Guide
                </Link>
              </li>
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                {/* Tái cấu trúc: hover:text-[#166158] -> hover:text-primary */}
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Đường kẻ + Dòng bản quyền + Mạng xã hội */}
      {/* Tái cấu trúc: border-gray-200 -> border-border */}
      <div className="border-t border-border mt-4">
        <div className="container mx-auto px-6 lg:px-20 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Tái cấu trúc: text-[#1F2F2F] -> text-foreground */}
          <p className="text-sm text-foreground text-center sm:text-left opacity-70">
            © {new Date().getFullYear()} EduAion Education Tech Co., Ltd.
          </p>
          {/* Phần mạng xã hội (Giữ nguyên vì là ảnh) */}
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Image
                src="/images/common/facebook-icon.png"
                alt="Facebook"
                width={28}
                height={28}
              />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Image
                src="/images/common/instagram-icon.png"
                alt="Instagram"
                width={28}
                height={28}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}