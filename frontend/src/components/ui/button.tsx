// frontend/src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[16px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Mặc định của Shadcn/UI (giữ nguyên để không phá vỡ UI)
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // Custom variants for EduAion - ĐÃ TÁI CẤU TRÚC
        "edu-primary":
          // bg-edu (Tailwind tự xử lý DEFAULT) + hover:bg-edu/90
          "bg-edu text-edu-foreground rounded-lg px-8 py-3 shadow-md hover:bg-edu/90",

        "edu-outline":
          // border-edu + text-edu + hover:bg-edu-light
          "border border-edu text-edu bg-transparent rounded-lg px-8 py-3 hover:bg-edu-light transition-colors",

        "edu-ghost":
          // text-edu + hover:bg-edu-light
          "text-edu hover:bg-edu-light rounded-lg px-4 py-3 transition-colors",

        "edu-light":
          // bg-edu-light + text-edu + hover:bg-edu-light/80
          "bg-edu-light text-edu rounded-lg px-6 py-3 hover:bg-edu-light/80 transition-colors",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
