import { cn } from "@/lib/utils";
  import React from "react";

  interface AuroraGradientProps {
    className?: string;
  }

  export const AuroraGradient: React.FC<AuroraGradientProps> = ({ className }) => {
    return (
      <div
        className={cn(
          "absolute inset-0 z-[-1] overflow-hidden pointer-events-none",
          className
        )}
      >
        {/* Linear Gradient chéo */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-35"
          style={{
            background: "linear-gradient(45deg, rgba(22, 97, 88, 0.2), rgba(196, 211, 210, 0.2), rgba(238, 229, 194, 0.15))",
            backgroundImage: "linear-gradient(45deg, rgba(27, 71, 93, 0.2), rgba(79, 157, 149, 0.2), rgba(238, 229, 194, 0.15))",
            animation: "wave 12s ease-in-out infinite",
          }}
        />
        {/* Conic Gradient trung tâm */}
        <div
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] opacity-30 sm:opacity-40 dark:opacity-35"
          style={{
            background: "conic-gradient(from 0deg, rgba(22, 97, 88, 0.3), rgba(196, 211, 210, 0.3), rgba(238, 229, 194, 0.2), rgba(22, 97, 88, 0.3))",
            backgroundImage: "conic-gradient(from 0deg, rgba(27, 71, 93, 0.3), rgba(79, 157, 149, 0.3), rgba(238, 229, 194, 0.2), rgba(27, 71, 93, 0.3))",
            transform: "translate(-50%, -50%)",
            filter: "blur(50px)",
            animation: "aurora-rotate 20s linear infinite",
          }}
        />
        {/* Radial Gradient góc trên trái */}
        <div
          className="absolute top-0 left-0 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] opacity-20 sm:opacity-30 dark:opacity-25"
          style={{
            background: "radial-gradient(circle at 20% 20%, rgba(22, 97, 88, 0.2), transparent 60%)",
            backgroundImage: "radial-gradient(circle at 20% 20%, rgba(27, 71, 93, 0.2), transparent 60%)",
            filter: "blur(30px)",
          }}
        />
      </div>
    );
  };