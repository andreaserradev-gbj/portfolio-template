/**
 * Hacker News API types for the job board feature.
 * Uses the Algolia HN Search API.
 */

import type { WeightedMatchResult, Region } from '@/lib/skillMatcher'
import type { JobProviderId, ProviderOptions } from '@/types/providers'

/**
 * HN story from Algolia search (e.g., "Who is Hiring?" thread)
 */
export interface HNStory {
  objectID: string
  title: string
  author: string
  created_at: string
  created_at_i: number
  num_comments: number
  url: string | null
}

/**
 * HN comment from Algolia search (job posting)
 */
export interface HNJobComment {
  objectID: string
  author: string
  comment_text: string
  created_at: string
  created_at_i: number
  story_id: number
  parent_id: number
}

/**
 * Algolia search response wrapper
 */
export interface HNSearchResponse<T> {
  hits: T[]
  nbHits: number
  page: number
  nbPages: number
  hitsPerPage: number
  exhaustiveNbHits: boolean
}

/**
 * Job location type classification
 * More granular than boolean isRemote
 */
export type JobLocationType =
  | 'REMOTE_GLOBAL' // Fully remote, no restrictions (e.g., "Remote worldwide")
  | 'REMOTE_REGIONAL' // Remote but restricted to specific regions (e.g., "Remote (EU only)")
  | 'HYBRID' // Mix of remote and on-site options (e.g., "Remote or SF office")
  | 'ON_SITE' // Requires physical presence (e.g., "ONSITE in Zurich")
  | 'MIXED_ROLES' // Multi-role post with different location requirements
  | 'UNKNOWN' // Cannot determine

/**
 * Parsed location data with primary/secondary distinction
 */
export interface ParsedLocationData {
  type: JobLocationType
  /** Primary regions (explicit focus - e.g., "Remote (EU)" means EU is primary) */
  primaryRegions: Region[]
  /** Secondary regions (mentioned but not primary - e.g., US/Canada/Europe where US/Canada are primary) */
  secondaryRegions: Region[]
  /** Specific on-site locations mentioned */
  onSiteLocations: string[]
  /** Explicit exclusions (e.g., "no US citizens") */
  excludedRegions: Region[]
  /** Confidence level in classification */
  confidence: 'high' | 'medium' | 'low'
  /** For MIXED_ROLES: breakdown of roles */
  roleBreakdown?: {
    remoteRoles: number
    onSiteRoles: number
    hybridRoles: number
  }
}

/**
 * Parsed job posting with matching data
 */
export interface ParsedJob {
  id: string
  company: string
  rawText: string
  htmlText: string
  postedAt: Date
  author: string
  matchScore: number
  matchedSkills: string[]
  /** URL to view job on source platform */
  sourceUrl: string
  /** @deprecated Use sourceUrl instead */
  hnUrl: string
  /** @deprecated Use locationData.type instead */
  isRemote: boolean
  /** @deprecated Use locationData instead */
  location: string | null
  /** Rich location classification with primary/secondary regions */
  locationData: ParsedLocationData
  /** Detailed match breakdown from weighted scoring (optional) */
  matchDetails?: WeightedMatchResult
  /** Provider that sourced this job */
  source: JobProviderId
  /** Job title (explicit for providers like Arbeitnow) */
  title?: string
  /** Job tags from provider */
  tags?: string[]
}

/**
 * Thread metadata
 */
export interface HNThread {
  id: string
  title: string
  postedAt: Date
  commentCount: number
}

/**
 * Cache entry for localStorage
 */
export interface JobsCacheEntry {
  jobs: ParsedJob[]
  thread: HNThread
  fetchedAt: number
}

/**
 * Location filter options
 * - all: No location filtering
 * - remote-global: Only REMOTE_GLOBAL jobs (available worldwide)
 * - remote-eu: REMOTE_GLOBAL + REMOTE_REGIONAL where EU is PRIMARY
 * - onsite-eu: ON_SITE + HYBRID jobs in EU countries
 * - any-eu: All jobs available to EU (remote-global + remote-eu + onsite-eu)
 */
export type LocationFilter =
  | 'all'
  | 'remote-global'
  | 'remote-eu'
  | 'onsite-eu'
  | 'any-eu'

/**
 * Filter options for job listings
 */
export interface JobFilters {
  minMatchScore: number
  sortBy: 'match' | 'recent'
  searchQuery: string
  location: LocationFilter
  /** Temperature parameter for matching sensitivity (0.0-1.0) */
  temperature: number
  /** Selected job provider */
  provider: JobProviderId
  /** Provider-specific options */
  providerOptions?: Partial<ProviderOptions>
}

/**
 * Match score tier for visual styling
 */
export type MatchScoreTier = 'low' | 'moderate' | 'good' | 'excellent'

/**
 * Get the tier for a given match score
 */
export function getMatchScoreTier(score: number): MatchScoreTier {
  if (score >= 76) return 'excellent'
  if (score >= 51) return 'good'
  if (score >= 21) return 'moderate'
  return 'low'
}
