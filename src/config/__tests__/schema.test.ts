import { describe, it, expect, vi } from 'vitest'

// Suppress console.error for tests that expect validation to throw
const expectValidationError = (fn: () => void) => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    expect(fn).toThrow()
  } finally {
    consoleSpy.mockRestore()
  }
}
import {
  validateSiteConfig,
  validateContentConfig,
  validateDesignSystemsConfig,
  normalizeSkill,
  isSkillObject,
} from '../schema'

// ============================================================================
// SKILL UTILITIES TESTS
// ============================================================================

describe('isSkillObject', () => {
  it('returns true for object skills', () => {
    expect(isSkillObject({ name: 'TypeScript' })).toBe(true)
    expect(isSkillObject({ name: 'React', weight: 9 })).toBe(true)
    expect(isSkillObject({ name: 'Node.js', level: 'expert', years: 10 })).toBe(
      true
    )
  })

  it('returns false for string skills', () => {
    expect(isSkillObject('TypeScript')).toBe(false)
    expect(isSkillObject('')).toBe(false)
  })
})

describe('normalizeSkill', () => {
  it('converts string to object with name', () => {
    expect(normalizeSkill('TypeScript')).toEqual({ name: 'TypeScript' })
  })

  it('returns object skills unchanged', () => {
    const skill = { name: 'React', weight: 9, level: 'expert' as const }
    expect(normalizeSkill(skill)).toBe(skill)
  })

  it('preserves all optional properties', () => {
    const skill = {
      name: 'Node.js',
      context: 'Backend development',
      level: 'advanced' as const,
      years: 8,
      aliases: ['NodeJS', 'node'],
      weight: 8,
    }
    expect(normalizeSkill(skill)).toEqual(skill)
  })
})

// ============================================================================
// SITE CONFIG VALIDATION TESTS
// ============================================================================

describe('validateSiteConfig', () => {
  // Navigation requires at least 1 link
  const minimalValidConfig = {
    meta: {
      title: 'Test Site',
      description: 'A valid description that is long enough',
    },
    navigation: {
      links: [{ href: '#about', label: 'About' }],
    },
    social: [],
  }

  it('validates minimal valid config', () => {
    const result = validateSiteConfig(minimalValidConfig)
    expect(result.meta.title).toBe('Test Site')
  })

  it('applies default values', () => {
    const result = validateSiteConfig(minimalValidConfig)
    expect(result.meta.language).toBe('en')
    expect(result.meta.favicon).toBe('/favicon.ico')
    expect(result.meta.robots).toBe('index, follow')
  })

  it('throws on missing required fields', () => {
    const invalidConfig = {
      meta: { title: 'Test' }, // missing description
      navigation: { links: [{ href: '#', label: 'Test' }] },
      social: [],
    }
    expectValidationError(() => validateSiteConfig(invalidConfig))
  })

  it('throws on invalid description length', () => {
    const invalidConfig = {
      meta: {
        title: 'Test',
        description: 'Short', // less than 10 chars
      },
      navigation: { links: [{ href: '#', label: 'Test' }] },
      social: [],
    }
    expectValidationError(() => validateSiteConfig(invalidConfig))
  })

  it('validates social links with url or value', () => {
    const configWithSocial = {
      ...minimalValidConfig,
      social: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/test' },
        { platform: 'email', value: 'test@example.com' },
      ],
    }
    const result = validateSiteConfig(configWithSocial)
    expect(result.social).toHaveLength(2)
  })

  it('throws when social link missing both url and value', () => {
    const invalidConfig = {
      ...minimalValidConfig,
      social: [{ platform: 'linkedin' }], // neither url nor value
    }
    expectValidationError(() => validateSiteConfig(invalidConfig))
  })

  it('validates navigation links', () => {
    const configWithNav = {
      ...minimalValidConfig,
      navigation: {
        links: [
          { href: '#about', label: 'About' },
          { href: 'https://external.com', label: 'External', external: true },
        ],
      },
    }
    const result = validateSiteConfig(configWithNav)
    expect(result.navigation.links).toHaveLength(2)
    expect(result.navigation.links[0].external).toBe(false) // default
    expect(result.navigation.links[1].external).toBe(true)
  })

  it('throws on empty navigation links', () => {
    const invalidConfig = {
      ...minimalValidConfig,
      navigation: { links: [] }, // min 1 required
    }
    expectValidationError(() => validateSiteConfig(invalidConfig))
  })
})

