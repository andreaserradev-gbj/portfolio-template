import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  JOB_CACHE_KEYS,
  clearAllJobCaches,
  clearOtherJobCaches,
  safeSetCache,
  prepareJobsForCache,
  readCache,
  writeCache,
  createCacheEntry,
  type GenericJobsCacheEntry,
} from '../jobsCache'
import type { ParsedJob } from '@/types/hn'

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get store() {
      return store
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
})

// Helper to create mock ParsedJob
function createMockJob(overrides: Partial<ParsedJob> = {}): ParsedJob {
  return {
    id: 'test-1',
    company: 'Test Co',
    rawText: 'Test job',
    htmlText: '<p>Test job</p>',
    postedAt: new Date('2024-01-15T10:00:00Z'),
    author: 'test',
    matchScore: 50,
    matchedSkills: [],
    sourceUrl: 'https://example.com',
    hnUrl: 'https://example.com',
    isRemote: true,
    location: null,
    locationData: {
      type: 'REMOTE_GLOBAL',
      primaryRegions: [],
      secondaryRegions: [],
      onSiteLocations: [],
      excludedRegions: [],
      confidence: 'high',
    },
    source: 'remoteok',
    ...overrides,
  }
}

describe('JOB_CACHE_KEYS', () => {
  it('contains all expected cache keys', () => {
    expect(JOB_CACHE_KEYS).toContain('hn-jobs-cache')
    expect(JOB_CACHE_KEYS).toContain('arbeitnow-jobs-cache')
    expect(JOB_CACHE_KEYS).toContain('arbeitnow-jobs-cache-remote')
    expect(JOB_CACHE_KEYS).toContain('remoteok-jobs-cache')
    expect(JOB_CACHE_KEYS).toContain('jobicy-jobs-cache')
    expect(JOB_CACHE_KEYS).toContain('remotive-jobs-cache')
  })

  it('has correct number of cache keys', () => {
    expect(JOB_CACHE_KEYS).toHaveLength(6)
  })
})

describe('clearAllJobCaches', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('removes all job cache keys from localStorage', () => {
    // Set up some cache entries
    JOB_CACHE_KEYS.forEach((key) => {
      mockLocalStorage.setItem(key, 'test-data')
    })

    clearAllJobCaches()

    expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(
      JOB_CACHE_KEYS.length
    )
    JOB_CACHE_KEYS.forEach((key) => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key)
    })
  })
})

describe('clearOtherJobCaches', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('removes all cache keys except the specified one', () => {
    const keepKey = 'hn-jobs-cache'

    clearOtherJobCaches(keepKey)

    expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(keepKey)
    JOB_CACHE_KEYS.filter((k) => k !== keepKey).forEach((key) => {
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key)
    })
  })

  it('does not remove the keepKey', () => {
    const keepKey = 'remoteok-jobs-cache'
    mockLocalStorage.setItem(keepKey, 'important-data')

    clearOtherJobCaches(keepKey)

    expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith(keepKey)
  })
})

