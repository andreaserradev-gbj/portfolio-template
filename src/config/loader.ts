/**
 * Configuration Loader
 *
 * This module loads, validates, and processes the JSON configuration files.
 * It handles:
 * - JSON validation via Zod schemas
 * - Template string processing ({{yearsSince:varName}})
 * - Design system inheritance resolution
 * - Skill normalization (string → object)
 * - Type-safe exports for React components
 */

import siteJson from './site.json'
import contentJson from './content.json'
import designSystemsJson from './design-systems.json'
import {
  validateSiteConfig,
  validateContentConfig,
  validateDesignSystemsConfig,
  normalizeSkill,
  type SiteConfig,
  type ContentConfig,
  type Metric,
  type SkillCategory,
  type Experience,
  type Achievement,
  type NavLink,
  type DesignSystemsConfig,
  type NormalizedSkillObject,
  type ExperienceSection,
  type SkillsSection,
  type AchievementsSection,
  type Footer,
  type JobBoardScoringConfig,
  type Project,
  type ProjectsSection,
} from './schema'

// ============================================================================
// VALIDATE CONFIGURATIONS AT MODULE LOAD (BUILD TIME)
// ============================================================================

export const siteConfig: SiteConfig = validateSiteConfig(siteJson)

const rawContentConfig: ContentConfig = validateContentConfig(contentJson)

export const designSystemsConfig: DesignSystemsConfig =
  validateDesignSystemsConfig(designSystemsJson)

// ============================================================================
// TEMPLATE STRING PROCESSING
// ============================================================================

// Export for testing - allows injecting a different year
export const getCurrentYear = () => new Date().getFullYear()

const currentYear = getCurrentYear()

/**
 * Process template strings like "{{yearsSince:careerStartYear}}"
 * @internal Exported for testing
 */
export function processTemplateString(
  str: string,
  variables: Record<string, number>
): string {
  return str.replace(/\{\{yearsSince:(\w+)\}\}/g, (_match, varName) => {
    const startYear = variables[varName]
    if (startYear === undefined) {
      const availableVars =
        Object.keys(variables).join(', ') || '(none defined)'
      throw new Error(
        `Unknown template variable "${varName}". Available variables: ${availableVars}`
      )
    }
    return String(currentYear - startYear)
  })
}

/**
 * Recursively process all strings in an object.
 * @internal Exported for testing
 */
export function processTemplates<T>(
  obj: T,
  variables: Record<string, number>
): T {
  if (typeof obj === 'string') {
    return processTemplateString(obj, variables) as T
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => processTemplates(item, variables)) as T
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processTemplates(value, variables)
    }
    return result as T
  }
  return obj
}

// ============================================================================
// METRIC VALUE RESOLUTION
// ============================================================================

/**
 * Resolve metric value - can be number or template string.
 * @internal Exported for testing
 */
export function resolveMetricValue(
  value: number | string,
  variables: Record<string, number>
): number {
  if (typeof value === 'number') {
    return value
  }

  // Template string: "{{yearsSince:careerStartYear}}"
  const processed = processTemplateString(value, variables)
  const parsed = parseInt(processed, 10)

  if (isNaN(parsed)) {
    throw new Error(
      `Invalid metric value: "${value}" resolved to "${processed}" which is not a number. ` +
        `Check your template syntax and variables configuration.`
    )
  }

  return parsed
}

/**
 * Resolved metric type for components.
 */
export interface ResolvedMetric {
  value: number
  suffix: string
  label: string
  description?: string
  max?: number
  link?: string
  achievementId?: string
  backContent?: {
    title: string
    category: string
    impact: string
    stats?: { label: string; value: string }[]
    details: string[]
  }
}

/**
 * Transform raw metrics to resolved format.
 * @internal Exported for testing
 */
export function resolveMetrics(
  metrics: Metric[] | undefined,
  variables: Record<string, number>
): ResolvedMetric[] {
  if (!metrics) return []

  return metrics.map((metric) => ({
    value: resolveMetricValue(metric.value, variables),
    suffix: metric.suffix || '',
    label: metric.label,
    description: metric.description,
    max: metric.max,
    link: metric.link,
    achievementId: metric.achievementId,
    backContent: metric.backContent
      ? processTemplates(metric.backContent, variables)
      : undefined,
  }))
}

