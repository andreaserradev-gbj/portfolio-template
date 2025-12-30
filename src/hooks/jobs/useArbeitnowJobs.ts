/**
 * Arbeitnow jobs hook.
 * Thin wrapper around ArbeitnowJobService + useJobsBase.
 */

import { useMemo } from 'react'
import { useJobsBase } from './useJobsBase'
import {
  ArbeitnowJobService,
  type ArbeitnowFetchOptions,
} from '@/services/jobs/providers/ArbeitnowJobService'
import type { ArbeitnowApiJob } from '@/types/providers'

interface UseArbeitnowJobsOptions extends ArbeitnowFetchOptions {
  enabled?: boolean
}

export function useArbeitnowJobs(options?: UseArbeitnowJobsOptions) {
  const service = useMemo(() => new ArbeitnowJobService(), [])
  const remoteOnly = options?.remoteOnly ?? true // Default to remote only

  return useJobsBase<ArbeitnowApiJob, ArbeitnowFetchOptions>(service, {
    enabled: options?.enabled,
    serviceOptions: { remoteOnly },
  })
}
