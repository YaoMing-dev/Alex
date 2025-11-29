// frontend\src\components\introduction\HeroSection.tsx
import Image from "next/image";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  // Tận dụng next/font/google đã được cấu hình (font-xanhmono)
  return (
    // Đặt chiều cao tối thiểu (min-h-screen) thay vì cố định (h-screen)
    // và dùng padding để tạo không gian an toàn.
    // Dùng 'relative' để các lớp nền và nội dung con có thể được định vị tuyệt đối.
    <section className="relative min-h-screen w-full text-white overflow-hidden p-4 md:p-8">
      {/* ===== LỚP NỀN (z-0 & z-10) - Không thay đổi ===== */}
      {/* Ảnh nền đầy đủ */}
      <Image
        src="/images/introduction/hero-bg.svg"
        alt="Học viên đang học tiếng Anh"
        fill
        className="object-cover z-0"
        priority // Tải ảnh này ưu tiên
      />
      {/* Lớp phủ màu tối */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* HIỆU ỨNG LỒNG CHỮ: Lớp H1 nằm giữa lớp nền (z-0, z-10) và lớp mask (z-30).
        Chỉ định vị trí của H1 ở đây. 
      */}
      {/* ===== LỚP CHỮ CHÍNH (z-20) - ĐIỀU CHỈNH VỊ TRÍ VÀ CỠ CHỮ ===== */}
      {/* Container này dùng absolute để định vị và căn giữa theo trục ngang, 
          sau đó dùng 'top' để đẩy lên trên một chút so với tâm. */}
      <div className="hidden md:block absolute top-[10%] left-8 md:left-12 z-20 flex flex-col items-start font-xanhmono">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-left leading-snug md:leading-tight [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">
          {/* Cỡ chữ được giảm xuống và căn lề trái */}
          Học Tiếng Anh Thông Minh,
          <br />
          Tiến Bộ Nhanh Chóng!
        </h1>
      </div>

      {/* ===== LỚP MASK PHÍA TRƯỚC (z-30) - Không thay đổi (Lưu ý: src nên là hero-bg-mask.png/jpg nếu là ảnh cắt) ===== */}
      {/* Ảnh mask đã xóa nền để tạo hiệu ứng chiều sâu */}
      <Image
        src="/images/introduction/hero-bg-mask.svg"
        alt="Lớp mặt nạ cho hiệu ứng chiều sâu"
        fill
        // Tùy chỉnh object-position để đảm bảo người và chữ khớp nhau
        className="object-cover object-center z-30 pointer-events-none"
      />

      {/* NỘI DUNG PHỤ: Đặt ở góc dưới bên phải.
      */}
      {/* ===== LỚP NỘI DUNG PHỤ (z-40) - ĐIỀU CHỈNH VỊ TRÍ ===== */}
      {/* Dùng 'absolute' và 'bottom-8 right-8' để cố định ở góc dưới bên phải */}
      <div className="hidden md:block absolute bottom-20 right-16 z-40 flex flex-col items-end text-right gap-4 max-w-2xl">
        {/* Văn bản mô tả tóm tắt được thay thế bằng văn bản trong ảnh */}
        <p
          // Sử dụng text-amber-100 để mô phỏng màu kem (hoặc màu đã định nghĩa trong tailwind.config.js)
          // text-shadow:0... là class được định nghĩa sẵn trong tailwind nếu có
          className="text-sm md:text-base lg:text-xl font-inter pb-8 text-amber-100/90 [text-shadow:0_0_5px_rgba(0,0,0,0.8),0_0_10px_rgba(0,0,0,0.5)]"
        >
          Khám phá từ vựng theo chủ đề, luyện IELTS writing với AI, và chinh phục band 7+ qua lộ trình cá nhân hóa
        </p>

        {/* Nút bấm */}
        <Button
          variant="edu-primary"
          className="px-12 py-6 text-lg lg:text-xl transition-transform duration-200 hover:scale-[1.05]"
        >
          Bắt Đầu Miễn Phí &gt;
        </Button>
      </div>

      {/* ===== LỚP NỘI DUNG MOBILE (z-40) - ĐIỀU CHỈNH VỊ TRÍ BUTTON ===== */}
      <div className="md:hidden relative z-40">
        <div className="min-h-screen">
          <div className="flex flex-col items-center justify-center pt-20">
            <h1 className="text-4xl text-center sm:text-5xl font-xanhmono leading-snug [text-shadow:0_4px_8px_rgba(0,0,0,0.5)]">
              Học Tiếng Anh Dễ Dàng
            </h1>
            <p className="text-md md:text-base text-white/90 font-inter mt-4">
              Khám phá lộ trình học cá nhân hóa với AI hỗ trợ
            </p>
          </div>
          <div className="absolute bottom-0 w-full flex justify-center pb-20">
            <Button variant="edu-primary" className="w-full max-w-md mx-auto rounded-full mx-4">
              Thử Ngay &gt;
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;