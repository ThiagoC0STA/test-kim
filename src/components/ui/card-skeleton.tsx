import { Skeleton } from "./skeleton"

interface CardSkeletonProps {
  showHeader?: boolean
  showDescription?: boolean
  contentLines?: number
  className?: string
}

export function CardSkeleton({ 
  showHeader = true, 
  showDescription = true, 
  contentLines = 3,
  className 
}: CardSkeletonProps) {
  return (
    <div className={`rounded-lg border bg-white p-6 shadow-sm dark:bg-slate-800 dark:border-slate-700 ${className}`}>
      {showHeader && (
        <div className="space-y-2 mb-4">
          <Skeleton className="h-6 w-32" />
          {showDescription && <Skeleton className="h-4 w-48" />}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: contentLines }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}
