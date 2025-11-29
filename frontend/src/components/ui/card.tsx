// frontend\src\components\ui\card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // 1. Tăng radius từ md (8px) lên lg (10px - dùng --radius)
      // 2. Đổi shadow mặc định thành shadow-lg để Card có chiều sâu hơn
      "rounded-[--radius] border border-border bg-card text-card-foreground shadow-lg",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

// CardHeader: Thêm font-bold và border-b nhẹ để phân cách header rõ ràng hơn
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Thêm border-b và màu border nhạt
    className={cn("flex flex-col space-y-1.5 p-6 border-b border-border/50", className)} 
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// CardTitle: Tăng cỡ chữ và sử dụng màu foreground đậm hơn
const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Tăng cỡ chữ, font-bold
    className={cn("text-xl font-bold leading-none tracking-tight text-foreground", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// CardDescription & CardContent & CardFooter (Giữ nguyên hoặc đã tối ưu)
const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }