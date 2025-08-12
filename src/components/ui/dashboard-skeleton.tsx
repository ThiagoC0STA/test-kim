import { CardSkeleton } from "./card-skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-4">
        <div className="h-12 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
        <div className="h-6 w-80 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto" />
      </div>

      {/* Cards de Ação Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton 
            key={index} 
            showHeader={true} 
            showDescription={true} 
            contentLines={1} 
          />
        ))}
      </div>
    </div>
  )
}
