import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils"; 

interface AICardProps {
  title: string;
  description: string;
  className?: string;
  href?: string;
}

const AICard = ({
  title,
  description,
  className,
  href = "/writing",
}: AICardProps) => {
  return (
    <Link href={href} passHref>
      <Card
        className={cn(
          // Thêm w-full để Card mở rộng
          "w-full bg-white border-2 border-black rounded-xl shadow-[6px_6px_0_0_#000000] transition-transform duration-200 hover:scale-[1.02] hover:shadow-[8px_8px_0_0_#000000] cursor-pointer mt-10",
          className
        )}
      >
        <CardHeader className="p-4 md:p-5 pb-1">
          {/* Tăng cỡ chữ Title */}
          <CardTitle className="text-xl md:text-3xl text-[#166158] font-semibold flex justify-between items-center">
            {title}
            <ArrowRight className="w-6 h-6 transition-transform duration-200" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-5 pt-0">
          {/* Tăng cỡ chữ Description */}
          <CardDescription className="text-base text-gray-700 font-inter leading-relaxed">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AICard;