import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { JobFilters } from './JobFilters'
import type { HNThread, JobFilters as JobFiltersType } from '@/types/hn'
import { PROVIDERS, type JobProviderId } from '@/types/providers'
import { useRouteView } from '@/hooks/useRouteView'

interface JobsHeaderProps {
  thread: HNThread | null
  jobCount: number
  loading: boolean
  onRefresh: () => void
  filters: JobFiltersType
  onFiltersChange: (filters: JobFiltersType) => void
  hasActiveFilters: boolean
  providerId: JobProviderId
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function JobsHeader({
  thread,
  jobCount,
  loading,
  onRefresh,
  filters,
  onFiltersChange,
  hasActiveFilters,
  providerId,
}: JobsHeaderProps) {
  const { setView } = useRouteView()
  const provider = PROVIDERS[providerId]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-card border-b border-border">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left side: Back + Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setView('portfolio')}
              aria-label="Back to Portfolio"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-foreground">
                {provider.name} Jobs
              </h1>
              {thread && (
                <>
                  {providerId === 'hn' && (
                    <>
                      <span className="text-muted-foreground hidden sm:inline">
                        ·
                      </span>
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {formatDate(thread.postedAt)}
                      </span>
                    </>
                  )}
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">
                    {jobCount}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right side: Filters + Refresh + HN Link */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Filters Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={hasActiveFilters ? 'default' : 'ghost'}
                  size="icon"
                  className="relative"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-accent rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full sm:max-w-md overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <JobFilters
                    filters={filters}
                    onChange={onFiltersChange}
                    layout="vertical"
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh jobs"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>

            {thread && providerId === 'hn' && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                aria-label="View on Hacker News"
              >
                <a
                  href={`https://news.ycombinator.com/item?id=${thread.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
