/**
 * Jobicy job service.
 * Fetches remote jobs from jobicy.com API across multiple industries.
 */

import { JobService } from '../JobService'
import type { ParsedJob } from '@/types/hn'
import type { JobicyApiJob, JobicyApiResponse } from '@/types/providers'
import { PROVIDERS } from '@/types/providers'

// Industries matching skills from content.json
const INDUSTRIES = ['dev', 'engineering']

export class JobicyJobService extends JobService<JobicyApiJob> {
  constructor() {
    super({
      providerId: 'jobicy',
      apiUrl: PROVIDERS.jobicy.apiUrl,
      cacheDuration: PROVIDERS.jobicy.cacheDuration,
      maxJobs: 200,
      maxAgeDays: 30,
    })
  }

  private async fetchIndustryJobs(industry: string): Promise<JobicyApiJob[]> {
    const url = `${this.config.apiUrl}?count=100&industry=${industry}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Jobicy ${industry} jobs: ${response.status} ${response.statusText}`
      )
    }

    const data: JobicyApiResponse = await response.json()
    if (!data.jobs || !Array.isArray(data.jobs)) {
      throw new Error(`Unexpected Jobicy API response: missing jobs array`)
    }
    return data.jobs
  }

  async fetchFromApi(): Promise<JobicyApiJob[]> {
    // Fetch all industries in parallel, allowing partial failures
    const results = await Promise.allSettled(
      INDUSTRIES.map((industry) => this.fetchIndustryJobs(industry))
    )

    // Check if all fetches failed
    const failures = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    )
    if (failures.length === INDUSTRIES.length) {
      throw new Error(
        `All Jobicy industry fetches failed: ${failures.map((f) => f.reason).join(', ')}`
      )
    }
    if (failures.length > 0) {
      console.warn(
        `${failures.length}/${INDUSTRIES.length} Jobicy fetches failed:`,
        failures.map((f) => f.reason)
      )
    }

    // Extract successful results
    const successfulResults = results
      .filter(
        (r): r is PromiseFulfilledResult<JobicyApiJob[]> =>
          r.status === 'fulfilled'
      )
      .map((r) => r.value)

    // Flatten and deduplicate by job ID
    const allJobs = successfulResults.flat()
    const uniqueJobs = new Map<number, JobicyApiJob>()
    for (const job of allJobs) {
      uniqueJobs.set(job.id, job)
    }

    return Array.from(uniqueJobs.values())
  }

  transformJob(job: JobicyApiJob): ParsedJob {
    const rawText = this.stripHtml(job.jobDescription)
    const matchResult = this.calculateMatchScore(job.jobDescription)
    const locationData = this.classifyLocation(rawText)
    const sourceUrl = job.url

    return {
      id: `jobicy-${job.id}`,
      company: job.companyName,
      title: job.jobTitle,
      rawText,
      htmlText: job.jobDescription,
      postedAt: new Date(job.pubDate),
      author: job.companyName,
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills.map((s) => s.name),
      sourceUrl,
      hnUrl: sourceUrl,
      isRemote: true,
      location: job.jobGeo || null,
      locationData,
      matchDetails: matchResult,
      source: 'jobicy',
      tags: [job.jobIndustry, job.jobLevel].filter(Boolean),
    }
  }
}