// ============================================================================
// CONTENT CONFIG VALIDATION TESTS
// ============================================================================

describe('validateContentConfig', () => {
  const minimalValidConfig = {
    variables: {},
    hero: {
      name: 'Test User',
      title: 'Developer',
      tagline: 'Building things',
    },
  }

  it('validates minimal valid config', () => {
    const result = validateContentConfig(minimalValidConfig)
    expect(result.hero.name).toBe('Test User')
  })

  it('throws on missing hero', () => {
    const invalidConfig = { variables: {} }
    expectValidationError(() => validateContentConfig(invalidConfig))
  })

  it('throws on missing hero name', () => {
    const invalidConfig = {
      variables: {},
      hero: { title: 'Developer', tagline: 'Building' },
    }
    expectValidationError(() => validateContentConfig(invalidConfig))
  })

  it('validates experience array', () => {
    const configWithExperience = {
      ...minimalValidConfig,
      experience: [
        {
          role: 'Senior Developer',
          company: 'Tech Corp',
          period: '2020-Present',
          highlights: ['Led team of 5', 'Built platform'],
        },
      ],
    }
    const result = validateContentConfig(configWithExperience)
    expect(result.experience).toHaveLength(1)
    expect(result.experience?.[0].company).toBe('Tech Corp')
  })

  it('validates skill categories with mixed formats', () => {
    const configWithSkills = {
      ...minimalValidConfig,
      skillCategories: [
        {
          name: 'Languages',
          skills: ['TypeScript', { name: 'Python', weight: 7 }],
        },
      ],
    }
    const result = validateContentConfig(configWithSkills)
    expect(result.skillCategories).toHaveLength(1)
    expect(result.skillCategories?.[0].skills).toHaveLength(2)
  })

  it('validates metrics with number values', () => {
    const configWithMetrics = {
      ...minimalValidConfig,
      metrics: [{ value: 50, suffix: '%', label: 'Growth' }],
    }
    const result = validateContentConfig(configWithMetrics)
    expect(result.metrics?.[0].value).toBe(50)
  })

  it('validates metrics with template string values', () => {
    const configWithMetrics = {
      ...minimalValidConfig,
      variables: { careerStart: 2000 },
      metrics: [
        { value: '{{yearsSince:careerStart}}', suffix: '+', label: 'Years' },
      ],
    }
    const result = validateContentConfig(configWithMetrics)
    expect(result.metrics?.[0].value).toBe('{{yearsSince:careerStart}}')
  })

  it('validates sections array', () => {
    const configWithSections = {
      ...minimalValidConfig,
      sections: ['hero', 'experience', 'skills', 'contact'],
    }
    const result = validateContentConfig(configWithSections)
    expect(result.sections).toEqual(['hero', 'experience', 'skills', 'contact'])
  })

  it('validates sections array with projects', () => {
    const configWithProjects = {
      ...minimalValidConfig,
      sections: ['hero', 'experience', 'projects', 'skills', 'contact'],
    }
    const result = validateContentConfig(configWithProjects)
    expect(result.sections).toContain('projects')
  })

  it('rejects invalid section IDs', () => {
    const configWithInvalidSection = {
      ...minimalValidConfig,
      sections: ['hero', 'invalid-section', 'contact'],
    }
    expectValidationError(() => validateContentConfig(configWithInvalidSection))
  })
})

// ============================================================================
// DESIGN SYSTEMS CONFIG VALIDATION TESTS
// ============================================================================

