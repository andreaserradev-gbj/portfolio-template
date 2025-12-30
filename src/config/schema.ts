import { z } from 'zod'

// ============================================================================
// SITE CONFIG SCHEMAS
// ============================================================================

/**
 * Schema for social media links in site config.
 */
export const SocialLinkSchema = z
  .object({
    platform: z.enum([
      'linkedin',
      'github',
      'twitter',
      'mastodon',
      'youtube',
      'dribbble',
      'behance',
      'email',
      'website',
    ]),
    url: z.string().url().optional(),
    value: z.string().optional(), // for email addresses
    label: z.string().optional(), // custom label override
  })
  .refine((data) => data.url || data.value, {
    message: "Either 'url' or 'value' must be provided",
  })

/**
 * Schema for navigation links.
 */
export const NavLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
  external: z.boolean().default(false),
})

/**
 * Schema for the site-level configuration (site.json).
 */
export const SiteConfigSchema = z.object({
  $schema: z.string().optional(),

  meta: z.object({
    title: z.string().min(1),
    description: z.string().min(10).max(160),
    language: z.string().default('en'),
    url: z.string().url().optional(),
    ogImage: z.string().optional(),
    favicon: z.string().default('/favicon.ico'),
    themeColor: z.string().optional(),
    // SEO fields
    keywords: z.string().optional(),
    author: z.string().optional(),
    robots: z.string().default('index, follow'),
    // Open Graph fields
    ogType: z.string().default('website'),
    ogSiteName: z.string().optional(),
    ogImageWidth: z.number().default(1200),
    ogImageHeight: z.number().default(630),
    locale: z.string().default('en_US'),
    // Twitter Card
    twitterCard: z
      .enum(['summary', 'summary_large_image'])
      .default('summary_large_image'),
    // Profile image (for JSON-LD structured data)
    profileImage: z.string().optional(),
  }),

  structuredData: z
    .object({
      enabled: z.boolean().default(true),
      telephone: z.string().optional(),
      employer: z
        .object({
          name: z.string().min(1),
          type: z.string().default('Organization'),
        })
        .optional(),
      address: z
        .object({
          locality: z.string().min(1),
          country: z.string().min(1),
        })
        .optional(),
      knowsAbout: z.array(z.string()).optional(),
    })
    .optional(),

  branding: z
    .object({
      name: z.string().min(1),
      logo: z.string().nullable().default(null),
      showName: z.boolean().default(true),
    })
    .optional(),

  navigation: z.object({
    links: z.array(NavLinkSchema).min(1),
    cta: z
      .object({
        text: z.string(),
        href: z.string(),
      })
      .optional(),
  }),

  social: z.array(SocialLinkSchema).default([]),

  analytics: z
    .object({
      vercel: z.boolean().default(false),
      googleAnalytics: z.string().nullable().default(null),
      plausible: z.string().nullable().default(null),
    })
    .optional(),

  features: z
    .object({
      darkMode: z.boolean().default(true),
      designSystemSwitcher: z.boolean().default(true),
      smoothScroll: z.boolean().default(true),
      reduceMotion: z
        .enum(['respect-system', 'always-reduce', 'ignore'])
        .default('respect-system'),
    })
    .optional(),
})

// ============================================================================
// CONTENT SCHEMAS
// ============================================================================

/**
 * Schema for metric back content (flip card details).
 */
export const MetricBackContentSchema = z.object({
  title: z.string(),
  category: z.string().min(1),
  impact: z.string(),
  stats: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  details: z.array(z.string()),
})

/**
 * Schema for hero value pills (key differentiators).
 */
export const ValuePillSchema = z.object({
  label: z.string().min(1),
  sublabel: z.string().min(1),
  highlight: z.boolean().default(false),
})

/**
 * Schema for hero quick stats.
 */
export const QuickStatSchema = z.object({
  value: z.union([z.number(), z.string()]), // supports templates like "{{yearsSince:varName}}"
  suffix: z.string().default(''),
  label: z.string().min(1),
})

/**
 * Schema for hero floating badge.
 */
export const HeroBadgeSchema = z.object({
  value: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
})

/**
 * Schema for hero status badge.
 */
export const StatusBadgeSchema = z.object({
  text: z.string().min(1),
  active: z.boolean().default(true),
})

/**
 * Schema for the hero section content.
 */
export const HeroSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  avatar: z.string().optional(),
  cta: z
    .object({
      primary: z
        .object({
          text: z.string(),
          target: z.string(),
        })
        .optional(),
      secondary: z
        .object({
          text: z.string(),
          target: z.string(),
        })
        .optional(),
    })
    .optional(),
  // Configurable hero elements
  valuePills: z.array(ValuePillSchema).optional(),
  quickStats: z.array(QuickStatSchema).max(3).optional(),
  badge: HeroBadgeSchema.optional(),
  statusBadge: StatusBadgeSchema.optional(),
})

/**
 * Schema for work experience entries.
 */
export const ExperienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  location: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  clients: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
})

/**
 * Schema for achievement entries.
 */
export const AchievementSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  summary: z.string().min(1),
  impact: z.string().min(1),
  details: z.array(z.string()).min(1),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
})

/**
 * Skill can be a simple string or an object with details.
 */
export const SkillItemSchema = z.union([
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    context: z.string().optional(),
    level: z
      .enum(['beginner', 'intermediate', 'advanced', 'expert'])
      .optional(),
    years: z.number().optional(),
    aliases: z.array(z.string()).optional(),
    weight: z.number().min(1).max(10).optional(), // Job board scoring weight (1-10 scale)
  }),
])

/**
 * Schema for skill categories with mixed format support.
 */
export const SkillCategorySchema = z.object({
  name: z.string().min(1),
  skills: z.array(SkillItemSchema).min(1),
  icon: z.string().optional(),
})

/**
 * Simplified skills section schema (alternative to skillCategories).
 */
export const SimplifiedSkillsSectionSchema = z.object({
  display: z.enum(['list', 'grid', 'badges']).default('list'),
  categories: z.array(
    z.object({
      name: z.string().min(1),
      skills: z.array(z.string()).min(1),
    })
  ),
})

/**
 * Simplified metric schema - value can be number or template string.
 */
export const MetricSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.number(), z.string()]), // number or "{{yearsSince:varName}}"
  suffix: z.string().default(''),
  description: z.string().optional(),
  max: z.number().optional(),
  link: z.string().optional(),
  achievementId: z.string().optional(),
  backContent: MetricBackContentSchema.optional(),
})

/**
 * Schema for contact section configuration.
 */
export const ContactSchema = z.object({
  eyebrow: z.string().default('Get in Touch'),
  headline: z.string().default("Let's Work Together"),
  description: z
    .string()
    .default(
      "Ready to discuss your next project or opportunity. I'm always open to new challenges."
    ),
  ctaText: z
    .string()
    .default("Interested in working together? Let's start a conversation."),
  location: z.string().optional(),
  preferredMethod: z.enum(['email', 'linkedin', 'form']).default('email'),
  showSocial: z.boolean().default(true),
})

/**
 * Schema for Experience section configuration.
 */
export const ExperienceSectionSchema = z.object({
  eyebrow: z.string().default('Professional Journey'),
  headline: z.string().default('Career Experience'),
  description: z.string().optional(),
})

/**
 * Schema for skills summary items (bottom highlight bar).
 */
export const SkillsSummaryItemSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
})

/**
 * Schema for Skills section configuration.
 */
export const SkillsSectionSchema = z.object({
  eyebrow: z.string().default('Technical Expertise'),
  headline: z.string().default('Skills & Technologies'),
  description: z.string().optional(),
  summary: z.array(SkillsSummaryItemSchema).optional(),
})

/**
 * Schema for Achievements section configuration.
 */
export const AchievementsSectionSchema = z.object({
  eyebrow: z.string().default('Core Competencies'),
  headline: z.string().default('Key Achievements'),
  description: z
    .string()
    .default(
      'Strategic accomplishments across partnerships, architecture, leadership, and specialized domains.'
    ),
})

/**
 * Schema for footer configuration.
 */
export const FooterSchema = z.object({
  copyrightName: z.string().optional(),
  showYear: z.boolean().default(true),
  showRights: z.boolean().default(true),
})

