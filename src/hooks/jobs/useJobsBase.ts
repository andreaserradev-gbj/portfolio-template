/**
 * Generic base hook for job providers.
 * Handles all React concerns: state, effects, caching.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { ParsedJob, HNThread } from '@/types/hn'
import type { JobService } from '@/services/jobs/JobService'
import { readCache, writeCache, createCacheEntry } from '@/lib/jobsCache'

export interface UseJobsBaseOptions<TOptions = unknown> {
  enabled?: boolean
  serviceOptions?: TOptions
}

export interface UseJobsBaseResult {
  jobs: ParsedJob[]
  metadata?: HNThread
  loading: boolean
  error: Error | null
  refresh: () => void
}

/**
 * Generic hook for job providers.
 * Wraps a JobService with React state management and caching.
 */
export function useJobsBase<TApiJob, TOptions = Record<string, never>>(
  service: JobService<TApiJob, TOptions>,
  options?: UseJobsBaseOptions<TOptions>
): UseJobsBaseResult {
  const enabled = options?.enabled ?? true
  const serviceOptions = options?.serviceOptions

  const [jobs, setJobs] = useState<ParsedJob[]>([])
  const [metadata, setMetadata] = useState<HNThread | undefined>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const hasLoadedRef = useRef(false)

  // Memoize cache key to detect option changes
  const cacheKey = useMemo(
    () => service.getCacheKeyForOptions(serviceOptions),
    [service, serviceOptions]
  )

  // Track cache key changes to reset hasLoaded
  const lastCacheKeyRef = useRef(cacheKey)
  if (lastCacheKeyRef.current !== cacheKey) {
    hasLoadedRef.current = false
    lastCacheKeyRef.current = cacheKey
  }

  const fetchJobs = useCallback(
    async (forceRefresh = false) => {
      // Fast path: skip if already loaded and not forcing refresh
      if (!forceRefresh && hasLoadedRef.current) {
        return
      }

      setLoading(true)
      setError(null)

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = readCache(cacheKey, service.cacheDuration)
        if (cached) {
          setJobs(cached.jobs)
          setMetadata(cached.metadata)
          setLoading(false)
          hasLoadedRef.current = true
          return
        }
      }

      try {
        const result = await service.fetch(serviceOptions)

        // Cache results
        const entry = createCacheEntry(result.jobs, result.metadata)
        if (!writeCache(cacheKey, entry)) {
          console.warn(`Failed to cache ${cacheKey} - jobs will not persist`)
        }

        setJobs(result.jobs)
        setMetadata(result.metadata)
        hasLoadedRef.current = true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to fetch jobs')
        console.error(`[${service.providerId}] Failed to fetch jobs:`, error)
        setError(error)
      } finally {
        setLoading(false)
      }
    },
    [cacheKey, service, serviceOptions]
  )

  // Fetch on mount only if enabled
  useEffect(() => {
    if (enabled) {
      fetchJobs()
    }
  }, [fetchJobs, enabled])

  // Persist in-memory data to cache when this provider becomes active.
  // This ensures data survives page refresh after switching providers.
  useEffect(() => {
    if (enabled && hasLoadedRef.current && jobs.length > 0) {
      const entry = createCacheEntry(jobs, metadata)
      if (!writeCache(cacheKey, entry)) {
        console.warn(`Failed to cache ${cacheKey} - jobs will not persist`)
      }
    }
  }, [enabled, jobs, metadata, cacheKey])

  const refresh = useCallback(() => {
    if (enabled) {
      hasLoadedRef.current = false
      fetchJobs(true)
    }
  }, [fetchJobs, enabled])

  return {
    jobs,
    metadata,
    loading,
    error,
    refresh,
  }
}
