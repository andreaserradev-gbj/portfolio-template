import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RemoteOKJobService } from '../providers/RemoteOKJobService'
import { HNJobService } from '../providers/HNJobService'
import type { ParsedJob } from '@/types/hn'

// Mock the skillMatcher module
vi.mock('@/lib/skillMatcher', () => ({
  calculateWeightedScore: vi.fn(() => ({
    score: 50,
    matchedSkills: [],
  })),
  classifyJobLocation: vi.fn(() => ({
    type: 'REMOTE_GLOBAL',
    primaryRegions: [],
    secondaryRegions: [],
    onSiteLocations: [],
    excludedRegions: [],
    confidence: 'high',
  })),
  getRegionFromCountry: vi.fn(() => 'EU'),
  isRemoteJob: vi.fn(() => true),
  parseJobLocation: vi.fn(() => 'Remote'),
  parseCompanyName: vi.fn(() => 'Test Company'),
}))

vi.mock('@/config/loader', () => ({
  userLocation: { country: 'IT' },
}))

// Helper to create a mock ParsedJob
function createMockJob(overrides: Partial<ParsedJob> = {}): ParsedJob {
  return {
    id: 'test-1',
    company: 'Test Co',
    rawText: 'Test job description',
    htmlText: '<p>Test job description</p>',
    postedAt: new Date(),
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

describe('processJobs', () => {
  describe('RemoteOKJobService', () => {
    let service: RemoteOKJobService

    beforeEach(() => {
      service = new RemoteOKJobService()
    })

    // Access protected method for testing
    const callProcessJobs = (
      service: RemoteOKJobService,
      jobs: ParsedJob[]
    ) => {
      return (
        service as unknown as {
          processJobs: (jobs: ParsedJob[]) => ParsedJob[]
        }
      ).processJobs(jobs)
    }

    it('sorts jobs by matchScore descending', () => {
      const jobs = [
        createMockJob({ id: '1', matchScore: 30 }),
        createMockJob({ id: '2', matchScore: 80 }),
        createMockJob({ id: '3', matchScore: 50 }),
      ]

      const result = callProcessJobs(service, jobs)

      expect(result[0].matchScore).toBe(80)
      expect(result[1].matchScore).toBe(50)
      expect(result[2].matchScore).toBe(30)
    })

    it('filters out jobs older than maxAgeDays', () => {
      const now = new Date()
      const oldDate = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000) // 31 days ago
      const recentDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago

      const jobs = [
        createMockJob({ id: 'old', postedAt: oldDate }),
        createMockJob({ id: 'recent', postedAt: recentDate }),
      ]

      const result = callProcessJobs(service, jobs)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('recent')
    })

    it('limits results to maxJobs (200)', () => {
      const jobs = Array.from({ length: 250 }, (_, i) =>
        createMockJob({ id: `job-${i}`, matchScore: i })
      )

      const result = callProcessJobs(service, jobs)

      expect(result).toHaveLength(200)
    })

    it('returns jobs sorted by score after limiting', () => {
      const jobs = Array.from({ length: 250 }, (_, i) =>
        createMockJob({ id: `job-${i}`, matchScore: i })
      )

      const result = callProcessJobs(service, jobs)

      // Highest scores should be first
      expect(result[0].matchScore).toBe(249)
      expect(result[199].matchScore).toBe(50)
    })

    it('handles empty input', () => {
      const result = callProcessJobs(service, [])

      expect(result).toEqual([])
    })

    it('handles jobs at exactly maxAgeDays boundary', () => {
      const now = new Date()
      const exactlyMaxAge = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // Exactly 30 days ago

      const jobs = [createMockJob({ id: 'boundary', postedAt: exactlyMaxAge })]

      const result = callProcessJobs(service, jobs)

      // Should be included (>= cutoff, not >)
      expect(result).toHaveLength(1)
    })
  })

  describe('HNJobService', () => {
    let service: HNJobService

    beforeEach(() => {
      service = new HNJobService()
    })

    const callProcessJobs = (service: HNJobService, jobs: ParsedJob[]) => {
      return (
        service as unknown as {
          processJobs: (jobs: ParsedJob[]) => ParsedJob[]
        }
      ).processJobs(jobs)
    }

    it('filters out jobs with short rawText (< 50 chars)', () => {
      const jobs = [
        createMockJob({ id: 'short', rawText: 'Too short' }),
        createMockJob({
          id: 'long',
          rawText:
            'This is a much longer job description that should pass the minimum length filter.',
        }),
      ]

      const result = callProcessJobs(service, jobs)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('long')
    })

    it('filters empty rawText', () => {
      const jobs = [
        createMockJob({ id: 'empty', rawText: '' }),
        createMockJob({
          id: 'valid',
          rawText:
            'This job posting has enough content to pass the minimum character requirement.',
        }),
      ]

      const result = callProcessJobs(service, jobs)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('valid')
    })

    it('sorts by matchScore descending', () => {
      const jobs = [
        createMockJob({ id: '1', matchScore: 20, rawText: 'A'.repeat(100) }),
        createMockJob({ id: '2', matchScore: 90, rawText: 'B'.repeat(100) }),
        createMockJob({ id: '3', matchScore: 60, rawText: 'C'.repeat(100) }),
      ]

      const result = callProcessJobs(service, jobs)

      expect(result[0].matchScore).toBe(90)
      expect(result[1].matchScore).toBe(60)
      expect(result[2].matchScore).toBe(20)
    })

    it('limits to maxJobs after filtering', () => {
      const jobs = Array.from({ length: 250 }, (_, i) =>
        createMockJob({
          id: `job-${i}`,
          matchScore: i,
          rawText:
            'This is a sufficiently long job posting description that passes the minimum length filter.',
        })
      )

      const result = callProcessJobs(service, jobs)

      expect(result).toHaveLength(200)
    })
  })
})

describe('service config validation', () => {
  it('all services have valid maxJobs', () => {
    const services = [new RemoteOKJobService(), new HNJobService()]

    for (const service of services) {
      const config = (service as unknown as { config: { maxJobs: number } })
        .config
      expect(config.maxJobs).toBeGreaterThan(0)
      expect(config.maxJobs).toBeLessThanOrEqual(1000)
    }
  })

  it('all services have valid maxAgeDays', () => {
    const services = [new RemoteOKJobService(), new HNJobService()]

    for (const service of services) {
      const config = (service as unknown as { config: { maxAgeDays: number } })
        .config
      expect(config.maxAgeDays).toBeGreaterThan(0)
      expect(config.maxAgeDays).toBeLessThanOrEqual(365)
    }
  })

  it('all services have valid cacheDuration', () => {
    const services = [new RemoteOKJobService(), new HNJobService()]

    for (const service of services) {
      expect(service.cacheDuration).toBeGreaterThan(0)
      expect(service.cacheDuration).toBeLessThanOrEqual(7 * 24 * 60 * 60 * 1000) // Max 7 days
    }
  })
})