// ============================================================================
// SKILL NORMALIZATION
// ============================================================================

/**
 * Normalized skill type - re-export from schema.
 */
export type NormalizedSkill = NormalizedSkillObject

/**
 * Normalized skill category.
 */
export interface NormalizedSkillCategory {
  name: string
  skills: NormalizedSkill[]
  icon?: string
}

/**
 * Normalize skill categories - convert mixed string/object format to objects.
 * @internal Exported for testing
 */
export function normalizeSkillCategories(
  categories: SkillCategory[] | undefined,
  variables: Record<string, number>
): NormalizedSkillCategory[] {
  if (!categories) return []

  return categories.map((category) => ({
    name: category.name,
    icon: category.icon,
    skills: category.skills.map((skill): NormalizedSkill => {
      const normalized = normalizeSkill(skill)
      return {
        name: normalized.name,
        level: normalized.level,
        years: normalized.years,
        context: normalized.context
          ? processTemplateString(normalized.context, variables)
          : undefined,
        aliases: normalized.aliases,
        weight: normalized.weight,
      }
    }),
  }))
}

// ============================================================================
// PROCESS CONFIGURATION
// ============================================================================

const variables = rawContentConfig.variables

// Process hero with template strings
const processedHero = {
  name: rawContentConfig.hero.name,
  title: rawContentConfig.hero.title,
  tagline: processTemplateString(rawContentConfig.hero.tagline, variables),
  avatar: rawContentConfig.hero.avatar,
  cta: rawContentConfig.hero.cta
    ? {
        primary: rawContentConfig.hero.cta.primary?.text,
        secondary: rawContentConfig.hero.cta.secondary?.text,
      }
    : undefined,
  // Configurable hero elements
  valuePills: rawContentConfig.hero.valuePills?.map((pill) => ({
    ...pill,
    label: processTemplateString(pill.label, variables),
    sublabel: processTemplateString(pill.sublabel, variables),
  })),
  quickStats: rawContentConfig.hero.quickStats?.map((stat) => ({
    ...stat,
    value:
      typeof stat.value === 'string'
        ? resolveMetricValue(stat.value, variables)
        : stat.value,
  })),
  badge: rawContentConfig.hero.badge
    ? {
        ...rawContentConfig.hero.badge,
        value: processTemplateString(
          rawContentConfig.hero.badge.value,
          variables
        ),
      }
    : undefined,
  statusBadge: rawContentConfig.hero.statusBadge,
}

// Process experience with template strings
const processedExperience: Experience[] = processTemplates(
  rawContentConfig.experience || [],
  variables
)

// Process achievements with template strings
const processedAchievements: Achievement[] = processTemplates(
  rawContentConfig.achievements || [],
  variables
)

// ============================================================================
// COMPUTED VALUES (for backward compatibility)
// ============================================================================

/**
 * Years of professional experience.
 */
export const yearsOfExperience = variables.careerStartYear
  ? currentYear - variables.careerStartYear
  : 0

/**
 * Years of Atlassian partnership.
 */
export const yearsAtlassianPartnership = variables.atlassianPartnershipStartYear
  ? currentYear - variables.atlassianPartnershipStartYear
  : 0

// ============================================================================
// EXPORTED CONFIGURATION
// ============================================================================

// Site config exports
export const { navigation, social, features, analytics } = siteConfig
export const siteMeta = siteConfig.meta

// User location for job filtering
export const userLocation = {
  locality: siteConfig.structuredData?.address?.locality ?? '',
  country: siteConfig.structuredData?.address?.country ?? '',
}

// Branding with fallback to hero name
export const branding = siteConfig.branding ?? {
  name: processedHero.name,
  logo: null,
  showName: true,
}

// Navigation links (for backward compatibility)
export const navLinks: NavLink[] = siteConfig.navigation.links

// Content exports
export const hero = processedHero
export const metrics: ResolvedMetric[] = resolveMetrics(
  rawContentConfig.metrics,
  variables
)
export const experience: Experience[] = processedExperience
export const achievements: Achievement[] = processedAchievements

