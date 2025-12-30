import { describe, it, expect } from 'vitest'
import {
  classifyJobLocation,
  matchesRemoteGlobalFilter,
  matchesRemoteEUFilter,
  matchesOnSiteEUFilter,
  matchesAnyEUFilter,
  analyzeLocationPriority,
  detectMultiRolePost,
  appearsUSCentric,
} from '../skillMatcher'

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

describe('analyzeLocationPriority', () => {
  describe('EU primary detection', () => {
    it('detects EU in parentheses as primary', () => {
      const result = analyzeLocationPriority('Remote (EU)')
      expect(result.primaryRegions).toContain('EU')
      expect(result.secondaryRegions).not.toContain('EU')
    })

    it('detects EU-only as primary', () => {
      const result = analyzeLocationPriority('Remote - EU only')
      expect(result.primaryRegions).toContain('EU')
    })

    it('detects Europe-based remote as primary', () => {
      const result = analyzeLocationPriority('Europe-based remote position')
      expect(result.primaryRegions).toContain('EU')
    })

    it('detects EU timezone requirement as primary', () => {
      const result = analyzeLocationPriority('EU timezone preferred')
      expect(result.primaryRegions).toContain('EU')
    })
  })

  describe('US primary detection', () => {
    it('detects US in parentheses as primary', () => {
      const result = analyzeLocationPriority('Remote (US)')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('detects US REMOTE as primary', () => {
      const result = analyzeLocationPriority('US REMOTE | Full-time')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('detects US timezone as primary', () => {
      const result = analyzeLocationPriority('US timezones only')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('detects GMT-4 to GMT-8 as US primary', () => {
      const result = analyzeLocationPriority(
        'Remote (North America, GMT-8–GMT-5)'
      )
      expect(result.primaryRegions).toContain('Americas')
    })
  })

  describe('EU secondary detection', () => {
    it('detects EU after US/Canada as secondary', () => {
      const result = analyzeLocationPriority('Remote (US/Canada/Europe)')
      expect(result.secondaryRegions).toContain('EU')
      expect(result.primaryRegions).not.toContain('EU')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('detects "US or Europe" as EU secondary', () => {
      const result = analyzeLocationPriority('US or Europe')
      expect(result.secondaryRegions).toContain('EU')
      expect(result.primaryRegions).toContain('Americas')
    })
  })

  describe('exclusion detection', () => {
    it('detects "no US citizens" as Americas exclusion', () => {
      const result = analyzeLocationPriority('No US citizens')
      expect(result.excludedRegions).toContain('Americas')
    })

    it('detects "excluding EU" as EU exclusion', () => {
      const result = analyzeLocationPriority('Remote worldwide, excluding EU')
      expect(result.excludedRegions).toContain('EU')
    })
  })
})

describe('detectMultiRolePost', () => {
  it('detects single role as not multi-role', () => {
    const result = detectMultiRolePost('Senior Engineer | Remote | Full-time')
    expect(result.isMultiRole).toBe(false)
  })

  it('detects multiple roles with same location as not multi-role', () => {
    const result = detectMultiRolePost(
      'Senior Engineer - Remote\nJunior Engineer - Remote'
    )
    expect(result.isMultiRole).toBe(false)
  })

  it('detects multi-role post with mixed locations', () => {
    const result = detectMultiRolePost(
      'Marketing Lead - Remote friendly | DevRel Engineer - San Francisco | Staff Engineer - San Francisco'
    )
    expect(result.isMultiRole).toBe(true)
    expect(result.roleBreakdown?.remoteRoles).toBeGreaterThan(0)
    expect(result.roleBreakdown?.onSiteRoles).toBeGreaterThan(0)
  })

  it('detects pipe-separated multi-role post', () => {
    const result = detectMultiRolePost(
      'Senior Developer - NYC | Designer - Remote | Manager - SF'
    )
    expect(result.isMultiRole).toBe(true)
  })
})

describe('appearsUSCentric', () => {
  it('returns true for 3+ US cities without EU mention', () => {
    const result = appearsUSCentric(
      'REMOTE or San Francisco, Los Angeles, Chicago, Boston'
    )
    expect(result).toBe(true)
  })

  it('returns false for US cities when EU is mentioned', () => {
    const result = appearsUSCentric(
      'San Francisco, Los Angeles, Chicago, or Europe'
    )
    expect(result).toBe(false)
  })

  it('returns true for US timezone mention', () => {
    const result = appearsUSCentric('Remote | US timezones')
    expect(result).toBe(true)
  })

  it('returns true for USD salary without global mention', () => {
    const result = appearsUSCentric('$150k - $200k | Remote')
    expect(result).toBe(true)
  })

  it('returns false for USD salary with worldwide mention', () => {
    const result = appearsUSCentric('$150k - $200k | Remote worldwide')
    expect(result).toBe(false)
  })

  it('returns false for no US-centric signals', () => {
    const result = appearsUSCentric('Remote | Full-time | Berlin')
    expect(result).toBe(false)
  })
})

// ============================================================================
// CLASSIFICATION TESTS
// ============================================================================

describe('classifyJobLocation', () => {
  describe('REMOTE_GLOBAL classification', () => {
    it('classifies "Fully remote, work from anywhere"', () => {
      const result = classifyJobLocation('Fully remote, work from anywhere')
      expect(result.type).toBe('REMOTE_GLOBAL')
    })

    it('classifies "100% remote, distributed team"', () => {
      const result = classifyJobLocation('100% remote, distributed team')
      expect(result.type).toBe('REMOTE_GLOBAL')
    })

    it('classifies "Remote-first, async company"', () => {
      const result = classifyJobLocation('Remote-first, async company')
      expect(result.type).toBe('REMOTE_GLOBAL')
    })

    it('classifies "Remote worldwide"', () => {
      const result = classifyJobLocation('Remote worldwide | Senior Engineer')
      expect(result.type).toBe('REMOTE_GLOBAL')
    })
  })

  describe('REMOTE_REGIONAL classification', () => {
    it('classifies "Remote (US, Canada)" as US primary', () => {
      const result = classifyJobLocation('Remote (US, Canada)')
      expect(result.type).toBe('REMOTE_REGIONAL')
      expect(result.primaryRegions).toContain('Americas')
      expect(result.primaryRegions).not.toContain('EU')
    })

    it('classifies "US REMOTE | Full-time" as US primary', () => {
      const result = classifyJobLocation('US REMOTE | Full-time')
      expect(result.type).toBe('REMOTE_REGIONAL')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('classifies "Remote (North America, GMT-8–GMT-5)" as US primary', () => {
      const result = classifyJobLocation(
        'Remote (North America, GMT-8–GMT-5) | Full-time'
      )
      expect(result.type).toBe('REMOTE_REGIONAL')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('classifies "Full time (US timezones)" as US primary', () => {
      const result = classifyJobLocation('Full time (US timezones) | Remote')
      expect(result.type).toBe('REMOTE_REGIONAL')
      expect(result.primaryRegions).toContain('Americas')
    })

    it('classifies "Remote (US/Canada/Europe)" as EU secondary', () => {
      const result = classifyJobLocation('Remote (US/Canada/Europe)')
      expect(result.type).toBe('REMOTE_REGIONAL')
      expect(result.secondaryRegions).toContain('EU')
      expect(result.primaryRegions).not.toContain('EU')
    })

    it('classifies "Remote (EU)" as EU primary', () => {
      const result = classifyJobLocation('Remote (EU) | Senior Engineer')
      expect(result.type).toBe('REMOTE_REGIONAL')
      expect(result.primaryRegions).toContain('EU')
    })
  })

  describe('MIXED_ROLES classification', () => {
    it('classifies multi-role post with remote and on-site', () => {
      const result = classifyJobLocation(
        'Marketing Lead (Developers) - Remote friendly | Forward Deployed Engineer- Software Engineer II | DevRel Engineer - San Francisco| Staff Full Stack Engineer - San Francisco | Sr Full Stack Engineer - San Francisco'
      )
      expect(result.type).toBe('MIXED_ROLES')
    })
  })

  describe('ON_SITE classification', () => {
    it('classifies "ONSITE in Zurich (Switzerland)" as EU on-site', () => {
      const result = classifyJobLocation('ONSITE in Zurich (Switzerland)')
      expect(result.type).toBe('ON_SITE')
      expect(result.onSiteLocations).toContain('Zurich')
    })

    it('classifies "In-person, SF office" as US on-site', () => {
      const result = classifyJobLocation('In-person, SF office')
      expect(result.type).toBe('ON_SITE')
    })

    it('classifies location with no remote mention as on-site', () => {
      const result = classifyJobLocation('Berlin | Full-time | Senior Engineer')
      expect(result.type).toBe('ON_SITE')
      expect(result.onSiteLocations).toContain('Berlin')
    })
  })

  describe('HYBRID classification', () => {
    it('classifies "Boston, MA / SF Hybrid or Remote | US timezones"', () => {
      const result = classifyJobLocation(
        'Boston, MA / SF Hybrid or Remote | US timezones'
      )
      expect(result.type).toBe('HYBRID')
    })

    it('classifies "Hybrid - 2 days in office"', () => {
      const result = classifyJobLocation('Hybrid - 2 days in office | London')
      expect(result.type).toBe('HYBRID')
    })
  })
})

// ============================================================================
// FILTER MATCHING TESTS
// ============================================================================

describe('matchesRemoteGlobalFilter', () => {
  it('returns true for REMOTE_GLOBAL', () => {
    const locationData = classifyJobLocation('Fully remote, work from anywhere')
    expect(matchesRemoteGlobalFilter(locationData)).toBe(true)
  })

  it('returns false for REMOTE_REGIONAL', () => {
    const locationData = classifyJobLocation('Remote (US, Canada)')
    expect(matchesRemoteGlobalFilter(locationData)).toBe(false)
  })

  it('returns false for ON_SITE', () => {
    const locationData = classifyJobLocation('ONSITE in Berlin')
    expect(matchesRemoteGlobalFilter(locationData)).toBe(false)
  })

  it('returns false for HYBRID', () => {
    const locationData = classifyJobLocation('Hybrid | London')
    expect(matchesRemoteGlobalFilter(locationData)).toBe(false)
  })

  it('returns false for MIXED_ROLES', () => {
    const locationData = classifyJobLocation(
      'Engineer - Remote | Designer - SF'
    )
    expect(matchesRemoteGlobalFilter(locationData)).toBe(false)
  })
})

describe('matchesRemoteEUFilter', () => {
  it('returns true for REMOTE_GLOBAL', () => {
    const locationData = classifyJobLocation('Fully remote, work from anywhere')
    expect(matchesRemoteEUFilter(locationData)).toBe(true)
  })

  it('returns true for REMOTE_REGIONAL with EU primary', () => {
    const locationData = classifyJobLocation('Remote (EU) | Senior Engineer')
    expect(matchesRemoteEUFilter(locationData)).toBe(true)
  })

  it('returns false for REMOTE_REGIONAL with EU secondary (critical!)', () => {
    const locationData = classifyJobLocation('Remote (US/Canada/Europe)')
    expect(matchesRemoteEUFilter(locationData)).toBe(false)
  })

  it('returns false for REMOTE_REGIONAL with US primary', () => {
    const locationData = classifyJobLocation('Remote (US, Canada)')
    expect(matchesRemoteEUFilter(locationData)).toBe(false)
  })

  it('returns false for HYBRID', () => {
    const locationData = classifyJobLocation('Hybrid | New York')
    expect(matchesRemoteEUFilter(locationData)).toBe(false)
  })

  it('returns false for ON_SITE', () => {
    const locationData = classifyJobLocation('On-site | San Francisco')
    expect(matchesRemoteEUFilter(locationData)).toBe(false)
  })

  it('returns false for MIXED_ROLES', () => {
    const locationData = classifyJobLocation(
      'Marketing Lead - Remote | Engineer - SF'
    )
    expect(matchesRemoteEUFilter(locationData)).toBe(false)
  })
})

describe('matchesOnSiteEUFilter', () => {
  it('returns true for ON_SITE with EU city', () => {
    const locationData = classifyJobLocation('ONSITE in Zurich')
    expect(matchesOnSiteEUFilter(locationData)).toBe(true)
  })

  it('returns true for HYBRID with EU city', () => {
    const locationData = classifyJobLocation('Hybrid | London')
    expect(matchesOnSiteEUFilter(locationData)).toBe(true)
  })

  it('returns false for ON_SITE with US city', () => {
    const locationData = classifyJobLocation('On-site | San Francisco')
    expect(matchesOnSiteEUFilter(locationData)).toBe(false)
  })

  it('returns false for REMOTE_GLOBAL', () => {
    const locationData = classifyJobLocation('Fully remote worldwide')
    expect(matchesOnSiteEUFilter(locationData)).toBe(false)
  })

  it('returns false for REMOTE_REGIONAL', () => {
    const locationData = classifyJobLocation('Remote (EU)')
    expect(matchesOnSiteEUFilter(locationData)).toBe(false)
  })
})

describe('matchesAnyEUFilter', () => {
  it('returns true for REMOTE_GLOBAL', () => {
    const locationData = classifyJobLocation('Fully remote, work from anywhere')
    expect(matchesAnyEUFilter(locationData)).toBe(true)
  })

  it('returns true for REMOTE_REGIONAL with EU primary', () => {
    const locationData = classifyJobLocation('Remote (EU)')
    expect(matchesAnyEUFilter(locationData)).toBe(true)
  })

  it('returns true for ON_SITE with EU city', () => {
    const locationData = classifyJobLocation('ONSITE Berlin')
    expect(matchesAnyEUFilter(locationData)).toBe(true)
  })

  it('returns true for HYBRID with EU city', () => {
    const locationData = classifyJobLocation('Hybrid | Amsterdam')
    expect(matchesAnyEUFilter(locationData)).toBe(true)
  })

  it('returns false for REMOTE_REGIONAL with US primary and no EU', () => {
    const locationData = classifyJobLocation('Remote (US, Canada)')
    expect(matchesAnyEUFilter(locationData)).toBe(false)
  })

  it('returns false for ON_SITE with US city', () => {
    const locationData = classifyJobLocation('On-site San Francisco')
    expect(matchesAnyEUFilter(locationData)).toBe(false)
  })
})

// ============================================================================
// REAL-WORLD PROBLEMATIC JOB TESTS
// ============================================================================

describe('Fusionbox job post (US work authorization required)', () => {
  const fusionboxJob = `Fusionbox | Python + TypeScript Engineers | United States| Full-time | REMOTE (Legal to work in the US)`

  it('classifies as REMOTE_REGIONAL with Americas primary', () => {
    const result = classifyJobLocation(fusionboxJob)
    expect(result.type).toBe('REMOTE_REGIONAL')
    expect(result.primaryRegions).toContain('Americas')
  })

  it('should NOT match Remote Global filter', () => {
    const result = classifyJobLocation(fusionboxJob)
    expect(matchesRemoteGlobalFilter(result)).toBe(false)
  })

  it('should NOT match Remote EU filter', () => {
    const result = classifyJobLocation(fusionboxJob)
    expect(matchesRemoteEUFilter(result)).toBe(false)
  })
})

describe('Trunk job post (MIXED_ROLES with US on-site)', () => {
  const trunkJob = `Trunk | https://trunk.io
Marketing Lead (Developers) - Remote friendly | Forward Deployed Engineer- Software Engineer II | DevRel Engineer - San Francisco| Staff Full Stack Engineer - San Francisco | Sr Full Stack Engineer - San Francisco`

  it('classifies as MIXED_ROLES', () => {
    const result = classifyJobLocation(trunkJob)
    expect(result.type).toBe('MIXED_ROLES')
  })

  it('should NOT match Any EU filter (US on-site only)', () => {
    const result = classifyJobLocation(trunkJob)
    expect(matchesAnyEUFilter(result)).toBe(false)
  })

  it('should NOT match Remote EU filter', () => {
    const result = classifyJobLocation(trunkJob)
    expect(matchesRemoteEUFilter(result)).toBe(false)
  })
})

describe('Real-world problematic job posts', () => {
  const PROBLEMATIC_JOBS = [
    {
      text: 'Marketing Lead (Developers) - Remote friendly | Forward Deployed Engineer- Software Engineer II | DevRel Engineer - San Francisco| Staff Full Stack Engineer - San Francisco | Sr Full Stack Engineer - San Francisco',
      expectedType: 'MIXED_ROLES' as const,
      matchesRemoteGlobal: false,
      matchesRemoteEU: false,
      description: 'Multi-role post with mixed remote and SF on-site',
    },
    {
      text: 'Nova Credit | Remote (US, Canada) | Full-time',
      expectedType: 'REMOTE_REGIONAL' as const,
      matchesRemoteGlobal: false,
      matchesRemoteEU: false,
      description: 'US/Canada only remote - no EU',
    },
    {
      text: 'RINSE | REMOTE or San Francisco, Los Angeles, Chicago, Boston, New York, New Jersey, Seattle, Austin, Dallas, Toronto, or Washington DC',
      expectedType: 'REMOTE_REGIONAL' as const,
      matchesRemoteGlobal: false,
      matchesRemoteEU: false,
      description: 'US-centric due to city list',
    },
    {
      text: 'AllSpice | Boston, MA / SF Hybrid or Remote | Full time (US timezones)',
      expectedType: 'HYBRID' as const,
      matchesRemoteGlobal: false,
      matchesRemoteEU: false,
      description: 'US hybrid with timezone requirement',
    },
    {
      text: 'Ezra | Principal Engineer (Full-Stack) | US REMOTE | Full-time',
      expectedType: 'REMOTE_REGIONAL' as const,
      matchesRemoteGlobal: false,
      matchesRemoteEU: false,
      description: 'Explicit US remote',
    },
    {
      text: 'Pinetree | Remote (North America, GMT-8–GMT-5) | Full-time',
      expectedType: 'REMOTE_REGIONAL' as const,
      matchesRemoteGlobal: false,
      matchesRemoteEU: false,
      description: 'North America with US timezone',
    },
  ]

  PROBLEMATIC_JOBS.forEach(
    ({
      text,
      expectedType,
      matchesRemoteGlobal,
      matchesRemoteEU,
      description,
    }) => {
      describe(description, () => {
        it(`classifies as ${expectedType}`, () => {
          const result = classifyJobLocation(text)
          expect(result.type).toBe(expectedType)
        })

        it(`matchesRemoteGlobalFilter returns ${matchesRemoteGlobal}`, () => {
          const result = classifyJobLocation(text)
          expect(matchesRemoteGlobalFilter(result)).toBe(matchesRemoteGlobal)
        })

        it(`matchesRemoteEUFilter returns ${matchesRemoteEU}`, () => {
          const result = classifyJobLocation(text)
          expect(matchesRemoteEUFilter(result)).toBe(matchesRemoteEU)
        })
      })
    }
  )
})