describe('validateDesignSystemsConfig', () => {
  // Full valid config matching actual schema requirements
  const minimalValidConfig = {
    defaultSystem: 'default',
    defaults: {
      spacing: { unit: '0.25rem', scale: [0, 1, 2, 4, 8] },
      typography: { scale: { base: '1rem' } },
      animation: {
        duration: { default: '300ms' },
        easing: { default: 'ease' },
      },
      layout: {
        maxWidth: '1200px',
        contentWidth: '768px',
        sectionPadding: '4rem',
      },
    },
    systems: [
      {
        id: 'default',
        name: 'Default',
        fonts: {
          display: { family: 'Inter', fallback: 'sans-serif' },
          body: { family: 'Inter', fallback: 'sans-serif' },
          mono: { family: 'JetBrains Mono', fallback: 'monospace' },
        },
        tokens: {
          light: {
            colors: {
              background: '#ffffff',
              foreground: '#1a1a1a',
              card: '#f5f5f5',
              cardForeground: '#1a1a1a',
              muted: '#f0f0f0',
              mutedForeground: '#666666',
              accent: '#3b82f6',
              accentForeground: '#ffffff',
              border: '#e5e5e5',
              ring: '#3b82f6',
            },
            shadows: {
              sm: '0 1px 2px rgba(0,0,0,0.05)',
              md: '0 4px 6px rgba(0,0,0,0.1)',
              lg: '0 10px 15px rgba(0,0,0,0.1)',
              xl: '0 20px 25px rgba(0,0,0,0.1)',
              card: '0 4px 6px rgba(0,0,0,0.1)',
              'card-hover': '0 6px 12px rgba(0,0,0,0.15)',
              button: '0 1px 2px rgba(0,0,0,0.05)',
            },
            radius: {
              sm: '0.25rem',
              md: '0.5rem',
              lg: '1rem',
              card: '0.75rem',
              button: '0.5rem',
              badge: '9999px',
            },
            borderWidth: '1px',
          },
        },
      },
    ],
  }

  it('validates minimal valid config', () => {
    const result = validateDesignSystemsConfig(minimalValidConfig)
    expect(result.systems).toHaveLength(1)
    expect(result.systems[0].id).toBe('default')
  })

  it('validates defaults section', () => {
    const result = validateDesignSystemsConfig(minimalValidConfig)
    expect(result.defaults?.layout?.maxWidth).toBe('1200px')
    expect(result.defaults?.animation?.duration?.default).toBe('300ms')
  })

  it('validates defaultSystem matches a system id', () => {
    const invalidConfig = {
      ...minimalValidConfig,
      defaultSystem: 'nonexistent', // doesn't match any system id
    }
    expectValidationError(() => validateDesignSystemsConfig(invalidConfig))
  })

  it('validates system with extends property', () => {
    const configWithExtends = {
      ...minimalValidConfig,
      systems: [
        ...minimalValidConfig.systems,
        {
          id: 'dark-variant',
          name: 'Dark Variant',
          extends: 'default',
          // Minimal overrides - inherits from default
        },
      ],
    }
    const result = validateDesignSystemsConfig(configWithExtends)
    expect(result.systems[1].extends).toBe('default')
  })

  it('throws when extends references non-existent system', () => {
    const invalidConfig = {
      ...minimalValidConfig,
      systems: [
        ...minimalValidConfig.systems,
        {
          id: 'broken',
          name: 'Broken',
          extends: 'nonexistent',
        },
      ],
    }
    expectValidationError(() => validateDesignSystemsConfig(invalidConfig))
  })

  it('throws on empty systems array', () => {
    const invalidConfig = {
      ...minimalValidConfig,
      systems: [],
    }
    expectValidationError(() => validateDesignSystemsConfig(invalidConfig))
  })
})

// ============================================================================
// PROJECTS VALIDATION TESTS
// ============================================================================