/**
 * Schema for custom sections.
 */
export const CustomSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  position: z.string().default('end'), // "after:skills", "before:contact", "end"
  content: z.object({
    type: z.enum(['projects', 'text', 'gallery', 'timeline', 'custom']),
    items: z.array(z.any()).optional(),
    html: z.string().optional(),
    markdown: z.string().optional(),
  }),
})

/**
 * Schema for client entries (supports multiple formats).
 */
export const ClientSchema = z.union([
  z.string(), // Simple name
  z.object({
    name: z.string().min(1),
    logo: z.string().optional(),
    url: z.string().url().optional(),
    highlight: z.boolean().default(false),
  }),
])

/**
 * Schema for clients section.
 */
export const ClientsSectionSchema = z.object({
  title: z.string().default('Clients'),
  display: z.enum(['logos', 'list', 'grid']).default('list'),
  items: z.array(ClientSchema),
})

/**
 * Section ID enum for ordering.
 */
export const SectionIdSchema = z.enum([
  'hero',
  'metrics',
  'experience',
  'achievements',
  'skills',
  'clients',
  'contact',
])

/**
 * Schema for temperature preset configuration.
 */
export const TemperaturePresetSchema = z.object({
  value: z.number().min(0).max(1),
  label: z.string().min(1),
  description: z.string().optional(),
})

/**
 * Schema for job board scoring configuration.
 * Controls weighted skill matching with temperature-based sensitivity.
 */
export const JobBoardScoringConfigSchema = z.object({
  // Default weight for skills without explicit weight (1-10 scale)
  defaultSkillWeight: z.number().min(1).max(10).default(5),

  // Bonus point values for various job attributes
  bonuses: z
    .object({
      remotePosition: z.number().default(15),
      regionFriendly: z.number().default(10),
      seniorityMatch: z.number().default(20),
      domainRelevance: z.number().default(15),
    })
    .default({
      remotePosition: 15,
      regionFriendly: 10,
      seniorityMatch: 20,
      domainRelevance: 15,
    }),

  // Keywords/domains that are relevant to the user's career focus
  relevantDomains: z.array(z.string()).default([]),

  // Keywords to detect seniority level in job postings
  seniorityKeywords: z
    .array(z.string())
    .default([
      'senior',
      'staff',
      'principal',
      'lead',
      'director',
      'head of',
      'vp',
      'vice president',
      'architect',
      'distinguished',
      'tech lead',
    ]),

  // Temperature presets for quick selection in UI
  temperaturePresets: z
    .object({
      strict: TemperaturePresetSchema.default({
        value: 0.1,
        label: 'Strict',
        description: 'Near-perfect skill matches only',
      }),
      balanced: TemperaturePresetSchema.default({
        value: 0.4,
        label: 'Balanced',
        description: 'Good balance of relevance and variety',
      }),
      exploratory: TemperaturePresetSchema.default({
        value: 0.7,
        label: 'Exploratory',
        description: 'Partial matches welcome, more variety',
      }),
      loose: TemperaturePresetSchema.default({
        value: 0.95,
        label: 'Loose',
        description: 'Show everything with any relevance',
      }),
    })
    .optional(),

  // Skill ceiling configuration - limits max skill points to top N skills
  skillCeiling: z
    .object({
      // Base number of top skills to consider at balanced temperature
      baseSkillCount: z.number().min(3).max(20).default(8),
      // How much temperature affects the ceiling (0 = no effect, 1 = full effect)
      temperatureSensitivity: z.number().min(0).max(1).default(0.6),
      // Minimum skills to consider (at strictest temperature)
      minSkillCount: z.number().min(2).max(10).default(4),
      // Maximum skills to consider (at loosest temperature)
      maxSkillCount: z.number().min(5).max(25).default(12),
    })
    .default({
      baseSkillCount: 8,
      temperatureSensitivity: 0.6,
      minSkillCount: 4,
      maxSkillCount: 12,
    }),

  // Weight distribution between skills and bonuses
  scoreWeights: z
    .object({
      // Percentage of score from skills (0-1)
      skills: z.number().min(0).max(1).default(0.65),
      // Percentage of score from bonuses (0-1)
      bonuses: z.number().min(0).max(1).default(0.35),
    })
    .default({
      skills: 0.65,
      bonuses: 0.35,
    }),
})

