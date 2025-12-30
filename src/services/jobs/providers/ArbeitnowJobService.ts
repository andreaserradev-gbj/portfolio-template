/**
 * Arbeitnow job service.
 * Fetches jobs from arbeitnow.com API with optional remote filter.
 */

import { JobService } from '../JobService'
import type { ParsedJob } from '@/types/hn'
import type { ArbeitnowApiJob, ArbeitnowApiResponse } from '@/types/providers'
import { PROVIDERS } from '@/types/providers'
import { isRemoteJob } from '@/lib/skillMatcher'

export interface ArbeitnowFetchOptions {
  remoteOnly?: boolean
}

const CACHE_KEY_BASE = 'arbeitnow-jobs-cache'

export class ArbeitnowJobService extends JobService<
  ArbeitnowApiJob,
  ArbeitnowFetchOptions
> {
  constructor() {
    super(
      {
        providerId: 'arbeitnow',
        apiUrl: PROVIDERS.arbeitnow.apiUrl,
        cacheDuration: PROVIDERS.arbeitnow.cacheDuration,
        maxJobs: 200,
        maxAgeDays: 30,
      },
      // Custom cache key generator based on options
      (options) =>
        options?.remoteOnly ? `${CACHE_KEY_BASE}-remote` : CACHE_KEY_BASE
    )
  }

  async fetchFromApi(
    options?: ArbeitnowFetchOptions
  ): Promise<ArbeitnowApiJob[]> {
    const allJobs: ArbeitnowApiJob[] = []
    let page = 1
    let hasMore = true
    const maxPages = 3

    while (hasMore && page <= maxPages) {
      const params = new URLSearchParams()
      params.set('page', String(page))

      if (options?.remoteOnly) {
        params.set('remote', 'true')
      }

      const url = `${this.config.apiUrl}?${params}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch Arbeitnow jobs: ${response.statusText}`
        )
      }

      const data: ArbeitnowApiResponse = await response.json()

      // Add jobs BEFORE checking pagination to include last page
      allJobs.push(...data.data)

      if (data.data.length === 0 || page >= data.meta.last_page) {
        hasMore = false
      } else {
        page++
      }
    }

    return allJobs
  }

  transformJob(job: ArbeitnowApiJob): ParsedJob {
    const rawText = this.stripHtml(job.description)
    const matchResult = this.calculateMatchScore(job.description)
    const locationData = this.classifyLocation(rawText)
    const sourceUrl = job.url

    return {
      id: `arbeitnow-${job.slug}`,
      company: job.company_name,
      title: job.title,
      rawText,
      htmlText: job.description,
      postedAt: new Date(job.created_at * 1000),
      author: job.company_name,
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills.map((s) => s.name),
      sourceUrl,
      hnUrl: sourceUrl,
      isRemote: job.remote || isRemoteJob(rawText),
      location: job.location || null,
      locationData,
      matchDetails: matchResult,
      source: 'arbeitnow',
      tags: job.tags,
    }
  }
}
