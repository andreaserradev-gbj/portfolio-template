/**
 * Remotive jobs hook.
 * Thin wrapper around RemotiveJobService + useJobsBase.
 */

import { useMemo } from 'react'
import { useJobsBase } from './useJobsBase'
import { RemotiveJobService } from '@/services/jobs/providers/RemotiveJobService'
import type { RemotiveApiJob } from '@/types/providers'

interface UseRemotiveJobsOptions {
  enabled?: boolean
}

export function useRemotiveJobs(options?: UseRemotiveJobsOptions) {
  const service = useMemo(() => new RemotiveJobService(), [])

  return useJobsBase<RemotiveApiJob>(service, {
    enabled: options?.enabled,
  })
}
