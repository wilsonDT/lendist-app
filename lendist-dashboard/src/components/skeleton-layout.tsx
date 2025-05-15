import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div 
      className={cn(
        "bg-muted animate-pulse rounded-md",
        className
      )} 
    />
  )
}

export function LoanDetailPageSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar placeholder */}
      <div className="hidden md:block w-64 bg-background border-r border-border/40">
        <div className="p-6">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {/* Header placeholder */}
        <div className="h-16 border-b border-border/40 flex items-center px-6">
          <Skeleton className="h-6 w-32" />
        </div>
        
        {/* Main content */}
        <main className="p-6">
          {/* Back button */}
          <div className="flex items-center mb-6">
            <Skeleton className="h-9 w-24" />
          </div>
          
          {/* Summary cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border/40 rounded-lg p-6 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
                <div className="pt-3">
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Main content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="border border-border/40 rounded-lg p-6 space-y-4">
                <Skeleton className="h-5 w-1/2 mb-4" />
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
            
            {/* Tabs content */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                <div className="flex space-x-1">
                  <Skeleton className="h-10 w-32 rounded-md" />
                  <Skeleton className="h-10 w-32 rounded-md" />
                </div>
                <div className="border border-border/40 rounded-lg p-6 space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <div className="space-y-3 pt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="grid grid-cols-4 gap-4">
                        <Skeleton className="h-6" />
                        <Skeleton className="h-6" />
                        <Skeleton className="h-6" />
                        <Skeleton className="h-6" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 