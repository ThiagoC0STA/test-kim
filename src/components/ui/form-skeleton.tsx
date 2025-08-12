import { Skeleton } from "./skeleton"

interface FormSkeletonProps {
  fields?: number
  showButtons?: boolean
  className?: string
}

export function FormSkeleton({ fields = 3, showButtons = true, className }: FormSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Campos do formulário */}
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      
      {/* Botões */}
      {showButtons && (
        <div className="flex justify-end space-x-3 pt-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
    </div>
  )
}
