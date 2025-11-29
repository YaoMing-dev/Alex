import { cn } from "@/lib/utils";
  import React from "react";

  interface DynamicMeshGradientProps {
    className?: string;
  }

  export const DynamicMeshGradient: React.FC<DynamicMeshGradientProps> = ({ className }) => {
    return (
      <div
        className={cn(
          "absolute inset-0 z-[-1] overflow-hidden pointer-events-none",
          className
        )}
      >
        {/* Điểm 1: Trung tâm */}
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] opacity-30 sm:opacity-40 dark:opacity-35"
          style={{
            background: "radial-gradient(circle at center, rgba(22, 97, 88, 0.3), transparent 80%)",
            backgroundImage: "radial-gradient(circle at center, rgba(27, 71, 93, 0.3), transparent 80%)",
            transform: "translate(-50%, -50%)",
            filter: "blur(40px)",
            animation: "mesh-breathe 6s ease-in-out infinite",
          }}
        />
        {/* Điểm 2: Góc trên trái */}
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] opacity-20 sm:opacity-30 dark:opacity-25"
          style={{
            background: "radial-gradient(circle at 20% 20%, rgba(196, 211, 210, 0.2), transparent 80%)",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(79, 157, 149, 0.2), transparent 80%)",
            filter: "blur(30px)",
            animation: "mesh-breathe 7s ease-in-out infinite 0.5s",
          }}
        />
        {/* Điểm 3: Góc dưới phải */}
        <div
          className="absolute bottom-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] opacity-20 sm:opacity-30 dark:opacity-25"
          style={{
            background: "radial-gradient(circle at 80% 80%, rgba(238, 229, 194, 0.2), transparent 80%)",
            filter: "blur(30px)",
            animation: "mesh-breathe 6.5s ease-in-out infinite 1s",
          }}
        />
        {/* Điểm 4: Góc trên phải */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] opacity-15 sm:opacity-25 dark:opacity-20"
          style={{
            background: "radial-gradient(circle at 80% 20%, rgba(245, 247, 246, 0.2), transparent 80%)",
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(42, 59, 71, 0.2), transparent 80%)",
            filter: "blur(30px)",
            animation: "mesh-breathe 7.5s ease-in-out infinite 0.3s",
          }}
        />
        {/* Điểm 5: Góc dưới trái */}
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] opacity-15 sm:opacity-25 dark:opacity-20"
          style={{
            background: "radial-gradient(circle at 20% 80%, rgba(238, 229, 194, 0.2), transparent 80%)",
            filter: "blur(30px)",
            animation: "mesh-breathe 7s ease-in-out infinite 0.7s",
          }}
        />
      </div>
    );
  };