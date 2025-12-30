/**
 * RemoteOK jobs hook.
 * Thin wrapper around RemoteOKJobService + useJobsBase.
 */

import { useMemo } from 'react'
import { useJobsBase } from './useJobsBase'
import { RemoteOKJobService } from '@/services/jobs/providers/RemoteOKJobService'
import type { RemoteOKApiJob } from '@/types/providers'

interface UseRemoteOKJobsOptions {
  enabled?: boolean
}

export function useRemoteOKJobs(options?: UseRemoteOKJobsOptions) {
  const service = useMemo(() => new RemoteOKJobService(), [])

  return useJobsBase<RemoteOKApiJob>(service, {
    enabled: options?.enabled,
  })
}
