import Link from "next/link";
import { Button } from "@/components/ui/button"; // Giả định bạn có Button component cho style chung
import { cn } from "@/lib/utils";

const CTASection = () => {
  return (
    // Section với padding dọc lớn và màu nền trắng (hoặc màu sáng)
    <section className="h-[1024px] py-24 md:py-36 bg-white text-center flex justify-center items-center">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        
        {/* TIÊU ĐỀ CTA */}
        {/* Font Xanh Mono, kích thước lớn */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-xanhmono text-gray-900 leading-tight mb-8">
          Sẵn Sàng Nâng Tầm Tiếng Anh Của Bạn?
        </h2>

        {/* MÔ TẢ NGẮN */}
        {/* Font Inter, kích thước lớn hơn bình thường */}
        <p className="text-lg md:text-xl text-gray-700 font-inter mb-10 md:mb-12 max-w-2xl mx-auto">
          Đăng ký miễn phí hôm nay để truy cập đầy đủ tính năng
          <br />
          Không cam kết, chỉ có tiến bộ!
        </p>

        {/* NÚT BẤM CTA */}
        {/* Sử dụng style nút đã thống nhất (màu xanh đậm, hiệu ứng bóng đổ) */}
        <Link href="/signup" passHref>
          <Button
            size="lg" // Tăng kích thước nút
            className={cn(
                "bg-[#166158] hover:bg-[#125048] text-white font-semibold text-base md:text-lg rounded-lg h-12 md:h-14 px-8", // Style chung
                "border-2 border-black shadow-[4px_4px_0_0_#000000] transition-all duration-200 hover:shadow-[6px_6px_0_0_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px]" // Style hiệu ứng bóng đổ/viền
            )}
          >
            Bắt đầu hành trình
          </Button>
        </Link>

      </div>
    </section>
  );
};

export default CTASection;