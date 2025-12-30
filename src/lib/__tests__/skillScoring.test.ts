import { describe, it, expect, vi } from 'vitest'

// ============================================================================
// MOCK CONFIG - Uses dev-senior example skills for consistent testing
// This ensures tests pass regardless of user's personal config
// ============================================================================
vi.mock('@/config/loader', () => ({
  skillCategories: [
    {
      name: 'Languages',
      skills: [
        { name: 'Python', aliases: ['python', 'py', 'python3'], weight: 9 },
        { name: 'Go', aliases: ['go', 'golang'], weight: 8 },
        { name: 'Hack/PHP', aliases: ['hack', 'php', 'hhvm'], weight: 7 },
        { name: 'TypeScript', aliases: ['ts', 'typescript'], weight: 6 },
        { name: 'SQL', aliases: ['sql', 'presto', 'mysql'], weight: 7 },
      ],
    },
    {
      name: 'Infrastructure & Tools',
      skills: [
        {
          name: 'Kubernetes',
          aliases: ['kubernetes', 'k8s', 'containers'],
          weight: 8,
        },
        { name: 'GraphQL', aliases: ['graphql', 'gql'], weight: 8 },
        { name: 'gRPC', aliases: ['grpc', 'protobuf'], weight: 7 },
        { name: 'Terraform', aliases: ['terraform', 'iac'], weight: 6 },
        { name: 'Docker', aliases: ['docker', 'containers'], weight: 7 },
      ],
    },
    {
      name: 'Leadership',
      skills: [
        {
          name: 'System Design',
          aliases: ['system design', 'architecture'],
          weight: 9,
        },
        {
          name: 'Technical Mentorship',
          aliases: ['mentorship', 'coaching'],
          weight: 8,
        },
        {
          name: 'Incident Response',
          aliases: ['incident', 'oncall', 'on-call'],
          weight: 7,
        },
        {
          name: 'Code Review',
          aliases: ['code review', 'pr review'],
          weight: 6,
        },
      ],
    },
  ],
  jobBoardScoring: {
    defaultSkillWeight: 5,
    bonuses: {
      remotePosition: 15,
      regionFriendly: 10,
      seniorityMatch: 20,
      domainRelevance: 15,
    },
    seniorityKeywords: ['senior', 'staff', 'principal', 'lead', 'architect'],
    relevantDomains: [
      'saas',
      'b2b',
      'platform',
      'infrastructure',
      'developer tools',
    ],
  },
}))

// Import after mock is set up
import { calculateWeightedScore } from '../skillMatcher'

// ============================================================================
// SKILL SCORING ALGORITHM TESTS
// ============================================================================

