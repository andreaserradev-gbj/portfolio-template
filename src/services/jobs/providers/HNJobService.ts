/**
 * Hacker News job service.
 * Fetches jobs from "Who is Hiring?" threads via Algolia API.
 */

import { JobService } from '../JobService'
import type {
  ParsedJob,
  HNThread,
  HNStory,
  HNJobComment,
  HNSearchResponse,
} from '@/types/hn'
import { PROVIDERS } from '@/types/providers'
import {
  parseCompanyName,
  isRemoteJob,
  parseJobLocation,
} from '@/lib/skillMatcher'

const HN_ALGOLIA_BASE = 'https://hn.algolia.com/api/v1'

export class HNJobService extends JobService<HNJobComment> {
  private currentThread: HNThread | null = null

  constructor() {
    super({
      providerId: 'hn',
      apiUrl: PROVIDERS.hn.apiUrl,
      cacheDuration: PROVIDERS.hn.cacheDuration,
      maxJobs: 200,
      maxAgeDays: 30,
    })
  }

  private async fetchLatestThread(): Promise<HNStory | null> {
    const url = `${HN_ALGOLIA_BASE}/search_by_date?query=who+is+hiring&tags=story,author_whoishiring&hitsPerPage=10`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch HN threads: ${response.statusText}`)
    }

    const data: HNSearchResponse<HNStory> = await response.json()

    // Find the most recent "Ask HN: Who is hiring?" thread
    const hiringThread = data.hits.find(
      (story) =>
        story.title.toLowerCase().includes('who is hiring') &&
        !story.title.toLowerCase().includes('who wants to be hired')
    )

    return hiringThread ?? null
  }

  private async fetchJobComments(storyId: string): Promise<HNJobComment[]> {
    const allComments: HNJobComment[] = []
    let page = 0
    const hitsPerPage = 100
    let hasMore = true

    while (hasMore) {
      const url = `${HN_ALGOLIA_BASE}/search?tags=comment,story_${storyId}&hitsPerPage=${hitsPerPage}&page=${page}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`)
      }

      const data: HNSearchResponse<HNJobComment> = await response.json()
      allComments.push(...data.hits)

      hasMore = data.page < data.nbPages - 1
      page++

      // Safety limit
      if (page > 10) break
    }

    // Filter to only top-level comments (actual job postings)
    return allComments.filter(
      (comment) => comment.parent_id === parseInt(storyId)
    )
  }

  async fetchFromApi(): Promise<HNJobComment[]> {
    const thread = await this.fetchLatestThread()
    if (!thread) {
      throw new Error('No "Who is Hiring?" thread found')
    }

    this.currentThread = {
      id: thread.objectID,
      title: thread.title,
      postedAt: new Date(thread.created_at),
      commentCount: thread.num_comments,
    }

    return this.fetchJobComments(thread.objectID)
  }

  async fetchMetadata(): Promise<HNThread | undefined> {
    // Thread is populated by fetchFromApi
    return this.currentThread ?? undefined
  }

  transformJob(comment: HNJobComment): ParsedJob {
    const rawText = this.stripHtml(comment.comment_text)
    const matchResult = this.calculateMatchScore(comment.comment_text)
    const locationData = this.classifyLocation(rawText)
    const sourceUrl = `https://news.ycombinator.com/item?id=${comment.objectID}`

    return {
      id: comment.objectID,
      company: parseCompanyName(comment.comment_text),
      rawText,
      htmlText: comment.comment_text,
      postedAt: new Date(comment.created_at),
      author: comment.author,
      matchScore: matchResult.score,
      matchedSkills: matchResult.matchedSkills.map((s) => s.name),
      sourceUrl,
      hnUrl: sourceUrl,
      isRemote: isRemoteJob(rawText),
      location: parseJobLocation(comment.comment_text),
      locationData,
      matchDetails: matchResult,
      source: 'hn',
    }
  }

  /**
   * Override processJobs to filter by comment length and age.
   * HN threads are monthly, but we still filter by maxAgeDays for consistency.
   */
  protected processJobs(jobs: ParsedJob[]): ParsedJob[] {
    const cutoffDate = new Date(
      Date.now() - this.config.maxAgeDays * 24 * 60 * 60 * 1000
    )

    return jobs
      .filter((job) => job.rawText && job.rawText.length > 50)
      .filter((job) => job.postedAt >= cutoffDate)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, this.config.maxJobs)
  }
}
