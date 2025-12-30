import { useMemo } from 'react'
import {
  useHNJobs,
  useArbeitnowJobs,
  useRemoteOKJobs,
  useJobicyJobs,
  useRemotiveJobs,
} from './jobs'
import type { JobProviderId, ProviderOptions } from '@/types/providers'
import type { ParsedJob, HNThread } from '@/types/hn'

interface UseJobProviderResult {
  jobs: ParsedJob[]
  thread: HNThread | null
  loading: boolean
  error: Error | null
  refresh: () => void
  providerId: JobProviderId
}

/**
 * Unified hook that delegates to provider-specific hooks based on selection.
 * This allows switching between job sources while maintaining a consistent interface.
 */
export function useJobProvider(
  providerId: JobProviderId,
  providerOptions?: Partial<ProviderOptions>
): UseJobProviderResult {
  // Extract options for each provider and set enabled based on selection
  const arbeitnowOptions = {
    ...providerOptions?.arbeitnow,
    enabled: providerId === 'arbeitnow',
  }

  // Call all hooks unconditionally (React rules of hooks)
  // Each hook only fetches if enabled
  const hnResult = useHNJobs({ enabled: providerId === 'hn' })
  const arbeitnowResult = useArbeitnowJobs(arbeitnowOptions)
  const remoteokResult = useRemoteOKJobs({ enabled: providerId === 'remoteok' })
  const jobicyResult = useJobicyJobs({ enabled: providerId === 'jobicy' })
  const remotiveResult = useRemotiveJobs({ enabled: providerId === 'remotive' })

  // Select active result based on provider
  const result = useMemo(() => {
    switch (providerId) {
      case 'arbeitnow':
        return {
          jobs: arbeitnowResult.jobs,
          thread: {
            id: 'arbeitnow',
            title: 'Arbeitnow Jobs',
            postedAt: new Date(),
            commentCount: arbeitnowResult.jobs.length,
          } as HNThread,
          loading: arbeitnowResult.loading,
          error: arbeitnowResult.error,
          refresh: arbeitnowResult.refresh,
        }
      case 'remoteok':
        return {
          jobs: remoteokResult.jobs,
          thread: {
            id: 'remoteok',
            title: 'RemoteOK Jobs',
            postedAt: new Date(),
            commentCount: remoteokResult.jobs.length,
          } as HNThread,
          loading: remoteokResult.loading,
          error: remoteokResult.error,
          refresh: remoteokResult.refresh,
        }
      case 'jobicy':
        return {
          jobs: jobicyResult.jobs,
          thread: {
            id: 'jobicy',
            title: 'Jobicy Jobs',
            postedAt: new Date(),
            commentCount: jobicyResult.jobs.length,
          } as HNThread,
          loading: jobicyResult.loading,
          error: jobicyResult.error,
          refresh: jobicyResult.refresh,
        }
      case 'remotive':
        return {
          jobs: remotiveResult.jobs,
          thread: {
            id: 'remotive',
            title: 'Remotive Jobs',
            postedAt: new Date(),
            commentCount: remotiveResult.jobs.length,
          } as HNThread,
          loading: remotiveResult.loading,
          error: remotiveResult.error,
          refresh: remotiveResult.refresh,
        }
      case 'hn':
      default:
        return {
          jobs: hnResult.jobs,
          thread: hnResult.thread,
          loading: hnResult.loading,
          error: hnResult.error,
          refresh: hnResult.refresh,
        }
    }
  }, [
    providerId,
    hnResult,
    arbeitnowResult,
    remoteokResult,
    jobicyResult,
    remotiveResult,
  ])

  return {
    ...result,
    providerId,
  }
}
