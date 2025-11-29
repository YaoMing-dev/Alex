import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; 
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils"; 
import { Button } from "@/components/ui/button"; 

// Tái sử dụng logic Card nhưng custom lại style cho phù hợp với Features Section
interface FeatureCardProps {
  title: string;
  description: string;
  className?: string;
  href?: string;
  imageSrc: string; // Thêm prop imageSrc để truyền đường dẫn ảnh
}

// Định nghĩa các placeholder cho đường dẫn ảnh nền
const PLACEHOLDER_BOTTOM_MOSAIC = "/images/introduction/feature-mosaic-bottom.svg";
const PLACEHOLDER_TOP_MOSAIC = "/images/introduction/feature-mosaic-top.svg";
const PLACEHOLDER_PERSON_IMAGE = "/images/introduction/feature-section-person.svg";

// Class animation từ globals.css
const BG_SCROLL_CLASS_REVERSE = "animate-scroll-left-custom"; 

// Định nghĩa các hằng số cho chiều cao và kích thước nhân vật
const SECTION_MIN_HEIGHT = 'min-h-[1024px]';
const MOSAIC_BOTTOM_HEIGHT = 'h-[600px]';
const MOSAIC_TOP_HEIGHT = 'h-[468px]'; 
const PERSON_HEIGHT_CLASS = 'h-[1000px]';
const PERSON_WIDTH_CLASS = 'w-[800px]';

 const FeatureCard = ({
    title,
    description,
    className,
    href = "/practice-feature",
    imageSrc
  }: FeatureCardProps) => {
    return (
      <Link href={href} passHref>
        <Card
          className={cn(
            "w-full bg-white border-2 border-border/70 rounded-xl shadow-[6px_6px_0_0_hsl(var(--foreground))] transition-transform duration-200 hover:scale-[1.02] hover:shadow-[8px_8px_0_0_hsl(var(--foreground))] cursor-pointer text-left p-0 overflow-hidden h-fit mt-[10%]",
            className
          )}
        >
          <div className="flex flex-col md:flex-row items-stretch">
            {/* Hình ảnh: Full-width mobile, chiếm cột trái desktop */}
            <div className="relative w-full aspect-[16/9] md:w-1/2 md:aspect-[4/3]">
              <Image
                src={imageSrc}
                alt={`Minh họa ${title}`}
                fill
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            {/* Nội dung: Loại bỏ khoảng trống, co giãn tự nhiên */}
            <div className="flex-grow flex flex-col justify-between p-4 gap-2">
              <div>
                <CardTitle className="text-xl md:text-xl text-foreground font-bold font-xanhmono">{title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-inter leading-relaxed hidden md:block mt-2">{description}</CardDescription>
              </div>
              <Button
                variant="edu-ghost"
                className="text-primary border border-transparent rounded-lg h-auto p-0 text-base font-semibold justify-start"
                style={{ height: 'auto' }}
              >
                Thử ngay <ArrowRight className="w-4 h-4 ml-2 inline" />
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  };

const FEATURE_ITEMS = [
  {
    title: "Từ Vựng Theo Chủ Đề",
    description: "Hơn 5,000 từ vựng chuẩn CEFR, phân loại theo chủ đề thực tế (du lịch, công việc). Phát âm US/UK, ví dụ thực, AI gợi ý theo level.",
    href: "/vocabulary",
    imageSrc: "/images/introduction/feature-vocabulary.jpg"
  },
  {
    title: "Flashcard & Quiz Vui Nhộn",
    description: "Ôn từ vựng qua flashcard thông minh, Quiz đa dạng (điền từ, nối/ghép) giúp bạn nắm chắc kiến thức như chơi game.",
    href: "/flashcard",
    imageSrc: "/images/introduction/feature-quiz.jpg"
  },
  {
    title: "Writing Practices Với AI",
    description: "Luyện viết IELTS Task 1 & 2, nhận feedback chi tiết từ AI: điểm mạnh, điểm yếu, cách cải thiện. Band score tăng vùn vụt!",
    href: "/writing",
    imageSrc: "/images/introduction/feature-writing.jpg"
  },
];

const FeatureSection = () => {
  return (
    <section className={`relative overflow-hidden py-16 md:py-16 bg-white ${SECTION_MIN_HEIGHT} px-4 md:px-8 lg:px-12 xl:px-16`}>
      
      {/* LỚP NỀN CUỘN VÔ TẬN (BACKGROUND) */}
      <div className={`absolute bottom-0 left-0 right-0 ${MOSAIC_BOTTOM_HEIGHT} z-0 overflow-hidden`}>
        <div className={`absolute inset-0 flex w-[200%] flex-nowrap ${BG_SCROLL_CLASS_REVERSE}`}>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_BOTTOM_MOSAIC} alt="Nền họa tiết Mosaic dưới (Feature)" fill className="object-cover" sizes="50vw"/>
          </div>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_BOTTOM_MOSAIC} alt="Nền họa tiết Mosaic dưới (Feature) lặp" fill className="object-cover" sizes="50vw"/>
          </div>
        </div>
      </div>

      <div 
        className={cn(
          `absolute bottom-0 ${PERSON_WIDTH_CLASS} ${PERSON_HEIGHT_CLASS} z-1 hidden lg:block`,
          "transform" 
        )}
      >
        <Image
          src={PLACEHOLDER_PERSON_IMAGE} 
          alt="Nhân vật đại diện cho tính năng"
          fill
          className="object-contain object-bottom" 
          sizes="(max-width: 1024px) 0vw, 600px"
        />
      </div>
      
      <div className={`absolute bottom-0 left-0 right-0 ${MOSAIC_TOP_HEIGHT} z-2 overflow-hidden`}>
        <div className={`absolute inset-0 flex w-[200%] flex-nowrap ${BG_SCROLL_CLASS_REVERSE}`}>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_TOP_MOSAIC} alt="Nền họa tiết Mosaic trên (Feature)" fill className="object-cover" sizes="50vw"/>
          </div>
          <div className="w-1/2 h-full relative flex-shrink-0"> 
            <Image src={PLACEHOLDER_TOP_MOSAIC} alt="Nền họa tiết Mosaic trên (Feature) lặp" fill className="object-cover" sizes="50vw"/>
          </div>
        </div>
      </div>

      {/* LỚP NỘI DUNG CHÍNH */}
      <div className="relative z-3 container max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-xanhmono text-foreground text-center whitespace-normal">Học Hiệu Quả Với Công Cụ Của Bạn</h2>

        <div className="grid grid-cols-1 lg:grid-cols-[35%_75%] gap-1 lg:gap-1 items-start mt-12">
          <div className="flex flex-col gap-6 lg:hidden">
          </div>
          <div className="space-y-6 md:space-y-8 lg:col-span-1 lg:col-start-2">
            {FEATURE_ITEMS.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                href={feature.href}
                imageSrc={feature.imageSrc}
                className="min-h-[120px] md:min-h-[150px]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;