/**
 * Main schema for the content configuration.
 * This is the shape of content.json.
 */
export const ContentConfigSchema = z.object({
  $schema: z.string().optional(),

  variables: z.record(z.string(), z.number()).default({}),

  sections: z
    .array(SectionIdSchema)
    .default([
      'hero',
      'metrics',
      'experience',
      'achievements',
      'skills',
      'contact',
    ]),

  // Required sections
  hero: HeroSchema,

  // Optional sections
  metrics: z.array(MetricSchema).optional(),
  experience: z.array(ExperienceSchema).optional(),
  experienceSection: ExperienceSectionSchema.optional(),
  achievements: z.array(AchievementSchema).optional(),
  achievementsSection: AchievementsSectionSchema.optional(),
  skillCategories: z.array(SkillCategorySchema).optional(),
  // Simplified skills format (alternative to skillCategories)
  skills: SimplifiedSkillsSectionSchema.optional(),
  skillsSection: SkillsSectionSchema.optional(),
  clients: ClientsSectionSchema.optional(),
  contact: ContactSchema.optional(),
  footer: FooterSchema.optional(),

  // Job board scoring configuration (for HN job board feature)
  jobBoardScoring: JobBoardScoringConfigSchema.optional(),

  // Custom sections
  custom: z.array(CustomSectionSchema).default([]),
})

// ============================================================================
// DESIGN SYSTEM SCHEMAS
// ============================================================================

/**
 * Schema for font configuration.
 */
export const FontConfigSchema = z.object({
  family: z.string().min(1),
  fallback: z.string().default('system-ui, sans-serif'),
  googleFontsUrl: z.string().url().optional(),
  weights: z.array(z.number()).optional(),
})

/**
 * Schema for color palette - supports full color scales.
 */
export const ColorPaletteSchema = z.record(z.string(), z.string())

/**
 * Schema for shadow definitions.
 */
export const ShadowsSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  card: z.string(),
  'card-hover': z.string(),
  button: z.string(),
})

/**
 * Schema for border radius definitions.
 */
export const RadiusSchema = z.object({
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  '2xl': z.string(),
  card: z.string(),
  button: z.string(),
  badge: z.string(),
})

/**
 * Schema for border definitions.
 */
export const BorderSchema = z.object({
  width: z.string(),
  style: z.string().default('solid'),
})

/**
 * Schema for design tokens (one mode - light or dark).
 */
export const DesignTokensSchema = z.object({
  colors: z.object({
    // Semantic colors
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
    'muted-foreground': z.string(),
    card: z.string(),
    'card-foreground': z.string(),
    border: z.string(),
    primary: z.string(),
    'primary-foreground': z.string(),
    secondary: z.string(),
    'secondary-foreground': z.string(),
    accent: z.string(),
    'accent-foreground': z.string(),
    // Optional palette colors (for themes that need full palettes)
    palette: ColorPaletteSchema.optional(),
  }),
  shadows: ShadowsSchema,
  radius: RadiusSchema,
  border: BorderSchema,
  // Optional decorative properties
  decorative: z
    .object({
      'rotation-card': z.string().optional(),
      'paper-texture-opacity': z.string().optional(),
      'flip-duration': z.string().optional(),
      'flip-easing': z.string().optional(),
    })
    .optional(),
})

/**
 * Schema for default tokens shared across all design systems.
 */
export const DefaultTokensSchema = z
  .object({
    spacing: z
      .object({
        unit: z.string().default('0.25rem'),
        scale: z
          .array(z.number())
          .default([0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32]),
      })
      .optional(),
    typography: z
      .object({
        scale: z.record(z.string(), z.string()).optional(),
        lineHeight: z.record(z.string(), z.number()).optional(),
      })
      .optional(),
    animation: z
      .object({
        duration: z.record(z.string(), z.string()).optional(),
        easing: z.record(z.string(), z.string()).optional(),
      })
      .optional(),
    layout: z
      .object({
        maxWidth: z.string().default('1200px'),
        contentWidth: z.string().default('768px'),
        sectionPadding: z.string().default('4rem'),
      })
      .optional(),
  })
  .optional()

