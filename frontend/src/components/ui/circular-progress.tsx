import { cn } from "@/lib/utils";
import React from "react";

// Dựa trên thiết kế: 10 lát cắt nhỏ, mỗi lát = 10%
const TOTAL_SEGMENTS = 10;
const CIRCUMFERENCE = 2 * Math.PI * 45; // Chu vi của vòng tròn có R=45

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number; // Tỷ lệ hoàn thành (0 - 100)
    size?: number; // Kích thước tổng thể (Mặc định: 100px)
    strokeWidth?: number; // Độ dày của viền (Mặc định: 10)
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
    ({ className, value, size = 100, strokeWidth = 10, ...props }, ref) => {
        
        // 1. Tính toán fill (cung tròn)
        const normalizedValue = Math.min(Math.max(0, value), 100);
        const strokeDashoffset = CIRCUMFERENCE - (normalizedValue / 100) * CIRCUMFERENCE;

        // 2. Tính toán Segment Gap (Khoảng cách giữa các lát cắt)
        // Chiều dài của một lát cắt (10%)
        const segmentLength = (CIRCUMFERENCE / TOTAL_SEGMENTS) * 0.9; 
        // Khoảng cách giữa các lát cắt
        const segmentGap = CIRCUMFERENCE / TOTAL_SEGMENTS - segmentLength; 
        
        // Tạo chuỗi stroke-dasharray (để tạo hiệu ứng lát cắt)
        const dashArray = `${segmentLength} ${segmentGap}`;

        return (
            <div 
                ref={ref} 
                className={cn("relative flex items-center justify-center", className)}
                style={{ width: size, height: size }}
                {...props}
            >
                {/* SVG container */}
                <svg
                    className="-rotate-90 transform"
                    viewBox="0 0 100 100"
                    style={{ width: size, height: size }}
                >
                    {/* Đường nền (Background) */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        className="stroke-muted-foreground/30" // Màu xám nhạt (như trong ảnh)
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray} // Áp dụng lát cắt cho nền
                    />

                    {/* Đường tiến trình (Foreground) */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        className="stroke-primary transition-all duration-700" // Màu xanh chủ đạo
                        strokeWidth={strokeWidth}
                        strokeDasharray={dashArray} // Áp dụng lát cắt cho tiến trình
                        strokeDashoffset={strokeDashoffset} // Lượng tiến trình đã hoàn thành
                        strokeLinecap="butt" // Đảm bảo các lát cắt không có đầu tròn
                    />
                </svg>

                {/* Text hiển thị giá trị */}
                <span className="absolute text-xl font-bold text-foreground">
                    {Math.round(normalizedValue)}%
                </span>
            </div>
        );
    }
);
CircularProgress.displayName = "CircularProgress";

export { CircularProgress };