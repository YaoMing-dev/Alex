// frontend\src\components\ui\input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Tái cấu trúc màu:
                    // border-gray-300 -> border-input (màu chuẩn của input/border)
                    // bg-white -> bg-background
                    // placeholder:text-gray-500 -> placeholder:text-muted-foreground
                    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",

                    // Tái cấu trúc focus ring: 
                    // focus-visible:ring-edu-primary -> focus-visible:ring-ring (nên dùng ring chuẩn đã được gán là primary)
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

                    "shadow-sm transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