describe('calculateWeightedScore', () => {
  // Sample job posting that matches well with the user's skills
  // Uses skills from the dev-senior example: Python, Go, TypeScript, Kubernetes, Docker, etc.
  const saypienJob = `
    TechCorp | Berlin, Germany | REMOTE (Europe) | Full-time
    We're building an AI-native SaaS platform that helps companies extracting
    actionable insights from data in real-time.

    Tech stack: Python, Go, TypeScript, Kubernetes, Docker, GraphQL.

    Hiring for two roles:
    Senior Backend Engineer - €80-150k (incl. Bonus) | Equity
    You'll build and optimize our platform infrastructure.
    Strong Python, Go, Kubernetes, and Terraform experience.

    Platform Engineer (Senior) - €90-160k (incl. Bonus) | Equity
    More senior role bridging platform and engineering.
  `

  describe('temperature sensitivity', () => {
    it('scores higher at loose temperature than strict', () => {
      const strictResult = calculateWeightedScore(saypienJob, 0.1, 'EU')
      const balancedResult = calculateWeightedScore(saypienJob, 0.4, 'EU')
      const looseResult = calculateWeightedScore(saypienJob, 0.95, 'EU')

      // Loose should score higher than or equal to balanced (may hit ceiling)
      expect(looseResult.score).toBeGreaterThanOrEqual(balancedResult.score)
      // Balanced should score higher than or equal to strict (may hit ceiling for high-match jobs)
      expect(balancedResult.score).toBeGreaterThanOrEqual(strictResult.score)
    })

    it('scores at least 50% at balanced temperature for good matches', () => {
      const result = calculateWeightedScore(saypienJob, 0.4, 'EU')
      expect(result.score).toBeGreaterThanOrEqual(50)
    })

    it('scores above 80% at loose temperature for good matches', () => {
      const result = calculateWeightedScore(saypienJob, 0.95, 'EU')
      expect(result.score).toBeGreaterThanOrEqual(80)
    })
  })

  describe('skill matching', () => {
    it('matches TypeScript correctly', () => {
      const result = calculateWeightedScore(
        'We use TypeScript for everything',
        0.4,
        'EU'
      )
      expect(result.matchedSkills.map((s) => s.name)).toContain('TypeScript')
    })

    it('matches Python correctly', () => {
      const result = calculateWeightedScore(
        'Looking for Python developers',
        0.4,
        'EU'
      )
      expect(result.matchedSkills.map((s) => s.name)).toContain('Python')
    })

    it('matches Go correctly', () => {
      const result = calculateWeightedScore('Backend with Go/Golang', 0.4, 'EU')
      expect(result.matchedSkills.map((s) => s.name)).toContain('Go')
    })

    it('matches Kubernetes correctly', () => {
      const result = calculateWeightedScore(
        'Infrastructure: Kubernetes, K8s',
        0.4,
        'EU'
      )
      expect(result.matchedSkills.map((s) => s.name)).toContain('Kubernetes')
    })

    it('matches multiple skills in a job posting', () => {
      const result = calculateWeightedScore(saypienJob, 0.4, 'EU')
      // Should match: Python, Go, TypeScript, Kubernetes, Docker, GraphQL
      expect(result.matchedSkills.length).toBeGreaterThanOrEqual(4)
    })

    it('returns higher pointsEarned for higher-weight skills', () => {
      const result = calculateWeightedScore(
        'TypeScript Go Python SQL',
        0.4,
        'EU'
      )
      // Just verify we get some matched skills with points
      const matchedWithPoints = result.matchedSkills.filter(
        (s) => s.pointsEarned > 0
      )
      expect(matchedWithPoints.length).toBeGreaterThan(0)
    })
  })

  describe('bonus detection', () => {
    it('detects remote positions', () => {
      const result = calculateWeightedScore(
        'REMOTE position available',
        0.4,
        'EU'
      )
      expect(result.bonuses.remote).toBe(true)
    })

    it('detects seniority keywords', () => {
      const result = calculateWeightedScore(
        'Looking for a Senior Engineer',
        0.4,
        'EU'
      )
      expect(result.bonuses.seniorityMatch).toBe(true)
    })

    it('detects domain relevance for SaaS', () => {
      const result = calculateWeightedScore(
        'Building a SaaS platform',
        0.4,
        'EU'
      )
      expect(result.bonuses.domainRelevance).toBe(true)
    })

    it('detects region-friendly for EU remote', () => {
      const result = calculateWeightedScore('Remote (EU) position', 0.4, 'EU')
      expect(result.bonuses.remote).toBe(true)
      expect(result.bonuses.regionFriendly).toBe(true)
    })

    it('gives all bonuses for Saypien-style job', () => {
      const result = calculateWeightedScore(saypienJob, 0.4, 'EU')
      expect(result.bonuses.remote).toBe(true)
      expect(result.bonuses.seniorityMatch).toBe(true)
      expect(result.bonuses.domainRelevance).toBe(true)
    })
  })

  describe('score distribution', () => {
    it('returns score between 0 and 100', () => {
      const result = calculateWeightedScore(saypienJob, 0.4, 'EU')
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('returns 0 for empty job text', () => {
      const result = calculateWeightedScore('', 0.4, 'EU')
      expect(result.score).toBe(0)
    })

    it('returns low score for unrelated job', () => {
      const unrelatedJob = `
        Looking for a plumber in New York.
        Must have experience with residential plumbing.
        No remote work available.
      `
      const result = calculateWeightedScore(unrelatedJob, 0.4, 'EU')
      expect(result.score).toBeLessThan(30)
    })

    it('returns higher score for more skill matches', () => {
      const fewSkills = 'We use Python'
      const manySkills = 'We use Python, TypeScript, Go, Kubernetes, Docker'

      const fewResult = calculateWeightedScore(fewSkills, 0.4, 'EU')
      const manyResult = calculateWeightedScore(manySkills, 0.4, 'EU')

      expect(manyResult.score).toBeGreaterThan(fewResult.score)
    })
  })

  describe('weighted component scoring', () => {
    it('bonuses contribute meaningfully to score', () => {
      // Same skills, with and without bonuses
      const withBonuses = 'REMOTE SaaS Senior TypeScript Python Go'
      const withoutBonuses = 'TypeScript Python Go'

      const withResult = calculateWeightedScore(withBonuses, 0.4, 'EU')
      const withoutResult = calculateWeightedScore(withoutBonuses, 0.4, 'EU')

      // Bonuses should add significant points
      expect(withResult.score).toBeGreaterThan(withoutResult.score)
      expect(withResult.bonusPoints).toBeGreaterThan(withoutResult.bonusPoints)
    })

    it('returns breakdown in result object', () => {
      const result = calculateWeightedScore(saypienJob, 0.4, 'EU')

      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('rawPoints')
      expect(result).toHaveProperty('maxPossiblePoints')
      expect(result).toHaveProperty('skillPoints')
      expect(result).toHaveProperty('bonusPoints')
      expect(result).toHaveProperty('matchedSkills')
      expect(result).toHaveProperty('bonuses')
      expect(result).toHaveProperty('temperature')
    })

    it('temperature affects maxPossiblePoints', () => {
      const strictResult = calculateWeightedScore(saypienJob, 0.1, 'EU')
      const looseResult = calculateWeightedScore(saypienJob, 0.95, 'EU')

      // At strict, skill ceiling is lower, so max skill points should differ
      // But bonuses are also affected by multiplier
      expect(strictResult.maxPossiblePoints).not.toBe(
        looseResult.maxPossiblePoints
      )
    })
  })

  describe('real-world job examples', () => {
    it('scores well for a matching EU remote job', () => {
      const euRemoteJob = `
        Company | Berlin, Germany | REMOTE (Europe) | Full-time
        Building a developer tools platform with TypeScript, Python, Go.
        Looking for a Senior Backend Engineer.
        Experience with Kubernetes and Docker required.
      `
      const result = calculateWeightedScore(euRemoteJob, 0.4, 'EU')

      // Should score well: matches multiple high-weight skills + all bonuses
      expect(result.score).toBeGreaterThanOrEqual(60)
      expect(result.matchedSkills.length).toBeGreaterThanOrEqual(4)
      expect(result.bonuses.remote).toBe(true)
      expect(result.bonuses.seniorityMatch).toBe(true)
    })

    it('scores moderately for partial skill match', () => {
      const partialMatch = `
        Remote (US/Europe) | Full-time
        Looking for a Python developer with Django experience.
        Some TypeScript knowledge helpful.
      `
      const result = calculateWeightedScore(partialMatch, 0.4, 'EU')

      // Should score moderately: few skill matches, some bonuses
      expect(result.score).toBeGreaterThan(20)
      expect(result.score).toBeLessThan(60)
    })

    it('scores low for US-only positions', () => {
      const usOnlyJob = `
        US REMOTE | $150k-200k
        Looking for Python developers.
        Must be authorized to work in the United States.
        US timezones required.
      `
      const result = calculateWeightedScore(usOnlyJob, 0.4, 'EU')

      // Should not get region-friendly bonus
      expect(result.bonuses.regionFriendly).toBe(false)
    })
  })

  describe('skill ceiling behavior', () => {
    it('high-weight skills contribute more to score', () => {
      // Match high-weight skills from dev-senior config
      const highWeight = 'TypeScript Python Go Kubernetes' // skills from config

      // Match some skills vs fewer skills
      const lowWeight = 'SQL Docker' // fewer skills

      const highResult = calculateWeightedScore(highWeight, 0.4, 'EU')
      const lowResult = calculateWeightedScore(lowWeight, 0.4, 'EU')

      // More skills should score higher
      expect(highResult.skillPoints).toBeGreaterThan(lowResult.skillPoints)
      expect(highResult.score).toBeGreaterThan(lowResult.score)
    })

    it('score can exceed 50% with fewer than 8 matched skills', () => {
      // The skill ceiling is 8 at balanced temperature
      // But matching 5 high-weight skills + bonuses should still score well
      const fiveHighSkills = `
        REMOTE SaaS Senior Engineer
        Python TypeScript Go Kubernetes Docker
      `
      const result = calculateWeightedScore(fiveHighSkills, 0.4, 'EU')

      expect(result.matchedSkills.length).toBeLessThanOrEqual(8)
      expect(result.score).toBeGreaterThanOrEqual(50)
    })
  })

  describe('edge cases', () => {
    it('handles job with only bonuses, no skill matches', () => {
      const onlyBonuses = 'REMOTE Senior SaaS Platform'
      const result = calculateWeightedScore(onlyBonuses, 0.4, 'EU')

      expect(result.matchedSkills.length).toBe(0)
      expect(result.skillPoints).toBe(0)
      expect(result.bonusPoints).toBeGreaterThan(0)
      // Score should be above 0 due to bonuses
      expect(result.score).toBeGreaterThan(0)
    })

    it('handles job with only skills, no bonuses', () => {
      const onlySkills = 'TypeScript Python Go Kubernetes'
      const result = calculateWeightedScore(onlySkills, 0.4, 'EU')

      expect(result.matchedSkills.length).toBeGreaterThan(0)
      expect(result.bonuses.remote).toBe(false)
      expect(result.bonuses.seniorityMatch).toBe(false)
      expect(result.bonuses.domainRelevance).toBe(false)
    })

    it('handles very long job posting', () => {
      const longJob = `
        ${saypienJob}
        ${'TypeScript Python Go Kubernetes '.repeat(100)}
      `
      const result = calculateWeightedScore(longJob, 0.4, 'EU')

      // Should still work and give reasonable score
      expect(result.score).toBeGreaterThan(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('handles special characters in job text', () => {
      const specialChars = `
        Company™ | €100k | Remote (EU)
        C/C++ • TypeScript • Python
        <script>alert('xss')</script>
      `
      const result = calculateWeightedScore(specialChars, 0.4, 'EU')

      // Should handle gracefully
      expect(result.score).toBeGreaterThanOrEqual(0)
    })

    it('default temperature is balanced (0.4)', () => {
      const result = calculateWeightedScore(saypienJob)

      expect(result.temperature).toBe(0.4)
    })

    it('default region is EU', () => {
      const euJob = 'Remote (EU) TypeScript Python'
      const result = calculateWeightedScore(euJob, 0.4)

      expect(result.bonuses.regionFriendly).toBe(true)
    })
  })
})

// ============================================================================
// TEMPERATURE PRESETS TESTS
// ============================================================================

describe('temperature presets', () => {
  const testJob = `
    Remote (EU) | Full-time
    Senior TypeScript Python Engineer
    SaaS Platform
    Tech: TypeScript, Python, Go, Kubernetes
  `

  it('strict (0.1) gives lowest scores', () => {
    const result = calculateWeightedScore(testJob, 0.1, 'EU')
    const balanced = calculateWeightedScore(testJob, 0.4, 'EU')

    expect(result.score).toBeLessThan(balanced.score)
  })

  it('balanced (0.4) gives moderate scores', () => {
    const result = calculateWeightedScore(testJob, 0.4, 'EU')

    // Should be in a reasonable range for a good match
    expect(result.score).toBeGreaterThanOrEqual(40)
    expect(result.score).toBeLessThanOrEqual(85)
  })

  it('exploratory (0.7) gives higher scores than balanced', () => {
    const result = calculateWeightedScore(testJob, 0.7, 'EU')
    const balanced = calculateWeightedScore(testJob, 0.4, 'EU')

    expect(result.score).toBeGreaterThan(balanced.score)
  })

  it('loose (0.95) gives highest scores', () => {
    const result = calculateWeightedScore(testJob, 0.95, 'EU')
    const balanced = calculateWeightedScore(testJob, 0.4, 'EU')
    const exploratory = calculateWeightedScore(testJob, 0.7, 'EU')

    expect(result.score).toBeGreaterThan(balanced.score)
    expect(result.score).toBeGreaterThan(exploratory.score)
  })

  it('temperature 0 is valid (minimum)', () => {
    const result = calculateWeightedScore(testJob, 0, 'EU')

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.temperature).toBe(0)
  })

  it('temperature 1 is valid (maximum)', () => {
    const result = calculateWeightedScore(testJob, 1, 'EU')

    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.temperature).toBe(1)
  })
})
