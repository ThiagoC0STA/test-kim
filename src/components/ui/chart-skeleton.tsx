import { Skeleton } from "./skeleton"

interface ChartSkeletonProps {
  height?: string
  showTitle?: boolean
  className?: string
}

export function ChartSkeleton({ height = "h-72", showTitle = true, className }: ChartSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {showTitle && <Skeleton className="h-5 w-32 mx-auto" />}
      
      <div className={`${height} w-full bg-white dark:bg-slate-800 rounded-lg border dark:border-slate-700 p-4`}>
        {/* Simulação de gráfico de barras */}
        <div className="flex items-end justify-between h-full space-x-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <Skeleton 
                className="w-full rounded-t" 
                style={{ 
                  height: `${Math.random() * 60 + 20}%`,
                  maxHeight: '80%'
                }} 
              />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
        
        {/* Eixo Y simulado - removido posicionamento absoluto */}
        <div className="flex justify-between mt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  )
}
