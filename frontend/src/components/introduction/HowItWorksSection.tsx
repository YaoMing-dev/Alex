import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Tận dụng Card component

// Định nghĩa các placeholder và hằng số cho background mới
const PLACEHOLDER_BOTTOM_MOSAIC = "/images/introduction/how-it-works-mosaic-bottom.svg";
const PLACEHOLDER_TOP_MOSAIC = "/images/introduction/how-it-works-mosaic-top.svg";
const PLACEHOLDER_PERSON_IMAGE = "/images/introduction/how-it-works-section-person.svg";

// Class animation từ globals.css
const BG_SCROLL_CLASS = "animate-scroll-right-custom"; 

// 1. CĂN CHỈNH TỶ LỆ BACKGROUND DỰA TRÊN THÔNG SỐ FIGMA
const MOSAIC_BOTTOM_HEIGHT = 'h-[750px]'; 
// 753/1183.93 * 750px ≈ 477px
const MOSAIC_TOP_HEIGHT = 'h-[477px]'; 

// 2. ĐẶT CHIỀU CAO TỐI THIỂU CHO SECTION
const SECTION_MIN_HEIGHT = 'min-h-[1024px]'; 

// Dữ liệu cho các bước
const STEPS_DATA = [
  {
    step: "Bước 1",
    title: "Đăng Ký & Chọn Level",
    description: "Nhanh chóng bắt đầu hành trình tự học với EduAion.",
  },
  {
    step: "Bước 2",
    title: "Khám Phá & Học",
    description: "Chọn chủ đề từ vựng, ôn flashcard, thử quiz, rồi luyện writing với hướng dẫn AI.",
  },
  {
    step: "Bước 3",
    title: "Tiến Bộ & Lặp Lại",
    description: "Nhận feedback chi tiết, theo dõi progress qua dashboard, và thấy band IELTS tăng dần.",
  },
];

interface StepCardProps {
    step: string;
    title: string;
    description: string;
    className?: string;
}

const StepCard = ({ step, title, description, className }: StepCardProps) => (
    <Card
        className={cn(
            // Style Card tương tự các section trước: viền đen, bóng đổ
            "bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_0_#000000] p-4 md:p-6 text-left",
            className
        )}
    >
        <CardHeader className="p-0 pb-2 space-y-1">
            <CardDescription className="text-sm font-semibold text-gray-500 font-inter">
                {step}
            </CardDescription>
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-2">
            <CardDescription className="text-base text-gray-700 font-inter leading-relaxed">
                {description}
            </CardDescription>
        </CardContent>
    </Card>
);


const HowItWorksSection = () => {
  return (
    // Section chính, dùng relative để định vị các lớp background
    <section className={`relative overflow-hidden py-24 md:py-32 bg-gray-50 ${SECTION_MIN_HEIGHT}`}>
      
      {/* LỚP NỀN CUỘN VÔ TẬN (BACKGROUND) */}
      <div className={`absolute bottom-0 left-0 right-0 ${MOSAIC_BOTTOM_HEIGHT} z-0 overflow-hidden`}>
        <div className={`absolute inset-0 flex w-[200%] flex-nowrap ${BG_SCROLL_CLASS}`}>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_BOTTOM_MOSAIC} alt="Nền họa tiết Mosaic dưới (How It Works)" fill className="object-cover" sizes="50vw"/>
          </div>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_BOTTOM_MOSAIC} alt="Nền họa tiết Mosaic dưới (How It Works) lặp" fill className="object-cover" sizes="50vw"/>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 right-20 w-[650px] h-[700px] lg:w-[700px] lg:h-[1150px] z-1 hidden lg:block">
        <Image
          src={PLACEHOLDER_PERSON_IMAGE} 
          alt="Nhân vật đại diện cho tính năng"
          fill
          className="object-contain object-bottom" 
          sizes="(max-width: 1024px) 0vw, 500px"
        />
      </div>
      
      <div className={`absolute bottom-0 left-0 right-0 ${MOSAIC_TOP_HEIGHT} z-2 overflow-hidden`}>
        <div className={`absolute inset-0 flex w-[200%] flex-nowrap ${BG_SCROLL_CLASS}`}>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_TOP_MOSAIC} alt="Nền họa tiết Mosaic trên (How It Works)" fill className="object-cover" sizes="50vw"/>
          </div>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_TOP_MOSAIC} alt="Nền họa tiết Mosaic trên (How It Works) lặp" fill className="object-cover" sizes="50vw"/>
          </div>
        </div>
      </div>

      {/* LỚP NỘI DUNG CHÍNH */}
      <div className="relative z-3 container mx-auto px-4 md:px-8">
        {/* TIÊU ĐỀ SECTION - SỬA LỖI THỤT ĐẦU DÒNG */}
        <h2 className="text-4xl md:text-5xl font-xanhmono text-gray-900 text-center whitespace-normal">
          3 Bước Đơn Giản Để Thành Thạo
        </h2>

        <div className="grid grid-cols-1 gap-1 lg:gap-1 items-start mt-12">
          <div className="space-y-10 md:space-y-12"> 
            {STEPS_DATA.map((step, index) => (
              <StepCard
                key={index}
                step={step.step}
                title={step.title}
                description={step.description}
                className={index % 2 === 0 ? "max-w-md lg:ml-0" : "max-w-md lg:ml-12"}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;