/**
 * Schema for partial design tokens (used with inheritance).
 */
export const PartialDesignTokensSchema = z.object({
  colors: z
    .object({
      background: z.string().optional(),
      foreground: z.string().optional(),
      muted: z.string().optional(),
      'muted-foreground': z.string().optional(),
      card: z.string().optional(),
      'card-foreground': z.string().optional(),
      border: z.string().optional(),
      primary: z.string().optional(),
      'primary-foreground': z.string().optional(),
      secondary: z.string().optional(),
      'secondary-foreground': z.string().optional(),
      accent: z.string().optional(),
      'accent-foreground': z.string().optional(),
      palette: ColorPaletteSchema.optional(),
    })
    .optional(),
  shadows: ShadowsSchema.partial().optional(),
  radius: RadiusSchema.partial().optional(),
  border: BorderSchema.partial().optional(),
  decorative: z
    .object({
      'rotation-card': z.string().optional(),
      'paper-texture-opacity': z.string().optional(),
      'flip-duration': z.string().optional(),
      'flip-easing': z.string().optional(),
    })
    .optional(),
})

/**
 * Schema for a single design system configuration (with inheritance support).
 */
export const DesignSystemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  extends: z.string().optional(), // Single-level inheritance only
  supportsDarkMode: z.boolean().default(true),

  // Fonts are optional if extending another system
  fonts: z
    .object({
      display: FontConfigSchema,
      body: FontConfigSchema,
      mono: FontConfigSchema,
    })
    .optional(),

  // Tokens can be partial if extending
  tokens: z
    .object({
      light: z.union([DesignTokensSchema, PartialDesignTokensSchema]),
      dark: z.union([DesignTokensSchema, PartialDesignTokensSchema]).optional(),
    })
    .optional(),

  // Per-system animation overrides
  animation: z
    .object({
      duration: z.record(z.string(), z.string()).optional(),
      easing: z.record(z.string(), z.string()).optional(),
    })
    .optional(),

  // Optional custom CSS for advanced styling
  customCSS: z
    .object({
      light: z.string().optional(),
      dark: z.string().optional(),
    })
    .optional(),
})

/**
 * Main schema for the design systems configuration.
 */
export const DesignSystemsConfigSchema = z
  .object({
    $schema: z.string().optional(),
    defaultSystem: z.string().min(1),
    defaults: DefaultTokensSchema,
    systems: z.array(DesignSystemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    // Validate defaultSystem exists in systems array
    const systemIds = data.systems.map((s) => s.id)
    if (!systemIds.includes(data.defaultSystem)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `defaultSystem "${data.defaultSystem}" must match an existing system id. Available: ${systemIds.join(', ')}`,
        path: ['defaultSystem'],
      })
    }

    // Validate all 'extends' references point to existing systems
    const systemIdSet = new Set(systemIds)
    for (const system of data.systems) {
      if (system.extends && !systemIdSet.has(system.extends)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `System "${system.id}" extends non-existent system "${system.extends}". Available: ${systemIds.join(', ')}`,
          path: ['systems'],
        })
      }
    }
  })

// ============================================================================
// EXPORTED TYPES (derived from Zod schemas)
// ============================================================================

// Site types
export type SiteConfig = z.infer<typeof SiteConfigSchema>
export type SocialLink = z.infer<typeof SocialLinkSchema>
export type NavLink = z.infer<typeof NavLinkSchema>
export type SiteMeta = SiteConfig['meta']
export type StructuredData = NonNullable<SiteConfig['structuredData']>

// Content types
export type ContentConfig = z.infer<typeof ContentConfigSchema>
export type HeroConfig = z.infer<typeof HeroSchema>
export type ValuePill = z.infer<typeof ValuePillSchema>
export type QuickStat = z.infer<typeof QuickStatSchema>
export type HeroBadge = z.infer<typeof HeroBadgeSchema>
export type StatusBadge = z.infer<typeof StatusBadgeSchema>
export type Metric = z.infer<typeof MetricSchema>
export type MetricBackContent = z.infer<typeof MetricBackContentSchema>
export type Experience = z.infer<typeof ExperienceSchema>
export type Achievement = z.infer<typeof AchievementSchema>
export type SkillItem = z.infer<typeof SkillItemSchema>
export type SkillCategory = z.infer<typeof SkillCategorySchema>
export type SimplifiedSkillsSection = z.infer<
  typeof SimplifiedSkillsSectionSchema
