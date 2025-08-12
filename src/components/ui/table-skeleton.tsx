import { Skeleton } from "./skeleton"

interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={className}>
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 py-3 px-4">
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 py-3 px-4">
                <Skeleton className="h-4 w-full max-w-[120px]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
