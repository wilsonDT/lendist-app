import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-background border-t-primary",
          {
            "h-4 w-4": size === "sm",
            "h-8 w-8": size === "md",
            "h-12 w-12": size === "lg",
          }
        )}
      />
    </div>
  )
} 