>
export type Contact = z.infer<typeof ContactSchema>
export type ExperienceSection = z.infer<typeof ExperienceSectionSchema>
export type SkillsSection = z.infer<typeof SkillsSectionSchema>
export type SkillsSummaryItem = z.infer<typeof SkillsSummaryItemSchema>
export type AchievementsSection = z.infer<typeof AchievementsSectionSchema>
export type Footer = z.infer<typeof FooterSchema>
export type Client = z.infer<typeof ClientSchema>
export type ClientsSection = z.infer<typeof ClientsSectionSchema>
export type CustomSection = z.infer<typeof CustomSectionSchema>
export type JobBoardScoringConfig = z.infer<typeof JobBoardScoringConfigSchema>
export type TemperaturePreset = z.infer<typeof TemperaturePresetSchema>

// Design system types
export type DesignSystemsConfig = z.infer<typeof DesignSystemsConfigSchema>
export type DesignSystemConfig = z.infer<typeof DesignSystemSchema>
export type DesignTokens = z.infer<typeof DesignTokensSchema>
export type PartialDesignTokens = z.infer<typeof PartialDesignTokensSchema>
export type DefaultTokens = z.infer<typeof DefaultTokensSchema>
export type FontConfig = z.infer<typeof FontConfigSchema>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Formats Zod validation errors into a user-friendly string.
 */
function formatValidationErrors(errors: z.ZodError): string {
  return errors.issues
    .map((issue) => `  → ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
}

/**
 * Validates the site configuration.
 * Throws a detailed error if validation fails.
 */
export function validateSiteConfig(json: unknown): SiteConfig {
  const result = SiteConfigSchema.safeParse(json)
  if (!result.success) {
    const errorMsg = formatValidationErrors(result.error)
    console.error(`\n❌ site.json validation failed:\n\n${errorMsg}\n`)
    throw new Error(
      `Invalid site.json. ${result.error.issues.length} error(s) found.`
    )
  }
  return result.data
}

/**
 * Validates the content configuration.
 * Throws a detailed error if validation fails.
 */
export function validateContentConfig(json: unknown): ContentConfig {
  const result = ContentConfigSchema.safeParse(json)
  if (!result.success) {
    const errorMsg = formatValidationErrors(result.error)
    console.error(`\n❌ content.json validation failed:\n\n${errorMsg}\n`)
    throw new Error(
      `Invalid content.json. ${result.error.issues.length} error(s) found.`
    )
  }
  return result.data
}

/**
 * Validates the design systems configuration.
 * Throws a detailed error if validation fails.
 */
export function validateDesignSystemsConfig(
  json: unknown
): DesignSystemsConfig {
  const result = DesignSystemsConfigSchema.safeParse(json)
  if (!result.success) {
    const errorMsg = formatValidationErrors(result.error)
    console.error(
      `\n❌ design-systems.json validation failed:\n\n${errorMsg}\n`
    )
    throw new Error(
      `Invalid design-systems.json. ${result.error.issues.length} error(s) found.`
    )
  }
  return result.data
}

// ============================================================================
// SKILL UTILITIES
// ============================================================================

/**
 * Type for a normalized skill object.
 */
export type NormalizedSkillObject = {
  name: string
  context?: string
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  years?: number
  aliases?: string[]
  weight?: number // Job board scoring weight (1-10 scale)
}

/**
 * Type guard to check if a skill item is an object with details.
 */
export function isSkillObject(
  skill: SkillItem
): skill is NormalizedSkillObject {
  return typeof skill === 'object' && skill !== null
}

/**
 * Normalizes a skill item to always be an object.
 */
export function normalizeSkill(skill: SkillItem): NormalizedSkillObject {
  if (typeof skill === 'string') {
    return { name: skill }
  }
  return skill
}
