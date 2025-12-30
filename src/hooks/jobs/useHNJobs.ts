/**
 * Hacker News jobs hook.
 * Thin wrapper around HNJobService + useJobsBase.
 */

import { useMemo } from 'react'
import { useJobsBase } from './useJobsBase'
import { HNJobService } from '@/services/jobs/providers/HNJobService'
import type { HNJobComment } from '@/types/hn'

interface UseHNJobsOptions {
  enabled?: boolean
}

export function useHNJobs(options?: UseHNJobsOptions) {
  const service = useMemo(() => new HNJobService(), [])

  const result = useJobsBase<HNJobComment>(service, {
    enabled: options?.enabled,
  })

  return {
    jobs: result.jobs,
    thread: result.metadata ?? null,
    loading: result.loading,
    error: result.error,
    refresh: result.refresh,
  }
}
