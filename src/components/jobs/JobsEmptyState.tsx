import { Loader2, AlertCircle, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({
  message = 'Loading jobs...',
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

interface ErrorStateProps {
  error: Error
  onRetry: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="font-semibold text-lg mb-2">Failed to load jobs</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{error.message}</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  )
}

interface EmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-lg mb-2">
        {hasFilters ? 'No matching jobs found' : 'No jobs available'}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {hasFilters
          ? 'Try adjusting your filters to see more results.'
          : 'Check back later for new job postings.'}
      </p>
      {hasFilters && onClearFilters && (
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      )}
    </div>
  )
}
