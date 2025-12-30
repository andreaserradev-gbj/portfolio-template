/**
 * Service layer types for job providers.
 * Separates API business logic from React hooks.
 */

import type { ParsedJob, HNThread } from '@/types/hn'
import type { JobProviderId } from '@/types/providers'

/**
 * Result from fetching jobs - includes optional metadata for HN's thread info
 */
export interface JobFetchResult {
  jobs: ParsedJob[]
  metadata?: HNThread
}

/**
 * Configuration for a job service
 */
export interface JobServiceConfig {
  providerId: JobProviderId
  apiUrl: string
  cacheDuration: number
  maxJobs: number
  maxAgeDays: number
}

/**
 * Cache key generator function type
 */
export type CacheKeyGenerator<TOptions = unknown> = (
  options?: TOptions
) => string
