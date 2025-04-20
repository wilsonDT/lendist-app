import { Spinner } from "./ui/spinner"
import { cn } from "../lib/utils"

interface LoadingStateProps {
  message?: string
  variant?: "fullscreen" | "contained" | "inline"
  className?: string
}

export function LoadingState({ 
  message = "Loading data...", 
  variant = "fullscreen", 
  className 
}: LoadingStateProps) {
  // Inline variant just shows spinner with optional message
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Spinner size="sm" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    )
  }

  // Container for fullscreen and contained variants
  const Container = variant === "fullscreen" 
    ? ({ children }: { children: React.ReactNode }) => (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          {children}
        </div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className={cn("flex h-full w-full items-center justify-center min-h-[200px]", className)}>
          {children}
        </div>
      )

  return (
    <Container>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Spinner size="lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
        {message && (
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </Container>
  )
} 