/**
 * Jobicy jobs hook.
 * Thin wrapper around JobicyJobService + useJobsBase.
 */

import { useMemo } from 'react'
import { useJobsBase } from './useJobsBase'
import { JobicyJobService } from '@/services/jobs/providers/JobicyJobService'
import type { JobicyApiJob } from '@/types/providers'

interface UseJobicyJobsOptions {
  enabled?: boolean
}

export function useJobicyJobs(options?: UseJobicyJobsOptions) {
  const service = useMemo(() => new JobicyJobService(), [])

  return useJobsBase<JobicyApiJob>(service, {
    enabled: options?.enabled,
  })
}