describe('validateContentConfig - projects', () => {
  const minimalValidConfig = {
    variables: {},
    hero: {
      name: 'Test User',
      title: 'Developer',
      tagline: 'Building things',
    },
  }

  const minimalProject = {
    id: 'test-project',
    title: 'Test Project',
    description: 'A test project description',
    githubUrl: 'https://github.com/test/repo',
  }

  it('validates minimal project with required fields', () => {
    const config = {
      ...minimalValidConfig,
      projects: [minimalProject],
    }
    const result = validateContentConfig(config)
    expect(result.projects).toHaveLength(1)
    expect(result.projects?.[0].id).toBe('test-project')
    expect(result.projects?.[0].title).toBe('Test Project')
    expect(result.projects?.[0].githubUrl).toBe('https://github.com/test/repo')
  })

  it('applies default featured=false', () => {
    const config = {
      ...minimalValidConfig,
      projects: [minimalProject],
    }
    const result = validateContentConfig(config)
    expect(result.projects?.[0].featured).toBe(false)
  })

  it('validates project with featured=true', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ ...minimalProject, featured: true }],
    }
    const result = validateContentConfig(config)
    expect(result.projects?.[0].featured).toBe(true)
  })

  it('validates optional tags array', () => {
    const config = {
      ...minimalValidConfig,
      projects: [
        { ...minimalProject, tags: ['TypeScript', 'React', 'Node.js'] },
      ],
    }
    const result = validateContentConfig(config)
    expect(result.projects?.[0].tags).toEqual([
      'TypeScript',
      'React',
      'Node.js',
    ])
  })

  it('validates empty tags array', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ ...minimalProject, tags: [] }],
    }
    const result = validateContentConfig(config)
    expect(result.projects?.[0].tags).toEqual([])
  })

  it('validates multiple projects', () => {
    const config = {
      ...minimalValidConfig,
      projects: [
        minimalProject,
        {
          id: 'second-project',
          title: 'Second Project',
          description: 'Another project',
          githubUrl: 'https://github.com/test/second',
          featured: true,
        },
      ],
    }
    const result = validateContentConfig(config)
    expect(result.projects).toHaveLength(2)
    expect(result.projects?.[1].featured).toBe(true)
  })

  it('validates empty projects array', () => {
    const config = {
      ...minimalValidConfig,
      projects: [],
    }
    const result = validateContentConfig(config)
    expect(result.projects).toEqual([])
  })

  it('rejects duplicate project IDs', () => {
    const config = {
      ...minimalValidConfig,
      projects: [
        minimalProject,
        { ...minimalProject, title: 'Different Title' }, // same id
      ],
    }
    expectValidationError(() => validateContentConfig(config))
  })

  it('logs helpful error for duplicate project IDs', () => {
    const config = {
      ...minimalValidConfig,
      projects: [
        { ...minimalProject, id: 'duplicate-id' },
        { ...minimalProject, id: 'duplicate-id' },
      ],
    }
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => validateContentConfig(config)).toThrow()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate project id: "duplicate-id"')
      )
    } finally {
      consoleSpy.mockRestore()
    }
  })

  it('rejects invalid githubUrl', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ ...minimalProject, githubUrl: 'not-a-url' }],
    }
    expectValidationError(() => validateContentConfig(config))
  })

  it('rejects empty id', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ ...minimalProject, id: '' }],
    }
    expectValidationError(() => validateContentConfig(config))
  })

  it('rejects empty title', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ ...minimalProject, title: '' }],
    }
    expectValidationError(() => validateContentConfig(config))
  })

  it('rejects empty description', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ ...minimalProject, description: '' }],
    }
    expectValidationError(() => validateContentConfig(config))
  })

  it('rejects missing required fields', () => {
    const config = {
      ...minimalValidConfig,
      projects: [{ id: 'test' }], // missing title, description, githubUrl
    }
    expectValidationError(() => validateContentConfig(config))
  })
})

describe('validateContentConfig - projectsSection', () => {
  const minimalValidConfig = {
    variables: {},
    hero: {
      name: 'Test User',
      title: 'Developer',
      tagline: 'Building things',
    },
  }

  it('applies default eyebrow="Open Source"', () => {
    const config = {
      ...minimalValidConfig,
      projectsSection: {},
    }
    const result = validateContentConfig(config)
    expect(result.projectsSection?.eyebrow).toBe('Open Source')
  })

  it('applies default headline="Projects"', () => {
    const config = {
      ...minimalValidConfig,
      projectsSection: {},
    }
    const result = validateContentConfig(config)
    expect(result.projectsSection?.headline).toBe('Projects')
  })

  it('allows custom eyebrow and headline', () => {
    const config = {
      ...minimalValidConfig,
      projectsSection: {
        eyebrow: 'My Work',
        headline: 'Side Projects',
      },
    }
    const result = validateContentConfig(config)
    expect(result.projectsSection?.eyebrow).toBe('My Work')
    expect(result.projectsSection?.headline).toBe('Side Projects')
  })

  it('allows optional description', () => {
    const config = {
      ...minimalValidConfig,
      projectsSection: {
        description: 'Here are some of my open source contributions.',
      },
    }
    const result = validateContentConfig(config)
    expect(result.projectsSection?.description).toBe(
      'Here are some of my open source contributions.'
    )
  })

  it('validates projectsSection without description', () => {
    const config = {
      ...minimalValidConfig,
      projectsSection: {
        eyebrow: 'Open Source',
        headline: 'Projects',
      },
    }
    const result = validateContentConfig(config)
    expect(result.projectsSection?.description).toBeUndefined()
  })
})
