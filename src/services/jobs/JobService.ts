/**
 * Abstract base class for all job services.
 * Handles common transformation logic and defines the fetch contract.
 */

import type { ParsedJob } from '@/types/hn'
import type { JobProviderId } from '@/types/providers'
import type {
  JobFetchResult,
  JobServiceConfig,
  CacheKeyGenerator,
} from './types'
import {
  calculateWeightedScore,
  classifyJobLocation,
  getRegionFromCountry,
} from '@/lib/skillMatcher'
import { userLocation } from '@/config/loader'

export abstract class JobService<TApiJob, TOptions = Record<string, never>> {
  protected readonly config: JobServiceConfig
  protected readonly getCacheKey: CacheKeyGenerator<TOptions>

  constructor(
    config: JobServiceConfig,
    cacheKeyGenerator?: CacheKeyGenerator<TOptions>
  ) {
    this.config = config
    this.getCacheKey =
      cacheKeyGenerator ?? (() => `${config.providerId}-jobs-cache`)
  }

  /**
   * Fetch jobs from the API. Must be implemented by each provider.
   */
  abstract fetchFromApi(options?: TOptions): Promise<TApiJob[]>

  /**
   * Transform a single API job to ParsedJob format.
   * Must be implemented by each provider.
   */
  abstract transformJob(apiJob: TApiJob): ParsedJob

  /**
   * Optional: Fetch additional metadata (e.g., HN thread info).
   * Override in providers that need it.
   */
  async fetchMetadata(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: TOptions
  ): Promise<JobFetchResult['metadata']> {
    return undefined
  }

  /**
   * Common post-processing: filtering by age, sorting, limiting.
   */
  protected processJobs(jobs: ParsedJob[]): ParsedJob[] {
    const cutoffDate = new Date(
      Date.now() - this.config.maxAgeDays * 24 * 60 * 60 * 1000
    )

    return jobs
      .filter((job) => job.postedAt >= cutoffDate)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, this.config.maxJobs)
  }

  /**
   * Calculate match score for job description.
   */
  protected calculateMatchScore(description: string) {
    const userRegion = getRegionFromCountry(userLocation.country)
    const defaultTemperature = 0.4
    return calculateWeightedScore(description, defaultTemperature, userRegion)
  }

  /**
   * Classify job location.
   */
  protected classifyLocation(rawText: string) {
    return classifyJobLocation(rawText)
  }

  /**
   * Strip HTML tags from text.
   */
  protected stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  /**
   * Main fetch method - orchestrates the full process.
   */
  async fetch(options?: TOptions): Promise<JobFetchResult> {
    const [apiJobs, metadata] = await Promise.all([
      this.fetchFromApi(options),
      this.fetchMetadata(options),
    ])

    const transformedJobs = apiJobs.map((job) => this.transformJob(job))
    const processedJobs = this.processJobs(transformedJobs)

    return {
      jobs: processedJobs,
      metadata,
    }
  }

  /**
   * Get provider ID for this service.
   */
  get providerId(): JobProviderId {
    return this.config.providerId
  }

  /**
   * Get cache key for given options.
   */
  getCacheKeyForOptions(options?: TOptions): string {
    return this.getCacheKey(options)
  }

  /**
   * Get cache duration in milliseconds.
   */
  get cacheDuration(): number {
    return this.config.cacheDuration
  }
}
