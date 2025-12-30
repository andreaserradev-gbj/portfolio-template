import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RemoteOKJobService } from '../providers/RemoteOKJobService'
import { RemotiveJobService } from '../providers/RemotiveJobService'
import { JobicyJobService } from '../providers/JobicyJobService'
import { ArbeitnowJobService } from '../providers/ArbeitnowJobService'
import { HNJobService } from '../providers/HNJobService'
import type {
  RemoteOKApiJob,
  RemotiveApiJob,
  JobicyApiJob,
  ArbeitnowApiJob,
} from '@/types/providers'
import type { HNJobComment } from '@/types/hn'

// Mock the skillMatcher module
vi.mock('@/lib/skillMatcher', () => ({
  calculateWeightedScore: vi.fn(() => ({
    score: 75,
    matchedSkills: [{ name: 'TypeScript' }, { name: 'React' }],
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

// Mock the config loader
vi.mock('@/config/loader', () => ({
  userLocation: { country: 'IT' },
}))

describe('RemoteOKJobService', () => {
  let service: RemoteOKJobService

  beforeEach(() => {
    service = new RemoteOKJobService()
  })

  describe('transformJob', () => {
    const mockJob: RemoteOKApiJob = {
      id: '123',
      slug: 'senior-developer',
      epoch: 1700000000,
      date: '2024-01-15',
      company: 'Tech Corp',
      company_logo: 'https://example.com/logo.png',
      position: 'Senior Developer',
      tags: ['typescript', 'react'],
      description:
        '<p>We are looking for a <strong>TypeScript</strong> developer.</p>',
      location: 'Remote',
      apply_url: 'https://apply.example.com',
    }

    it('transforms API job to ParsedJob format', () => {
      const result = service.transformJob(mockJob)

      expect(result.id).toBe('remoteok-123')
      expect(result.company).toBe('Tech Corp')
      expect(result.title).toBe('Senior Developer')
      expect(result.source).toBe('remoteok')
      expect(result.isRemote).toBe(true)
      expect(result.tags).toEqual(['typescript', 'react'])
    })

    it('strips HTML from description', () => {
      const result = service.transformJob(mockJob)

      expect(result.rawText).toBe('We are looking for a TypeScript developer.')
      expect(result.htmlText).toBe(mockJob.description)
    })

    it('converts epoch to Date', () => {
      const result = service.transformJob(mockJob)

      expect(result.postedAt).toBeInstanceOf(Date)
      expect(result.postedAt.getTime()).toBe(1700000000 * 1000)
    })

    it('uses apply_url as sourceUrl when available', () => {
      const result = service.transformJob(mockJob)

      expect(result.sourceUrl).toBe('https://apply.example.com')
    })

    it('generates sourceUrl from slug when apply_url is missing', () => {
      const jobWithoutApplyUrl = { ...mockJob, apply_url: '' }
      const result = service.transformJob(jobWithoutApplyUrl)

      expect(result.sourceUrl).toBe(
        'https://remoteok.com/remote-jobs/senior-developer'
      )
    })
  })

  describe('configuration', () => {
    it('has correct provider ID', () => {
      expect(service.providerId).toBe('remoteok')
    })

    it('has 24 hour cache duration', () => {
      expect(service.cacheDuration).toBe(24 * 60 * 60 * 1000)
    })

    it('generates correct cache key', () => {
      expect(service.getCacheKeyForOptions()).toBe('remoteok-jobs-cache')
    })
  })
})

describe('RemotiveJobService', () => {
  let service: RemotiveJobService

  beforeEach(() => {
    service = new RemotiveJobService()
  })

  describe('transformJob', () => {
    const mockJob: RemotiveApiJob = {
      id: 456,
      url: 'https://remotive.com/job/456',
      title: 'Frontend Engineer',
      company_name: 'Startup Inc',
      company_logo: 'https://example.com/logo.png',
      category: 'Software Development',
      job_type: 'full_time',
      publication_date: '2024-01-15T10:00:00Z',
      candidate_required_location: 'Europe',
      salary: '$80k - $120k',
      description: '<p>Join our team as a <em>Frontend Engineer</em>.</p>',
    }

    it('transforms API job to ParsedJob format', () => {
      const result = service.transformJob(mockJob)

      expect(result.id).toBe('remotive-456')
      expect(result.company).toBe('Startup Inc')
      expect(result.title).toBe('Frontend Engineer')
      expect(result.source).toBe('remotive')
      expect(result.isRemote).toBe(true)
    })

    it('includes category and job_type as tags', () => {
      const result = service.transformJob(mockJob)

      expect(result.tags).toContain('Software Development')
      expect(result.tags).toContain('full_time')
    })

    it('parses publication_date as Date', () => {
      const result = service.transformJob(mockJob)

      expect(result.postedAt).toBeInstanceOf(Date)
    })

    it('sets location from candidate_required_location', () => {
      const result = service.transformJob(mockJob)

      expect(result.location).toBe('Europe')
    })
  })

  describe('configuration', () => {
    it('has correct provider ID', () => {
      expect(service.providerId).toBe('remotive')
    })

    it('generates correct cache key', () => {
      expect(service.getCacheKeyForOptions()).toBe('remotive-jobs-cache')
    })
  })
})

describe('JobicyJobService', () => {
  let service: JobicyJobService

  beforeEach(() => {
    service = new JobicyJobService()
  })

  describe('transformJob', () => {
    const mockJob: JobicyApiJob = {
      id: 789,
      url: 'https://jobicy.com/jobs/789',
      jobTitle: 'DevOps Engineer',
      companyName: 'Cloud Corp',
      companyLogo: 'https://example.com/logo.png',
      jobIndustry: 'Technology',
      jobType: 'Full-time',
      jobGeo: 'Worldwide',
      jobLevel: 'Senior',
      jobExcerpt: 'Looking for a DevOps expert.',
      jobDescription:
        '<p>We need a <b>DevOps Engineer</b> to manage our infrastructure.</p>',
      pubDate: '2024-01-15',
    }

    it('transforms API job to ParsedJob format', () => {
      const result = service.transformJob(mockJob)

      expect(result.id).toBe('jobicy-789')
      expect(result.company).toBe('Cloud Corp')
      expect(result.title).toBe('DevOps Engineer')
      expect(result.source).toBe('jobicy')
      expect(result.isRemote).toBe(true)
    })

    it('includes jobIndustry and jobLevel as tags', () => {
      const result = service.transformJob(mockJob)

      expect(result.tags).toContain('Technology')
      expect(result.tags).toContain('Senior')
    })

    it('sets location from jobGeo', () => {
      const result = service.transformJob(mockJob)

      expect(result.location).toBe('Worldwide')
    })
  })

  describe('configuration', () => {
    it('has correct provider ID', () => {
      expect(service.providerId).toBe('jobicy')
    })

    it('has 6 hour cache duration', () => {
      expect(service.cacheDuration).toBe(6 * 60 * 60 * 1000)
    })
  })
})

describe('ArbeitnowJobService', () => {
  let service: ArbeitnowJobService

  beforeEach(() => {
    service = new ArbeitnowJobService()
  })

  describe('transformJob', () => {
    const mockJob: ArbeitnowApiJob = {
      slug: 'backend-developer-123',
      company_name: 'German Tech GmbH',
      title: 'Backend Developer',
      description: '<p>Join us as a <strong>Backend Developer</strong>.</p>',
      remote: true,
      url: 'https://arbeitnow.com/jobs/backend-developer-123',
      tags: ['python', 'django'],
      job_types: ['full-time'],
      location: 'Berlin, Germany',
      created_at: 1700000000,
    }

    it('transforms API job to ParsedJob format', () => {
      const result = service.transformJob(mockJob)

      expect(result.id).toBe('arbeitnow-backend-developer-123')
      expect(result.company).toBe('German Tech GmbH')
      expect(result.title).toBe('Backend Developer')
      expect(result.source).toBe('arbeitnow')
    })

    it('sets isRemote from job.remote field', () => {
      const result = service.transformJob(mockJob)
      expect(result.isRemote).toBe(true)

      const nonRemoteJob = { ...mockJob, remote: false }
      const nonRemoteResult = service.transformJob(nonRemoteJob)
      // Should still be true because mocked isRemoteJob returns true
      expect(nonRemoteResult.isRemote).toBe(true)
    })

    it('converts created_at timestamp to Date', () => {
      const result = service.transformJob(mockJob)

      expect(result.postedAt).toBeInstanceOf(Date)
      expect(result.postedAt.getTime()).toBe(1700000000 * 1000)
    })
  })

  describe('cache key generation', () => {
    it('generates base cache key without options', () => {
      expect(service.getCacheKeyForOptions()).toBe('arbeitnow-jobs-cache')
    })

    it('generates base cache key with remoteOnly=false', () => {
      expect(service.getCacheKeyForOptions({ remoteOnly: false })).toBe(
        'arbeitnow-jobs-cache'
      )
    })

    it('generates remote cache key with remoteOnly=true', () => {
      expect(service.getCacheKeyForOptions({ remoteOnly: true })).toBe(
        'arbeitnow-jobs-cache-remote'
      )
    })
  })

  describe('configuration', () => {
    it('has correct provider ID', () => {
      expect(service.providerId).toBe('arbeitnow')
    })

    it('has 6 hour cache duration', () => {
      expect(service.cacheDuration).toBe(6 * 60 * 60 * 1000)
    })
  })
})

describe('HNJobService', () => {
  let service: HNJobService

  beforeEach(() => {
    service = new HNJobService()
  })

  describe('transformJob', () => {
    const mockComment: HNJobComment = {
      objectID: '12345',
      author: 'hiring_manager',
      comment_text:
        '<p>Acme Corp | Senior Engineer | Remote | $150k-200k</p><p>We build amazing products with <b>TypeScript</b> and React.</p>',
      created_at: '2024-01-15T10:00:00Z',
      created_at_i: 1705312800,
      story_id: 99999,
      parent_id: 99999,
    }

    it('transforms HN comment to ParsedJob format', () => {
      const result = service.transformJob(mockComment)

      expect(result.id).toBe('12345')
      expect(result.author).toBe('hiring_manager')
      expect(result.source).toBe('hn')
    })

    it('generates HN sourceUrl from objectID', () => {
      const result = service.transformJob(mockComment)

      expect(result.sourceUrl).toBe(
        'https://news.ycombinator.com/item?id=12345'
      )
      expect(result.hnUrl).toBe(result.sourceUrl)
    })

    it('strips HTML from comment_text', () => {
      const result = service.transformJob(mockComment)

      expect(result.rawText).not.toContain('<p>')
      expect(result.rawText).not.toContain('<b>')
      expect(result.htmlText).toBe(mockComment.comment_text)
    })

    it('parses company name from comment', () => {
      const result = service.transformJob(mockComment)

      // Company is extracted by mocked parseCompanyName
      expect(result.company).toBe('Test Company')
    })
  })

  describe('configuration', () => {
    it('has correct provider ID', () => {
      expect(service.providerId).toBe('hn')
    })

    it('has 24 hour cache duration', () => {
      expect(service.cacheDuration).toBe(24 * 60 * 60 * 1000)
    })

    it('generates correct cache key', () => {
      expect(service.getCacheKeyForOptions()).toBe('hn-jobs-cache')
    })
  })
})

describe('JobService base class behavior', () => {
  let service: RemoteOKJobService

  beforeEach(() => {
    service = new RemoteOKJobService()
  })

  describe('stripHtml helper', () => {
    it('removes HTML tags', () => {
      const mockJob: RemoteOKApiJob = {
        id: '1',
        slug: 'test',
        epoch: 1700000000,
        date: '2024-01-15',
        company: 'Test',
        company_logo: '',
        position: 'Dev',
        tags: [],
        description: '<p>Hello <b>World</b></p>',
        location: '',
        apply_url: '',
      }

      const result = service.transformJob(mockJob)
      expect(result.rawText).toBe('Hello World')
    })

    it('handles nested tags', () => {
      const mockJob: RemoteOKApiJob = {
        id: '1',
        slug: 'test',
        epoch: 1700000000,
        date: '2024-01-15',
        company: 'Test',
        company_logo: '',
        position: 'Dev',
        tags: [],
        description: '<div><p><span>Nested</span> content</p></div>',
        location: '',
        apply_url: '',
      }

      const result = service.transformJob(mockJob)
      expect(result.rawText).toBe('Nested content')
    })
  })
})