// Handle both skillCategories (full format) and skills (simplified format)
function getSkillCategories(): NormalizedSkillCategory[] {
  // Full format takes precedence
  if (rawContentConfig.skillCategories) {
    return normalizeSkillCategories(rawContentConfig.skillCategories, variables)
  }

  // Convert simplified skills format to normalized format
  if (rawContentConfig.skills) {
    return rawContentConfig.skills.categories.map((cat) => ({
      name: cat.name,
      skills: cat.skills.map((skill) => ({ name: skill })),
    }))
  }

  return []
}

export const skillCategories: NormalizedSkillCategory[] = getSkillCategories()

// Projects
export const projects: Project[] = rawContentConfig.projects ?? []

// Projects section configuration
export const projectsSection: ProjectsSection = {
  eyebrow: rawContentConfig.projectsSection?.eyebrow ?? 'Open Source',
  headline: rawContentConfig.projectsSection?.headline ?? 'Projects',
  description: rawContentConfig.projectsSection?.description,
}

// ============================================================================
// CROSS-VALIDATION
// ============================================================================

/**
 * Validates that navigation links are consistent with available content.
 * Throws an error if:
 * - Navigation has #projects link but no projects are defined
 * - Projects are defined but navigation has no #projects link
 */
export function validateNavProjectsConsistency(
  navLinks: Array<{ href: string }>,
  projectsArray: unknown[]
): void {
  const hasProjectsNavLink = navLinks.some((link) => link.href === '#projects')
  const hasProjects = projectsArray.length > 0

  if (hasProjectsNavLink && !hasProjects) {
    throw new Error(
      'Configuration error: Navigation has #projects link but no projects defined in content.json. ' +
        'Either add projects to content.json or remove the Projects link from site.json navigation.'
    )
  }

  if (hasProjects && !hasProjectsNavLink) {
    throw new Error(
      'Configuration error: Projects are defined in content.json but navigation has no #projects link. ' +
        'Either add a Projects link to site.json navigation or remove projects from content.json.'
    )
  }
}

// Run cross-validation at load time
validateNavProjectsConsistency(siteConfig.navigation.links, projects)

// Job board scoring configuration with defaults
export const jobBoardScoring: JobBoardScoringConfig =
  rawContentConfig.jobBoardScoring ?? {
    defaultSkillWeight: 5,
    bonuses: {
      remotePosition: 15,
      regionFriendly: 10,
      seniorityMatch: 20,
      domainRelevance: 15,
    },
    relevantDomains: [],
    seniorityKeywords: [
      'senior',
      'staff',
      'principal',
      'lead',
      'director',
      'head of',
      'vp',
      'architect',
      'tech lead',
    ],
    skillCeiling: {
      baseSkillCount: 8,
      temperatureSensitivity: 0.6,
      minSkillCount: 4,
      maxSkillCount: 12,
    },
    scoreWeights: {
      skills: 0.65,
      bonuses: 0.35,
    },
  }

// Create skillDetails map for backward compatibility
export const skillDetails: Record<string, { context: string }> = {}
for (const category of skillCategories) {
  for (const skill of category.skills) {
    if (skill.context) {
      skillDetails[skill.name] = { context: skill.context }
    }
  }
}

// Clients (handle both v0.1 and v0.2 format)
const rawClients = rawContentConfig.clients
export const clients = rawClients
  ? rawClients.items.map((client) =>
      typeof client === 'string'
        ? { name: client, highlight: false }
        : { name: client.name, highlight: client.highlight ?? false }
    )
  : []

// Contact (from site config social links + content config)
const linkedinSocial = siteConfig.social.find((s) => s.platform === 'linkedin')
const contactConfig = rawContentConfig.contact

export const contact = {
  // Social links
  email: siteConfig.social.find((s) => s.platform === 'email')?.value || '',
  linkedin: linkedinSocial?.url
    ? linkedinSocial.url
        .replace('https://linkedin.com', '')
        .replace('https://www.linkedin.com', '')
    : '',
  linkedinUrl: linkedinSocial?.url || '',
  // Section text (from content config with defaults)
  eyebrow: contactConfig?.eyebrow ?? 'Get in Touch',
  headline: contactConfig?.headline ?? "Let's Work Together",
  description:
    contactConfig?.description ??
    "Ready to discuss your next project or opportunity. I'm always open to new challenges.",
  ctaText:
    contactConfig?.ctaText ??
    "Interested in working together? Let's start a conversation.",
  location: contactConfig?.location ?? '',
}

