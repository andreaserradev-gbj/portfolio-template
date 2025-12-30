/**
 * RemoteOK job service.
 * Fetches remote jobs from remoteok.com API.
 */

import { JobService } from '../JobService'
import type { ParsedJob } from '@/types/hn'
import type { RemoteOKApiJob } from '@/types/providers'
import { PROVIDERS } from '@/types/providers'

export class RemoteOKJobService extends JobService<RemoteOKApiJob> {
  constructor() {
    super({
      providerId: 'remoteok',
      apiUrl: PROVIDERS.remoteok.apiUrl,
      cacheDuration: PROVIDERS.remoteok.cacheDuration,
      maxJobs: 200,
      maxAgeDays: 30,
    })
  }

  async fetchFromApi(): Promise<RemoteOKApiJob[]> {
    const response = await fetch(this.config.apiUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch RemoteOK jobs: ${response.statusText}`)
    }

    const data: RemoteOKApiJob[] = await response.json()
    // First element is metadata, skip it
    return data.slice(1)
  }

  transformJob(job: RemoteOKApiJob): ParsedJob {
    const rawText = this.stripHtml(job.description)
    const matchResult = this.calculateMatchScore(job.description)
    const locationData = this.classifyLocation(rawText)
    const sourceUrl =
      job.apply_url || `https://remoteok.com/remote-jobs/${job.slug}`

    return {
      id: `remoteok-${job.id}`,
      company: job.company,
      title: job.position,
      rawText,
      htmlText: job.description,
      postedAt: new Date(job.epoch * 1000),
      author: job.company,
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills.map((s) => s.name),
      sourceUrl,
      hnUrl: sourceUrl,
      isRemote: true,
      location: job.location || null,
      locationData,
      matchDetails: matchResult,
      source: 'remoteok',
      tags: job.tags || [],
    }
  }
}
