/**
 * Shared cache utilities for job provider hooks.
 * Handles localStorage quota management and cache eviction.
 */

// All job cache keys used across providers
export const JOB_CACHE_KEYS = [
  'hn-jobs-cache',
  'arbeitnow-jobs-cache',
  'arbeitnow-jobs-cache-remote',
  'remoteok-jobs-cache',
  'jobicy-jobs-cache',
  'remotive-jobs-cache',
] as const

/**
 * Clear all job caches from localStorage.
 * Used when quota is exceeded to make room for new cache.
 */
export function clearAllJobCaches(): void {
  JOB_CACHE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to clear job cache "${key}":`, error)
    }
  })
}

/**
 * Clear other provider caches except the specified one.
 * Used to make room before caching a new provider's data.
 */
export function clearOtherJobCaches(keepKey: string): void {
  JOB_CACHE_KEYS.forEach((key) => {
    if (key !== keepKey) {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn(`Failed to clear job cache "${key}":`, error)
      }
    }
  })
}

/**
 * Safely set an item in localStorage with quota handling.
 * If quota is exceeded, clears other job caches and retries.
 *
 * @param key - The localStorage key
 * @param value - The value to store (will be JSON stringified)
 * @returns true if successful, false if failed even after retry
 */
export function safeSetCache(key: string, value: unknown): boolean {
  const data = JSON.stringify(value)

  try {
    localStorage.setItem(key, data)
    return true
  } catch (error) {
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(
        `localStorage quota exceeded for ${key}, clearing other caches and retrying...`
      )

      // Clear other job caches to make room
      clearOtherJobCaches(key)

      try {
        localStorage.setItem(key, data)
        return true
      } catch (retryError) {
        console.warn(`Failed to cache ${key} even after clearing:`, retryError)
        return false
      }
    }

    console.warn(`Failed to cache ${key}:`, error)
    return false
  }
}

/**
 * Fields to exclude from cached jobs to reduce storage size.
 * htmlText is stripped from cache; rawText serves as a fallback for display.
 */
export const CACHE_EXCLUDE_FIELDS = ['htmlText'] as const

/**
 * Strip large fields from jobs before caching.
 * Reduces cache size by ~60%.
 */
export function prepareJobsForCache<T extends Record<string, unknown>>(
  jobs: T[]
): Omit<T, 'htmlText'>[] {
  return jobs.map((job) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { htmlText, ...rest } = job as T & { htmlText?: unknown }
    return rest as Omit<T, 'htmlText'>
  })
}

// ============================================================================
// Generic Cache Functions for useJobsBase
// ============================================================================

import type { ParsedJob, HNThread } from '@/types/hn'

/**
 * Generic cache entry structure
 */
export interface GenericJobsCacheEntry {
  jobs: ParsedJob[]
  metadata?: HNThread
  fetchedAt: number
}

/**
 * Read from cache with TTL validation.
 * Returns null if cache is missing or expired.
 */
export function readCache(
  cacheKey: string,
  cacheDuration: number
): GenericJobsCacheEntry | null {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null

    const entry: GenericJobsCacheEntry = JSON.parse(cached)

    // Check if cache is still valid
    if (Date.now() - entry.fetchedAt > cacheDuration) {
      localStorage.removeItem(cacheKey)
      return null
    }

    // Restore Date objects in jobs
    entry.jobs = entry.jobs.map((job) => ({
      ...job,
      postedAt: new Date(job.postedAt),
    }))

    // Restore Date in metadata (HNThread) if present
    if (entry.metadata?.postedAt) {
      entry.metadata.postedAt = new Date(entry.metadata.postedAt)
    }

    return entry
  } catch (error) {
    console.warn(`Failed to read cache ${cacheKey}:`, error)
    try {
      localStorage.removeItem(cacheKey)
    } catch (cleanupError) {
      console.warn(
        `Failed to cleanup corrupted cache ${cacheKey}:`,
        cleanupError
      )
    }
    return null
  }
}

/**
 * Write to cache with quota handling.
 */
export function writeCache(
  cacheKey: string,
  entry: GenericJobsCacheEntry
): boolean {
  return safeSetCache(cacheKey, entry)
}

/**
 * Create a cache entry from jobs and optional metadata.
 */
export function createCacheEntry(
  jobs: ParsedJob[],
  metadata?: HNThread
): GenericJobsCacheEntry {
  return {
    jobs,
    metadata,
    fetchedAt: Date.now(),
  }
}