describe('safeSetCache', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('stores stringified value in localStorage', () => {
    const key = 'test-key'
    const value = { data: 'test' }

    const result = safeSetCache(key, value)

    expect(result).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      key,
      JSON.stringify(value)
    )
  })

  it('returns true on success', () => {
    const result = safeSetCache('key', { value: 1 })

    expect(result).toBe(true)
  })

  it('handles quota exceeded by clearing other caches and retrying', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError')
    mockLocalStorage.setItem
      .mockImplementationOnce(() => {
        throw quotaError
      })
      .mockImplementationOnce(() => {
        // Success on retry
      })

    const result = safeSetCache('test-key', { data: 'test' })

    expect(result).toBe(true)
    // Should have cleared other caches
    expect(mockLocalStorage.removeItem).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('returns false if retry also fails', () => {
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError')
    mockLocalStorage.setItem.mockImplementation(() => {
      throw quotaError
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = safeSetCache('test-key', { data: 'very-large' })

    expect(result).toBe(false)
    consoleSpy.mockRestore()
  })

  it('returns false for non-quota errors', () => {
    mockLocalStorage.setItem.mockImplementation(() => {
      throw new Error('Some other error')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = safeSetCache('test-key', { data: 'test' })

    expect(result).toBe(false)
    consoleSpy.mockRestore()
  })
})

describe('prepareJobsForCache', () => {
  it('removes htmlText field from jobs', () => {
    const jobs = [
      createMockJob({ id: '1', htmlText: '<p>HTML content 1</p>' }),
      createMockJob({ id: '2', htmlText: '<p>HTML content 2</p>' }),
    ] as unknown as Record<string, unknown>[]

    const result = prepareJobsForCache(jobs)

    result.forEach((job) => {
      expect(job).not.toHaveProperty('htmlText')
    })
  })

  it('preserves all other fields', () => {
    const jobs = [
      createMockJob({
        id: '1',
        company: 'Test Co',
        rawText: 'Test',
        matchScore: 75,
      }),
    ] as unknown as Record<string, unknown>[]

    const result = prepareJobsForCache(jobs)

    expect(result[0].id).toBe('1')
    expect(result[0].company).toBe('Test Co')
    expect(result[0].rawText).toBe('Test')
    expect(result[0].matchScore).toBe(75)
  })

  it('handles empty array', () => {
    const result = prepareJobsForCache([])

    expect(result).toEqual([])
  })
})

describe('readCache', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })

  it('returns null for non-existent cache', () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    const result = readCache('non-existent', 60000)

    expect(result).toBeNull()
  })

  it('returns parsed cache entry when valid', () => {
    const entry: GenericJobsCacheEntry = {
      jobs: [createMockJob()],
      fetchedAt: Date.now(),
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(entry))

    const result = readCache('test-cache', 60 * 60 * 1000)

    expect(result).not.toBeNull()
    expect(result?.jobs).toHaveLength(1)
  })

  it('returns null and removes expired cache', () => {
    const entry: GenericJobsCacheEntry = {
      jobs: [createMockJob()],
      fetchedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(entry))

    const result = readCache('test-cache', 60 * 60 * 1000) // 1 hour duration

    expect(result).toBeNull()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-cache')
  })

  it('restores Date objects in jobs', () => {
    const dateStr = '2024-01-15T10:00:00.000Z'
    const entry: GenericJobsCacheEntry = {
      jobs: [{ ...createMockJob(), postedAt: dateStr as unknown as Date }],
      fetchedAt: Date.now(),
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(entry))

    const result = readCache('test-cache', 60 * 60 * 1000)

    expect(result?.jobs[0].postedAt).toBeInstanceOf(Date)
  })

  it('restores Date in metadata when present', () => {
    const entry: GenericJobsCacheEntry = {
      jobs: [],
      metadata: {
        id: 'thread-1',
        title: 'Test Thread',
        postedAt: '2024-01-15T10:00:00.000Z' as unknown as Date,
        commentCount: 100,
      },
      fetchedAt: Date.now(),
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(entry))

    const result = readCache('test-cache', 60 * 60 * 1000)

    expect(result?.metadata?.postedAt).toBeInstanceOf(Date)
  })

  it('handles corrupted cache gracefully', () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = readCache('corrupted-cache', 60000)

    expect(result).toBeNull()
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('corrupted-cache')
    consoleSpy.mockRestore()
  })
})

describe('writeCache', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
    // Reset setItem to default implementation
    mockLocalStorage.setItem.mockImplementation(
      (key: string, value: string) => {
        mockLocalStorage.store[key] = value
      }
    )
  })

  it('writes cache entry using safeSetCache', () => {
    const entry: GenericJobsCacheEntry = {
      jobs: [createMockJob()],
      fetchedAt: Date.now(),
    }

    const result = writeCache('test-cache', entry)

    expect(result).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'test-cache',
      JSON.stringify(entry)
    )
  })
})

describe('createCacheEntry', () => {
  it('creates entry with jobs and fetchedAt', () => {
    const jobs = [createMockJob()]
    const before = Date.now()

    const entry = createCacheEntry(jobs)

    const after = Date.now()
    expect(entry.jobs).toBe(jobs)
    expect(entry.fetchedAt).toBeGreaterThanOrEqual(before)
    expect(entry.fetchedAt).toBeLessThanOrEqual(after)
    expect(entry.metadata).toBeUndefined()
  })

  it('includes metadata when provided', () => {
    const jobs = [createMockJob()]
    const metadata = {
      id: 'thread-1',
      title: 'Test Thread',
      postedAt: new Date(),
      commentCount: 50,
    }

    const entry = createCacheEntry(jobs, metadata)

    expect(entry.metadata).toBe(metadata)
  })

  it('creates entry with empty jobs array', () => {
    const entry = createCacheEntry([])

    expect(entry.jobs).toEqual([])
    expect(entry.fetchedAt).toBeDefined()
  })
})