// ============================================================================
// SECTION CONFIGURATIONS
// ============================================================================

// Experience section configuration
export const experienceSection: ExperienceSection = {
  eyebrow:
    rawContentConfig.experienceSection?.eyebrow ?? 'Professional Journey',
  headline: rawContentConfig.experienceSection?.headline ?? 'Career Experience',
  description: rawContentConfig.experienceSection?.description,
}

// Auto-generate experience description if not provided
export const experienceDescription =
  experienceSection.description ??
  (yearsOfExperience > 0
    ? `${yearsOfExperience}+ years of building world-class software and leading high-performing engineering teams.`
    : 'Building world-class software and leading high-performing engineering teams.')

// Skills section configuration
export const skillsSection: SkillsSection = {
  eyebrow: rawContentConfig.skillsSection?.eyebrow ?? 'Technical Expertise',
  headline: rawContentConfig.skillsSection?.headline ?? 'Skills & Technologies',
  description: rawContentConfig.skillsSection?.description,
}

// Auto-generate skills description if not provided
export const skillsDescription =
  skillsSection.description ??
  'Full-stack development, cloud architecture, and technical leadership across multiple domains.'

// Skills summary - use explicit config if provided, otherwise empty (hides section)
export const skillsSummary = rawContentConfig.skillsSection?.summary ?? []

// Achievements section configuration
export const achievementsSection: AchievementsSection = {
  eyebrow: rawContentConfig.achievementsSection?.eyebrow ?? 'Core Competencies',
  headline:
    rawContentConfig.achievementsSection?.headline ?? 'Key Achievements',
  description:
    rawContentConfig.achievementsSection?.description ??
    'Strategic accomplishments across partnerships, architecture, leadership, and specialized domains.',
}

// Clients eyebrow (for ClientLogos component)
export const clientsEyebrow = rawContentConfig.clients?.title ?? 'Worked with'

// Footer configuration
const footerConfig = rawContentConfig.footer
export const footer: Footer & { copyrightName: string; copyrightText: string } =
  {
    copyrightName: footerConfig?.copyrightName ?? branding.name ?? hero.name,
    showYear: footerConfig?.showYear !== false,
    showRights: footerConfig?.showRights !== false,
    copyrightText: (() => {
      const name = footerConfig?.copyrightName ?? branding.name ?? hero.name
      const year = new Date().getFullYear()

      if (footerConfig?.showYear === false) {
        return footerConfig?.showRights !== false
          ? `${name}. All rights reserved.`
          : name
      }

      return footerConfig?.showRights !== false
        ? `\u00A9 ${year} ${name}. All rights reserved.`
        : `\u00A9 ${year} ${name}`
    })(),
  }

// Avatar initials (derived from hero.name)
export const avatarInitials = hero.name
  .split(' ')
  .map((word) => word[0])
  .join('')
  .toUpperCase()
  .slice(0, 2)

// Section order
export const sections = rawContentConfig.sections

// Custom sections
export const customSections = rawContentConfig.custom

// ============================================================================
// RE-EXPORT TYPES
// ============================================================================

export type { Experience, Achievement, NavLink, SiteConfig, ContentConfig }

export type {
  MetricBackContent,
  JobBoardScoringConfig,
  Project,
  ProjectsSection,
} from './schema'

// Aliased exports for backward compatibility
export type { NormalizedSkillCategory as SkillCategory }
export type { NormalizedSkill as Skill }
export type { ResolvedMetric as Metric }

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const resolvedConfig = {
  site: siteConfig,
  hero: processedHero,
  metrics,
  experience: processedExperience,
  experienceSection,
  experienceDescription,
  achievements: processedAchievements,
  achievementsSection,
  skillCategories,
  skillsSection,
  skillsDescription,
  skillsSummary,
  skillDetails,
  projects,
  projectsSection,
  contact,
  navLinks,
  clients,
  clientsEyebrow,
  sections,
  customSections,
  footer,
  avatarInitials,
  jobBoardScoring,
  // Computed values
  yearsOfExperience,
  yearsAtlassianPartnership,
}

export default resolvedConfig
