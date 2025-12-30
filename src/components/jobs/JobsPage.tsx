import { useState, useMemo, useEffect, useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useJobProvider } from '@/hooks/useJobProvider'
import { JobsHeader } from './JobsHeader'
import { JobCard } from './JobCard'
import { LoadingState, ErrorState, EmptyState } from './JobsEmptyState'
import type { JobFilters as JobFiltersType } from '@/types/hn'
import {
  getRegionFromCountry,
  calculateWeightedScore,
  matchesLocationFilter,
} from '@/lib/skillMatcher'
import { userLocation } from '@/config/loader'

const DEFAULT_FILTERS: JobFiltersType = {
  minMatchScore: 0,
  sortBy: 'match',
  searchQuery: '',
  location: 'any-eu',
  temperature: 0.4,
  provider: 'hn',
  providerOptions: { arbeitnow: { remoteOnly: true } },
}

const FILTERS_STORAGE_KEY = 'hn-jobs-filters'

function getStoredFilters(): JobFiltersType | null {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Validate the parsed object has expected properties with correct types
    const validLocations = [
      'all',
      'remote-global',
      'remote-eu',
      'onsite-eu',
      'any-eu',
    ]
    const validProviders = ['hn', 'arbeitnow', 'remoteok', 'jobicy', 'remotive']
    if (
      typeof parsed.minMatchScore === 'number' &&
      (parsed.sortBy === 'match' || parsed.sortBy === 'recent') &&
      typeof parsed.searchQuery === 'string' &&
      validLocations.includes(parsed.location) &&
      typeof parsed.temperature === 'number'
    ) {
      // Add provider defaults if not present (migration from old format)
      if (!validProviders.includes(parsed.provider)) {
        parsed.provider = 'hn'
      }
      if (!parsed.providerOptions) {
        parsed.providerOptions = { arbeitnow: { remoteOnly: true } }
      }
      return parsed as JobFiltersType
    }

    return null
  } catch (error) {
    console.warn('Failed to load stored job filters:', error)
    return null
  }
}

function storeFilters(filters: JobFiltersType): void {
  try {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
  } catch (error) {
    console.warn('Failed to persist job filters:', error)
  }
}

export function JobsPage() {
  const [filters, setFilters] = useState<JobFiltersType>(
    () => getStoredFilters() ?? DEFAULT_FILTERS
  )
  const { jobs, thread, loading, error, refresh, providerId } = useJobProvider(
    filters.provider,
    filters.providerOptions
  )

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    storeFilters(filters)
  }, [filters])

  // Compute user's region from country code
  const userRegion = getRegionFromCountry(userLocation.country)

  // Recalculate scores when temperature changes
  const jobsWithUpdatedScores = useMemo(() => {
    // If temperature matches default (0.4), use cached scores
    if (Math.abs(filters.temperature - 0.4) < 0.01) {
      return jobs
    }

    // Recalculate scores with new temperature
    // Use rawText since htmlText may not be cached
    return jobs.map((job) => {
      const matchResult = calculateWeightedScore(
        job.rawText || job.htmlText || '',
        filters.temperature,
        userRegion
      )
      return {
        ...job,
        matchScore: matchResult.score,
        matchedSkills: matchResult.matchedSkills.map((s) => s.name),
        matchDetails: matchResult,
      }
    })
  }, [jobs, filters.temperature, userRegion])

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let result = [...jobsWithUpdatedScores]

    // Apply location filter using new classification system
    if (filters.location !== 'all') {
      result = result.filter((job) =>
        matchesLocationFilter(job.locationData, filters.location, userRegion)
      )
    }

    // Apply min match score filter
    if (filters.minMatchScore > 0) {
      result = result.filter((job) => job.matchScore >= filters.minMatchScore)
    }

    // Apply search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.company.toLowerCase().includes(query) ||
          job.rawText.toLowerCase().includes(query) ||
          job.matchedSkills.some((skill) => skill.toLowerCase().includes(query))
      )
    }

    // Apply sorting
    if (filters.sortBy === 'recent') {
      result.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    } else {
      // Default: sort by match score
      result.sort((a, b) => b.matchScore - a.matchScore)
    }

    return result
  }, [jobsWithUpdatedScores, filters, userRegion])

  const hasActiveFilters =
    filters.minMatchScore > 0 ||
    filters.searchQuery.length > 0 ||
    filters.sortBy !== 'match' ||
    filters.location !== 'any-eu' ||
    Math.abs(filters.temperature - 0.4) > 0.01 ||
    filters.provider !== 'hn'

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear stored filters:', error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <JobsHeader
        thread={thread}
        jobCount={filteredJobs.length}
        loading={loading}
        onRefresh={refresh}
        filters={filters}
        onFiltersChange={setFilters}
        hasActiveFilters={hasActiveFilters}
        providerId={providerId}
      />

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />

      <main className="container-wide py-4">
        {/* Content */}
        {loading ? (
          <LoadingState message="Fetching jobs from Hacker News..." />
        ) : error ? (
          <ErrorState error={error} onRetry={refresh} />
        ) : filteredJobs.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        ) : (
          <Virtuoso
            data={filteredJobs}
            useWindowScroll
            overscan={200}
            itemContent={(_, job) => (
              <div className="pb-4">
                <JobCard job={job} />
              </div>
            )}
          />
        )}

        {/* Results summary */}
        {!loading && !error && filteredJobs.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Showing {filteredJobs.length} of {jobs.length} jobs
            {hasActiveFilters && ' (filtered)'}
          </p>
        )}

        {/* Attribution footer */}
        <footer className="text-center text-xs text-muted-foreground mt-8 pb-4 border-t border-border pt-4">
          Job data provided by{' '}
          <a
            href="https://news.ycombinator.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Hacker News
          </a>
          ,{' '}
          <a
            href="https://remoteok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            RemoteOK
          </a>
          ,{' '}
          <a
            href="https://jobicy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Jobicy
          </a>
          ,{' '}
          <a
            href="https://www.arbeitnow.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Arbeitnow
          </a>
          , and{' '}
          <a
            href="https://remotive.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Remotive
          </a>
        </footer>
      </main>
    </div>
  )
}
