/**
 * Remotive job service.
 * Fetches remote jobs from remotive.com API.
 */

import { JobService } from '../JobService'
import type { ParsedJob } from '@/types/hn'
import type { RemotiveApiJob, RemotiveApiResponse } from '@/types/providers'
import { PROVIDERS } from '@/types/providers'

export class RemotiveJobService extends JobService<RemotiveApiJob> {
  constructor() {
    super({
      providerId: 'remotive',
      apiUrl: PROVIDERS.remotive.apiUrl,
      cacheDuration: PROVIDERS.remotive.cacheDuration,
      maxJobs: 200,
      maxAgeDays: 30,
    })
  }

  async fetchFromApi(): Promise<RemotiveApiJob[]> {
    const response = await fetch(`${this.config.apiUrl}?limit=300`)
    if (!response.ok) {
      throw new Error(`Failed to fetch Remotive jobs: ${response.statusText}`)
    }

    const data: RemotiveApiResponse = await response.json()
    return data.jobs || []
  }

  transformJob(job: RemotiveApiJob): ParsedJob {
    const rawText = this.stripHtml(job.description)
    const matchResult = this.calculateMatchScore(job.description)
    const locationData = this.classifyLocation(rawText)
    const sourceUrl = job.url

    return {
      id: `remotive-${job.id}`,
      company: job.company_name,
      title: job.title,
      rawText,
      htmlText: job.description,
      postedAt: new Date(job.publication_date),
      author: job.company_name,
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills.map((s) => s.name),
      sourceUrl,
      hnUrl: sourceUrl,
      isRemote: true,
      location: job.candidate_required_location || null,
      locationData,
      matchDetails: matchResult,
      source: 'remotive',
      tags: [job.category, job.job_type].filter(Boolean),
    }
  }
}
