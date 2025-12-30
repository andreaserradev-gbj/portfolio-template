import { skillCategories, jobBoardScoring } from '@/config/loader'
import type { ParsedLocationData } from '@/types/hn'

/**
 * Result of matching a job against user skills (basic format for backward compatibility)
 */
export interface MatchResult {
  score: number
  matchedSkills: string[]
  totalSkills: number
  matchedCount: number
}

/**
 * Extended match result with weighted score breakdown
 */
export interface WeightedMatchResult {
  // Final normalized score (0-100)
  score: number

  // Raw points before normalization
  rawPoints: number
  maxPossiblePoints: number

  // Breakdown
  skillPoints: number
  bonusPoints: number

  // Matched skill details
  matchedSkills: Array<{
    name: string
    weight: number
    pointsEarned: number
  }>

  // Bonus details
  bonuses: {
    remote: boolean
    regionFriendly: boolean
    seniorityMatch: boolean
    domainRelevance: boolean
  }

  // Temperature applied
  temperature: number
}

/**
 * Skill with weight for matching
 */
interface WeightedSkill {
  name: string
  weight: number
  aliases: string[]
}

/**
 * Temperature factors for scoring adjustments
 */
interface TemperatureFactors {
  // How much to amplify weight differences (1.0 = linear, 2.0 = squared, 0.5 = sqrt)
  weightExponent: number
  // Multiplier for bonus points
  bonusMultiplier: number
  // Score curve exponent (affects how scores are distributed)
  scoreCurveExponent: number
  // Raw temperature value (0.0-1.0)
  temperature: number
  // Effective number of top skills to consider for max calculation
  effectiveSkillCeiling: number
}

/**
 * Build weighted skill map from content.json skillCategories at module load
 */
function buildWeightedSkillMap(): Map<string, WeightedSkill> {
  const map = new Map<string, WeightedSkill>()
  const defaultWeight = jobBoardScoring.defaultSkillWeight ?? 5

  for (const category of skillCategories) {
    for (const skill of category.skills) {
      const key = skill.name.toLowerCase()
      map.set(key, {
        name: skill.name,
        weight: skill.weight ?? defaultWeight,
        aliases: skill.aliases?.map((a) => a.toLowerCase()) ?? [key],
      })
    }
  }
  return map
}

const weightedSkillMap = buildWeightedSkillMap()

/**
 * Build simple aliases map for backward compatibility
 */
function buildAliasMap(): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const [key, skill] of weightedSkillMap) {
    map.set(key, skill.aliases)
  }
  return map
}

const skillAliasMap = buildAliasMap()

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Extract all skill names from content.json skillCategories
 */
export function extractAllSkills(): string[] {
  const skills: string[] = []

  for (const category of skillCategories) {
    for (const skill of category.skills) {
      skills.push(skill.name.toLowerCase())
    }
  }

  return skills
}

/**
 * Get all aliases for a skill (including the skill itself)
 */
function getSkillAliases(skill: string): string[] {
  const normalizedSkill = skill.toLowerCase()
  return skillAliasMap.get(normalizedSkill) ?? [normalizedSkill]
}

/**
 * Match job text against user skills (backward compatible version)
 */
export function matchJobToSkills(
  jobText: string,
  userSkills: string[]
): MatchResult {
  const normalizedText = jobText.toLowerCase()
  const matchedSkills: string[] = []

  for (const skill of userSkills) {
    const aliases = getSkillAliases(skill)

    // Check if any alias matches in the job text
    const matched = aliases.some((alias) => {
      const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i')
      return regex.test(normalizedText)
    })

    if (matched) {
      matchedSkills.push(skill)
    }
  }

  const score =
    userSkills.length > 0
      ? Math.round((matchedSkills.length / userSkills.length) * 100)
      : 0

  return {
    score,
    matchedSkills,
    totalSkills: userSkills.length,
    matchedCount: matchedSkills.length,
  }
}

// ============================================================================
// TEMPERATURE-BASED WEIGHTED SCORING
// ============================================================================

/**
 * Calculate temperature factors based on temperature value (0.0-1.0)
 *
 * LOW (0.0-0.2): Strict mode
 * - Skill weights amplified (squared)
 * - Bonuses reduced (50%)
 * - Score curve compresses low scores
 *
 * BALANCED (0.3-0.5): Default
 * - Linear weight application
 * - Full bonus values
 * - Linear score curve
 *
 * HIGH (0.6-0.8): Exploratory
 * - Weight differences compressed (square root)
 * - Bonuses amplified (125%)
 * - Score curve expands low scores
 *
 * VERY HIGH (0.9-1.0): Loose
 * - All skills weighted nearly equally
 * - Bonuses doubled
 * - Maximum expansion of low scores
 */
function calculateTemperatureFactors(temperature: number): TemperatureFactors {
  // Clamp temperature to valid range
  const t = Math.max(0, Math.min(1, temperature))

  // Get skill ceiling config with defaults
  const ceilingConfig = jobBoardScoring.skillCeiling ?? {
    baseSkillCount: 8,
    temperatureSensitivity: 0.6,
    minSkillCount: 4,
    maxSkillCount: 12,
  }

  // Calculate effective skill ceiling based on temperature
  // At balanced (0.4), use baseSkillCount
  // At strict (<0.4), decrease ceiling; at loose (>0.4), increase ceiling
  const tempOffset = t - 0.4 // -0.4 to 0.6
  const range = ceilingConfig.maxSkillCount - ceilingConfig.minSkillCount
  const ceilingAdjustment =
    tempOffset * ceilingConfig.temperatureSensitivity * range
  const effectiveSkillCeiling = Math.round(
    Math.max(
      ceilingConfig.minSkillCount,
      Math.min(
        ceilingConfig.maxSkillCount,
        ceilingConfig.baseSkillCount + ceilingAdjustment
      )
    )
  )

  if (t <= 0.2) {
    // Cold/Strict: Amplify differences, reduce bonuses
    const factor = t / 0.2 // 0 to 1 within this range
    return {
      weightExponent: 2.0 - factor * 1.0, // 2.0 at 0.0, 1.0 at 0.2
      bonusMultiplier: 0.5 + factor * 0.5, // 0.5 at 0.0, 1.0 at 0.2
      scoreCurveExponent: 1.5 - factor * 0.5, // 1.5 at 0.0, 1.0 at 0.2
      temperature: t,
      effectiveSkillCeiling,
    }
  } else if (t <= 0.5) {
    // Balanced: Linear, standard behavior
    return {
      weightExponent: 1.0,
      bonusMultiplier: 1.0,
      scoreCurveExponent: 1.0,
      temperature: t,
      effectiveSkillCeiling,
    }
  } else if (t <= 0.8) {
    // Warm/Exploratory: Compress differences, amplify bonuses
    const factor = (t - 0.5) / 0.3 // 0 to 1 within this range
    return {
      weightExponent: 1.0 - factor * 0.5, // 1.0 to 0.5
      bonusMultiplier: 1.0 + factor * 0.25, // 1.0 to 1.25
      scoreCurveExponent: 1.0 - factor * 0.3, // 1.0 to 0.7
      temperature: t,
      effectiveSkillCeiling,
    }
  } else {
    // Hot/Loose: Flatten weights, double bonuses
    const factor = (t - 0.8) / 0.2 // 0 to 1 within this range
    return {
      weightExponent: 0.5 - factor * 0.3, // 0.5 to 0.2
      bonusMultiplier: 1.25 + factor * 0.75, // 1.25 to 2.0
      scoreCurveExponent: 0.7 - factor * 0.2, // 0.7 to 0.5
      temperature: t,
      effectiveSkillCeiling,
    }
  }
}

/**
 * Calculate skill points from matched skills
 */
function calculateSkillPoints(
  normalizedText: string,
  factors: TemperatureFactors
): {
  totalPoints: number
  matchedSkills: Array<{ name: string; weight: number; pointsEarned: number }>
} {
  const matchedSkills: Array<{
    name: string
    weight: number
    pointsEarned: number
  }> = []
  let totalPoints = 0

  for (const [, skill] of weightedSkillMap) {
    // Check for exact match via aliases
    const exactMatch = skill.aliases.some((alias) => {
      const regex = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i')
      return regex.test(normalizedText)
    })

    if (exactMatch) {
      // Apply weight with temperature exponent
      const adjustedWeight = Math.pow(skill.weight, factors.weightExponent)

      matchedSkills.push({
        name: skill.name,
        weight: skill.weight,
        pointsEarned: adjustedWeight,
      })
      totalPoints += adjustedWeight
    }
  }

  return { totalPoints, matchedSkills }
}

/**
 * Calculate max possible skill points using top-N skills by weight.
 * Only considers the top N skills (based on effectiveSkillCeiling) for max calculation,
 * rather than all skills. This creates a realistic ceiling for scoring.
 */
function calculateMaxSkillPoints(factors: TemperatureFactors): number {
  // Get all skills sorted by weight descending
  const sortedSkills = Array.from(weightedSkillMap.values()).sort(
    (a, b) => b.weight - a.weight
  )

  // Take only top N skills based on effective ceiling
  const topSkills = sortedSkills.slice(0, factors.effectiveSkillCeiling)

  // Sum their adjusted weights
  return topSkills.reduce(
    (sum, skill) => sum + Math.pow(skill.weight, factors.weightExponent),
    0
  )
}

/**
 * Detect seniority level keywords in job posting
 */
function detectSeniority(text: string): boolean {
  const keywords = jobBoardScoring.seniorityKeywords ?? []
  const normalizedText = text.toLowerCase()

  return keywords.some((keyword) => {
    const escaped = escapeRegex(keyword.toLowerCase())
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i')
    return pattern.test(normalizedText)
  })
}

/**
 * Detect domain relevance in job posting
 */
function detectDomainRelevance(text: string): boolean {
  const domains = jobBoardScoring.relevantDomains ?? []
  const normalizedText = text.toLowerCase()

  return domains.some((domain) => {
    const escaped = escapeRegex(domain.toLowerCase())
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i')
    return pattern.test(normalizedText)
  })
}

/**
 * Calculate bonus points based on job attributes
 */
function calculateBonusPoints(
  jobText: string,
  userRegion: Region,
  factors: TemperatureFactors
): {
  totalPoints: number
  bonuses: {
    remote: boolean
    regionFriendly: boolean
    seniorityMatch: boolean
    domainRelevance: boolean
  }
} {
  const bonuses = {
    remote: false,
    regionFriendly: false,
    seniorityMatch: false,
    domainRelevance: false,
  }
  let totalPoints = 0

  const config = jobBoardScoring.bonuses ?? {
    remotePosition: 15,
    regionFriendly: 10,
    seniorityMatch: 20,
    domainRelevance: 15,
  }

  // Remote position bonus
  if (isRemoteJob(jobText)) {
    bonuses.remote = true
    totalPoints += config.remotePosition * factors.bonusMultiplier
  }

  // Region-friendly bonus (only if remote)
  if (bonuses.remote && isRemoteJobAvailableInRegion(jobText, userRegion)) {
    bonuses.regionFriendly = true
    totalPoints += config.regionFriendly * factors.bonusMultiplier
  }

  // Seniority match bonus
  if (detectSeniority(jobText)) {
    bonuses.seniorityMatch = true
    totalPoints += config.seniorityMatch * factors.bonusMultiplier
  }

  // Domain relevance bonus
  if (detectDomainRelevance(jobText)) {
    bonuses.domainRelevance = true
    totalPoints += config.domainRelevance * factors.bonusMultiplier
  }

  return { totalPoints, bonuses }
}

/**
 * Calculate max possible bonus points
 */
function calculateMaxBonusPoints(factors: TemperatureFactors): number {
  const config = jobBoardScoring.bonuses ?? {
    remotePosition: 15,
    regionFriendly: 10,
    seniorityMatch: 20,
    domainRelevance: 15,
  }

  return (
    (config.remotePosition +
      config.regionFriendly +
      config.seniorityMatch +
      config.domainRelevance) *
    factors.bonusMultiplier
  )
}

/**
 * Normalize score using weighted component scoring (skills + bonuses).
 * This creates a more intuitive score distribution by:
 * 1. Calculating skill percentage against a realistic ceiling (top N skills)
 * 2. Calculating bonus percentage (0-100% of possible bonuses)
 * 3. Applying configurable weights to each component
 * 4. Adjusting weights based on temperature (loose = more bonus weight)
 */
function normalizeScore(
  skillPoints: number,
  bonusPoints: number,
  maxSkillPoints: number,
  maxBonusPoints: number,
  factors: TemperatureFactors
): number {
  // Get score weights from config with defaults
  const weights = jobBoardScoring.scoreWeights ?? {
    skills: 0.65,
    bonuses: 0.35,
  }

  // Calculate component percentages (cap skills at 100% - can exceed ceiling)
  const skillPct =
    maxSkillPoints > 0 ? Math.min(1, skillPoints / maxSkillPoints) : 0
  const bonusPct = maxBonusPoints > 0 ? bonusPoints / maxBonusPoints : 0

  // Zero-skill penalty: if no skills match, bonuses alone shouldn't give meaningful scores
  // This prevents non-relevant jobs from scoring high just because they have generic attributes
  // Penalty scales with temperature: strict = heavy penalty, loose = lighter penalty
  const zeroSkillPenalty =
    skillPoints === 0 ? 0.15 + factors.temperature * 0.15 : 1.0

  // Temperature adjusts weight distribution
  // At higher temperatures (loose), bonuses matter more (encourages exploration)
  // At lower temperatures (strict), skills matter more
  const adjustedBonusWeight = weights.bonuses * factors.bonusMultiplier
  const adjustedSkillWeight = weights.skills * (2 - factors.bonusMultiplier)

  // Normalize weights to sum to 1
  const totalWeight = adjustedSkillWeight + adjustedBonusWeight
  const normalizedSkillWeight = adjustedSkillWeight / totalWeight
  const normalizedBonusWeight = adjustedBonusWeight / totalWeight

  // Calculate weighted average score
  const weightedScore =
    (skillPct * normalizedSkillWeight + bonusPct * normalizedBonusWeight) * 100

  // Apply zero-skill penalty
  const penalizedScore = weightedScore * zeroSkillPenalty

  // Apply temperature-based score curve
  // x^exponent where exponent < 1 expands low scores and exponent > 1 compresses them
  const curvedScore =
    Math.pow(penalizedScore / 100, factors.scoreCurveExponent) * 100

  return Math.min(100, Math.max(0, curvedScore))
}

/**
 * Calculate weighted score for a job posting with temperature control
 *
 * @param jobText - The job posting text
 * @param temperature - Temperature parameter (0.0-1.0) controlling matching strictness
 * @param userRegion - User's region for location-based bonuses
 * @returns WeightedMatchResult with score breakdown
 */
export function calculateWeightedScore(
  jobText: string,
  temperature: number = 0.4,
  userRegion: Region = 'EU'
): WeightedMatchResult {
  const normalizedText = jobText.toLowerCase()

  // Calculate temperature factors (includes effectiveSkillCeiling)
  const factors = calculateTemperatureFactors(temperature)

  // 1. Calculate skill points from matched skills
  const skillResult = calculateSkillPoints(normalizedText, factors)

  // 2. Calculate bonus points
  const bonusResult = calculateBonusPoints(jobText, userRegion, factors)

  // 3. Calculate max possible points (using top-N ceiling for skills)
  const maxSkillPoints = calculateMaxSkillPoints(factors)
  const maxBonusPoints = calculateMaxBonusPoints(factors)
  const maxPossiblePoints = maxSkillPoints + maxBonusPoints

  // 4. Calculate raw total (for backward compatibility in return value)
  const rawPoints = skillResult.totalPoints + bonusResult.totalPoints

  // 5. Normalize using weighted component scoring
  const normalizedScore = normalizeScore(
    skillResult.totalPoints,
    bonusResult.totalPoints,
    maxSkillPoints,
    maxBonusPoints,
    factors
  )

  return {
    score: Math.round(normalizedScore),
    rawPoints,
    maxPossiblePoints,
    skillPoints: skillResult.totalPoints,
    bonusPoints: bonusResult.totalPoints,
    matchedSkills: skillResult.matchedSkills,
    bonuses: bonusResult.bonuses,
    temperature,
  }
}

/**
 * Check if a job posting mentions remote work
 */
export function isRemoteJob(text: string): boolean {
  const remotePatterns = [
    /\bremote\b/i,
    /\bfully remote\b/i,
    /\b100% remote\b/i,
    /\bwork from home\b/i,
    /\bwfh\b/i,
    /\bremote[- ]first\b/i,
    /\bremote[- ]friendly\b/i,
    /\bdistributed team\b/i,
    /\banywhere\b/i,
    /\bworldwide\b/i,
  ]
  return remotePatterns.some((pattern) => pattern.test(text))
}

/**
 * Extract location from job posting
 * Common formats: "Company | Location | Role" or "Location:" or city/country names
 */
export function parseJobLocation(text: string): string | null {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '')

  // Try to extract from pipe-separated format (Company | Location | Role)
  const pipeMatch = cleanText.match(/^[^|]+\|([^|]+)\|/i)
  if (pipeMatch) {
    const location = pipeMatch[1].trim()
    // Check if it looks like a location (not a role)
    if (
      !/(engineer|developer|designer|manager|lead|senior|junior)/i.test(
        location
      )
    ) {
      return location
    }
  }

  // Try "Location:" pattern
  const locationMatch = cleanText.match(/location\s*:\s*([^\n|,]+)/i)
  if (locationMatch) {
    return locationMatch[1].trim()
  }

  return null
}

/**
 * Check if a word appears as a whole word in text (not as part of another word)
 */
function matchesWholeWord(text: string, word: string): boolean {
  const pattern = new RegExp(`\\b${word}\\b`, 'i')
  return pattern.test(text)
}

/**
 * Check if location matches user's country/city
 */
export function matchesUserLocation(
  jobText: string,
  userLocality: string,
  userCountry: string
): boolean {
  const text = jobText.toLowerCase()
  const locality = userLocality.toLowerCase()

  // Map country codes to country names and variations
  const countryMap: Record<string, string[]> = {
    IT: ['italy', 'italia', 'italian', 'eu', 'europe', 'emea'],
    US: ['usa', 'united states', 'america', 'american'],
    UK: ['uk', 'united kingdom', 'britain', 'british', 'england'],
    DE: ['germany', 'deutschland', 'german'],
    FR: ['france', 'french'],
    ES: ['spain', 'spanish', 'españa'],
    NL: ['netherlands', 'dutch', 'holland'],
  }

  // Check if locality is mentioned (as whole word)
  if (locality && matchesWholeWord(text, locality)) {
    return true
  }

  // Check country variations (as whole words to avoid matching "eu" in "queue", etc.)
  const countryVariations = countryMap[userCountry.toUpperCase()] || [
    userCountry.toLowerCase(),
  ]
  return countryVariations.some((variation) =>
    matchesWholeWord(text, variation)
  )
}

/**
 * Region types for geographic filtering
 */
export type Region = 'EU' | 'Americas' | 'APAC' | 'MENA' | 'Global'

/**
 * Map country codes to regions
 */
const countryToRegion: Record<string, Region> = {
  // European Union / Europe
  IT: 'EU',
  DE: 'EU',
  FR: 'EU',
  ES: 'EU',
  NL: 'EU',
  PT: 'EU',
  PL: 'EU',
  BE: 'EU',
  AT: 'EU',
  SE: 'EU',
  DK: 'EU',
  FI: 'EU',
  IE: 'EU',
  GR: 'EU',
  CZ: 'EU',
  HU: 'EU',
  RO: 'EU',
  CH: 'EU',
  NO: 'EU',
  // UK (often grouped with EU for remote work)
  UK: 'EU',
  GB: 'EU',
  // Americas
  US: 'Americas',
  CA: 'Americas',
  MX: 'Americas',
  BR: 'Americas',
  AR: 'Americas',
  CL: 'Americas',
  CO: 'Americas',
  // Asia-Pacific
  AU: 'APAC',
  NZ: 'APAC',
  JP: 'APAC',
  SG: 'APAC',
  IN: 'APAC',
  CN: 'APAC',
  KR: 'APAC',
  HK: 'APAC',
  TW: 'APAC',
  // Middle East / Africa
  IL: 'MENA',
  AE: 'MENA',
  ZA: 'MENA',
}

/**
 * Get user's region from country code
 */
export function getRegionFromCountry(countryCode: string): Region {
  return countryToRegion[countryCode.toUpperCase()] ?? 'Global'
}

/**
 * Get display label for a region
 */
export function getRegionLabel(region: Region): string {
  const labels: Record<Region, string> = {
    EU: 'EU',
    Americas: 'Americas',
    APAC: 'Asia-Pacific',
    MENA: 'MENA',
    Global: 'Global',
  }
  return labels[region]
}

/**
 * Region restriction patterns to detect geographic limitations in job postings
 */
const regionRestrictions: Array<{
  pattern: RegExp
  allowedRegions: Region[]
}> = [
  // US-only patterns
  {
    pattern:
      /\b(?:us[- ]?only|usa[- ]?only|united states[- ]?only|us[- ]?based[- ]?only|must be (?:in|based in) (?:the )?us)\b/i,
    allowedRegions: ['Americas'],
  },
  {
    pattern: /\bremote\s*\(?\s*us\s*(?:only)?\s*\)?/i,
    allowedRegions: ['Americas'],
  },
  // Europe/EU-only patterns
  {
    pattern:
      /\b(?:eu[- ]?only|europe[- ]?only|european[- ]?only|emea[- ]?only|must be (?:in|based in) (?:the )?eu)\b/i,
    allowedRegions: ['EU'],
  },
  {
    pattern: /\bremote\s*\(?\s*(?:eu|europe|emea)\s*(?:only)?\s*\)?/i,
    allowedRegions: ['EU'],
  },
  // Americas patterns (US + LATAM)
  {
    pattern:
      /\b(?:americas[- ]?only|north\s*america[- ]?only|us\/canada|us\s*(?:and|or|\/)\s*canada)\b/i,
    allowedRegions: ['Americas'],
  },
  // APAC patterns
  {
    pattern: /\b(?:apac[- ]?only|asia[- ]?pacific[- ]?only)\b/i,
    allowedRegions: ['APAC'],
  },
  // Timezone-based restrictions
  {
    pattern: /\b(?:us\s*time\s*zones?|est|pst|cst|mst)\s*(?:only|required)\b/i,
    allowedRegions: ['Americas'],
  },
  {
    pattern:
      /\b(?:cet|european\s*time\s*zones?|gmt(?:\s*\+?\s*[0-2])?)\s*(?:only|required)\b/i,
    allowedRegions: ['EU'],
  },
  // Global/Worldwide patterns (no restrictions)
  {
    pattern:
      /\b(?:fully\s*remote|remote\s*(?:anywhere|worldwide|global)|work\s*from\s*anywhere)\b/i,
    allowedRegions: ['EU', 'Americas', 'APAC', 'MENA', 'Global'],
  },
]

/**
 * Check if job is explicitly US-only (citizenship required, US locations only, etc.)
 */
export function isExplicitlyUSOnly(text: string): boolean {
  const usOnlyPatterns = [
    /\bu\.?s\.?\s*citizenship\s*required\b/i,
    /\busa?\s*citizenship\s*required\b/i,
    /\bmust\s*be\s*(?:a\s*)?u\.?s\.?\s*citizen\b/i,
    /\bsecurity\s*clearance\s*required\b/i,
    /\bremote\s*\(\s*us\s*\)/i, // "REMOTE (US)"
    /\bhybrid\s*\(\s*us\s*\)/i, // "Hybrid (US)"
    /\bhybrid\s*\(?\s*usa?\s*\)?/i,
    /\bonsite\s*\(?\s*usa?\s*\)?/i,
    /\bin[- ]?person\s*(?:in\s*)?(?:sf|nyc|la|austin|seattle|boston|chicago|denver)/i,
    /\bu\.?s\.?\s*(?:only|based)\b/i,
  ]
  return usOnlyPatterns.some((pattern) => pattern.test(text))
}

/**
 * Check if job explicitly mentions global/international availability
 */
function hasExplicitGlobalAvailability(text: string): boolean {
  const globalPatterns = [
    /\b(?:fully\s*remote|remote\s*(?:anywhere|worldwide|global)|work\s*from\s*anywhere)\b/i,
    /\bglobal(?:ly)?\s*(?:remote|distributed)\b/i,
    /\bremote\s*\(?\s*(?:eu|europe|emea|worldwide|global|anywhere)\b/i,
    /\b(?:worldwide|international|global)\s*(?:team|company|remote)\b/i,
  ]
  return globalPatterns.some((pattern) => pattern.test(text))
}

/**
 * Check if job appears to be US-centric based on various signals
 */
export function appearsUSCentric(text: string): boolean {
  const textLower = text.toLowerCase()

  // Check for multiple US cities listed (strong indicator of US-only)
  const usCities = [
    'san francisco',
    'sf',
    'new york',
    'nyc',
    'los angeles',
    'la',
    'austin',
    'seattle',
    'boston',
    'chicago',
    'denver',
    'miami',
    'atlanta',
    'dallas',
    'houston',
    'phoenix',
    'san diego',
    'san jose',
    'portland',
    'philadelphia',
    'washington dc',
    'dc',
    'boulder',
    'new jersey',
    'toronto', // Toronto often grouped with US
  ]
  let usCityCount = 0
  for (const city of usCities) {
    if (textLower.includes(city)) usCityCount++
  }
  // If 3+ US cities are listed, it's US-centric
  if (usCityCount >= 3) {
    // Unless EU is explicitly mentioned
    if (!/\b(?:eu|europe|emea|european)\b/i.test(textLower)) {
      return true
    }
  }

  // Check for US timezone mentions
  if (
    /\b(?:us|usa|america(?:n)?)\s*(?:timezone|time\s*zone|hours)s?\b/i.test(
      textLower
    )
  ) {
    return true
  }

  // Check for USD salary patterns
  const usdPatterns = [
    /\$\d{2,3}k/i, // $100k, $150k
    /\$\d{3},?\d{3}/i, // $100,000, $150000
    /\d{2,3}k\s*-\s*\d{2,3}k\s*usd/i, // 100k-150k USD
    /usd\s*\$?\d/i, // USD $100k
    /\$\d.*usd/i, // $100k USD
  ]

  const hasUSDSalary = usdPatterns.some((pattern) => pattern.test(text))
  if (!hasUSDSalary) return false

  // If has USD salary, check if it explicitly mentions international availability
  const internationalPatterns = [
    /\b(?:worldwide|global|international|anywhere|eu|europe|emea)\b/i,
    /\bremote\s*\(?\s*(?:eu|europe|emea|worldwide|global)\b/i,
    /\boutside\s*(?:the\s*)?(?:us|usa|united states)\b/i,
  ]

  return !internationalPatterns.some((pattern) => pattern.test(text))
}

/**
 * Check if a remote job is available in the user's region
 * Returns true if job is available, false if restricted to another region
 */
export function isRemoteJobAvailableInRegion(
  jobText: string,
  userRegion: Region
): boolean {
  const text = jobText.toLowerCase()

  // First check explicit region restrictions
  for (const { pattern, allowedRegions } of regionRestrictions) {
    if (pattern.test(text)) {
      return allowedRegions.includes(userRegion)
    }
  }

  // Check if job appears US-centric (USD salary without international mention)
  if (appearsUSCentric(text)) {
    return userRegion === 'Americas'
  }

  // Check for explicit global availability
  if (hasExplicitGlobalAvailability(text)) {
    return true
  }

  // No clear signals - default to available (benefit of doubt for jobs without salary info)
  return true
}

/**
 * Parse company name from HN job comment
 * Most job posts start with "Company Name | ..." or "Company Name is hiring"
 */
export function parseCompanyName(commentText: string): string {
  // Remove HTML tags for parsing
  const text = commentText.replace(/<[^>]*>/g, '').trim()

  // Try to extract from "Company | Role | Location" pattern
  const pipeMatch = text.match(/^([^|<\n]+?)(?:\s*\||\s*-\s)/i)
  if (pipeMatch) {
    const company = pipeMatch[1].trim()
    // Avoid returning the whole first line if it's too long
    if (company.length <= 50) {
      return company
    }
  }

  // Try to extract from "Company is hiring" pattern
  const hiringMatch = text.match(
    /^([^|<\n.]+?)\s+(?:is|are)\s+(?:hiring|looking)/i
  )
  if (hiringMatch) {
    const company = hiringMatch[1].trim()
    if (company.length <= 50) {
      return company
    }
  }

  // Try first word(s) before common keywords
  const keywordMatch = text.match(
    /^(.+?)(?=\s*(?:\||hiring|engineer|developer|remote|full-time|part-time))/i
  )
  if (keywordMatch) {
    const company = keywordMatch[1].trim()
    if (company.length >= 2 && company.length <= 50) {
      return company
    }
  }

  // Fallback: first line, truncated
  const firstLine = text.split('\n')[0].trim()
  if (firstLine.length <= 50) {
    return firstLine
  }
  return firstLine.substring(0, 47) + '...'
}

// ============================================================================
// LOCATION CLASSIFICATION SYSTEM
// ============================================================================

/**
 * Patterns indicating on-site only work
 */
const ON_SITE_PATTERNS = [
  /\b(?:onsite|on[- ]site)\b/i,
  /\bin[- ]?person\b/i,
  /\bin[- ]?office\b/i,
  /\boffice[- ]first\b/i,
  /\boffice[- ]based\b/i,
  /\bno\s*remote\b/i,
  /\bremote\s*(?:not|isn't|is not)\s*(?:available|possible|an option)\b/i,
  /\bmust\s*(?:be\s*)?(?:work|based)\s*(?:in|from)\s*(?:our\s*)?(?:office|hq)\b/i,
]

/**
 * Patterns indicating hybrid work (some remote, some office)
 */
const HYBRID_PATTERNS = [
  /\bhybrid\b/i,
  /\bflexible\s*(?:remote|wfh|work from home)\b/i,
  /\b(?:remote|wfh)\s*(?:1|2|3)\s*days?\s*(?:a\s*)?week\b/i,
  /\bpartially\s*remote\b/i,
  /\bremote\s*optional\b/i,
]

/**
 * Patterns indicating fully remote with no geographic restrictions
 */
const REMOTE_GLOBAL_PATTERNS = [
  /\bfully\s*remote\b/i,
  /\b100%\s*remote\b/i,
  /\bremote[- ]first\b/i,
  /\bremote\s*(?:anywhere|worldwide|global)\b/i,
  /\bwork\s*from\s*anywhere\b/i,
  /\bdistributed\s*(?:team|company)\b/i,
  /\basync[- ]first\b/i,
  /\bglobal(?:ly)?\s*(?:remote|distributed)\b/i,
  /\b(?:worldwide|international|global)\s*(?:team|company|remote)\b/i,
]

/**
 * Patterns for detecting EU as PRIMARY location
 */
const EU_PRIMARY_PATTERNS = [
  // "Remote (EU)" or "Remote (EU only)" - EU in parentheses is primary
  /\bremote\s*\(\s*(?:eu|europe|emea)\s*(?:only)?\s*\)/i,
  // "Remote - EU only" or "Remote, EU only"
  /\bremote\s*[-,]\s*(?:eu|europe|emea)\s*only\b/i,
  // "EU-based remote" or "Europe-based remote"
  /\b(?:eu|europe|emea)[- ]based\s*remote\b/i,
  // "EU remote" or "Europe remote"
  /\b(?:eu|europe|emea)\s*remote\b/i,
  // "Remote (Europe only)"
  /\bremote\s*\(\s*europe\s*only\s*\)/i,
  // Explicit EU preference
  /\beu\s*(?:preferred|timezone|hours)\b/i,
  /\beuropean\s*(?:timezone|hours|candidates?)\s*(?:only|preferred|required)\b/i,
]

/**
 * Patterns for detecting US/Americas as PRIMARY location
 */
const US_PRIMARY_PATTERNS = [
  // "Remote (US)" or "Remote (USA)" or "Remote (US only)"
  /\bremote\s*\(\s*(?:us|usa|united states)\s*(?:only)?\s*\)/i,
  // "US REMOTE" or "USA Remote"
  /\b(?:us|usa)\s+remote\b/i,
  // "US-based remote"
  /\b(?:us|usa|united states)[- ]based\s*remote\b/i,
  // "Remote (US/Canada)" or "Remote (US, Canada)" - both are primary Americas
  /\bremote\s*\(\s*(?:us|usa)\s*[,/]\s*canada\s*\)/i,
  // "Remote (North America)" or timezone-restricted
  /\bremote\s*\(\s*north\s*america[^)]*\)/i,
  // US timezone requirements (various formats)
  /\b(?:us|america(?:n)?)\s*(?:timezone|hours|time\s*zone)s?\b/i,
  /\b(?:est|pst|cst|mst|pt|et|ct|mt)[/-](?:est|pst|cst|mst|pt|et|ct|mt)\b/i,
  /\bgmt[- ]?[45678]\b/i, // GMT-4 to GMT-8 are US timezones
  // Full-time with US timezones
  /\bfull[- ]?time\s*\(\s*(?:us|usa)\s*(?:timezone|hours|time\s*zone)s?\s*\)/i,
  // US work authorization requirements
  /\b(?:legal(?:ly)?|authorized?|eligible)\s+to\s+work\s+in\s+(?:the\s+)?(?:us|usa|united states)\b/i,
  /\bmust\s+(?:be\s+)?(?:legally\s+)?(?:authorized?|eligible)\s+(?:to\s+work\s+)?in\s+(?:the\s+)?(?:us|usa|united states)\b/i,
  // "United States" as standalone location (e.g., "| United States |")
  /\|\s*united states\s*\|/i,
]

/**
 * Patterns indicating EU is SECONDARY (mentioned but not primary focus)
 * These typically list US/Americas first, then Europe as an option
 */
const EU_SECONDARY_PATTERNS = [
  // "Remote (US/Canada/Europe)" or "Remote (US, Canada, Europe)" - when listed after US/Canada, EU is secondary
  /\bremote\s*\(\s*(?:us|usa)\s*[,/]\s*canada\s*[,/]\s*(?:europe|eu)\s*\)/i,
  // "US or Europe" or "US/Europe" - US listed first
  /\b(?:us|usa|united states)\s*(?:or|\/|,)\s*(?:europe|eu)\b/i,
  // "Americas and Europe" or "North America and Europe"
  /\b(?:americas?|north\s*america)\s*(?:and|&|,)\s*(?:europe|eu)\b/i,
  // "US primarily, Europe possible" style
  /\b(?:us|usa)\s*(?:primarily|mainly|preferred).*?(?:europe|eu)\b/i,
  // "Open to Europe" - secondary intent
  /\b(?:open to|consider(?:ing)?|possible(?:ly)?)\s*(?:europe|eu)\b/i,
  // Optional hubs pattern: "optional hubs SF & Toronto" with EU mentioned elsewhere
  /\boptional\s*hubs?\s*(?:sf|san francisco|nyc|new york|toronto)/i,
]

/**
 * Known EU cities for on-site location detection
 */
const EU_CITIES = new Set([
  'london',
  'berlin',
  'paris',
  'amsterdam',
  'dublin',
  'munich',
  'münchen',
  'barcelona',
  'madrid',
  'lisbon',
  'lisboa',
  'vienna',
  'wien',
  'stockholm',
  'copenhagen',
  'helsinki',
  'oslo',
  'zurich',
  'zürich',
  'geneva',
  'genève',
  'milan',
  'milano',
  'rome',
  'roma',
  'brussels',
  'bruxelles',
  'prague',
  'praha',
  'warsaw',
  'warszawa',
  'budapest',
  'bucharest',
  'athens',
  'edinburgh',
  'manchester',
  'birmingham',
])

/**
 * Known US cities for on-site location detection
 */
const US_CITIES = new Set([
  'san francisco',
  'sf',
  'new york',
  'nyc',
  'los angeles',
  'la',
  'austin',
  'seattle',
  'boston',
  'chicago',
  'denver',
  'miami',
  'atlanta',
  'dallas',
  'houston',
  'phoenix',
  'san diego',
  'san jose',
  'portland',
  'philadelphia',
  'washington dc',
  'dc',
  'boulder',
  'palo alto',
  'mountain view',
  'menlo park',
  'cupertino',
  'sunnyvale',
  'redwood city',
  'oakland',
  'berkeley',
])

/**
 * Analyze job text for primary vs secondary location regions
 */
export function analyzeLocationPriority(text: string): {
  primaryRegions: Region[]
  secondaryRegions: Region[]
  excludedRegions: Region[]
} {
  const result: {
    primaryRegions: Region[]
    secondaryRegions: Region[]
    excludedRegions: Region[]
  } = {
    primaryRegions: [],
    secondaryRegions: [],
    excludedRegions: [],
  }

  const normalizedText = text.toLowerCase()

  // Check for EU primary patterns
  for (const pattern of EU_PRIMARY_PATTERNS) {
    if (pattern.test(normalizedText)) {
      if (!result.primaryRegions.includes('EU')) {
        result.primaryRegions.push('EU')
      }
      break
    }
  }

  // Check for US primary patterns
  for (const pattern of US_PRIMARY_PATTERNS) {
    if (pattern.test(normalizedText)) {
      if (!result.primaryRegions.includes('Americas')) {
        result.primaryRegions.push('Americas')
      }
      break
    }
  }

  // Check for EU secondary patterns (only if EU not already primary)
  if (!result.primaryRegions.includes('EU')) {
    for (const pattern of EU_SECONDARY_PATTERNS) {
      if (pattern.test(normalizedText)) {
        if (!result.secondaryRegions.includes('EU')) {
          result.secondaryRegions.push('EU')
        }
        // Also mark Americas as primary if not already
        if (!result.primaryRegions.includes('Americas')) {
          result.primaryRegions.push('Americas')
        }
        break
      }
    }
  }

  // Check exclusion patterns
  const exclusionPatterns: Array<{ pattern: RegExp; region: Region }> = [
    {
      pattern: /\bno\s+(?:us|usa|united states)\s*citizen/i,
      region: 'Americas',
    },
    { pattern: /\bexcluding\s+(?:eu|europe)\b/i, region: 'EU' },
    { pattern: /\bnot\s+available\s+(?:in\s+)?(?:eu|europe)\b/i, region: 'EU' },
  ]

  for (const { pattern, region } of exclusionPatterns) {
    if (pattern.test(normalizedText)) {
      if (!result.excludedRegions.includes(region)) {
        result.excludedRegions.push(region)
      }
    }
  }

  return result
}

/**
 * Detect if a post contains multiple roles with different location requirements
 */
export function detectMultiRolePost(text: string): {
  isMultiRole: boolean
  roleBreakdown?: {
    remoteRoles: number
    onSiteRoles: number
    hybridRoles: number
  }
} {
  // Split by both newlines and pipes to find individual role mentions
  // This handles both multi-line and pipe-separated formats
  const segments = text.split(/[\n|]/)
  let roleCount = 0
  let remoteRoles = 0
  let onSiteRoles = 0
  let hybridRoles = 0

  // Look for role patterns
  const rolePattern =
    /(?:engineer|developer|designer|manager|lead|analyst|architect|scientist|director|vp|head of|product|marketing|sales|ops|operations|devrel|sre|devops|co-?op)\b/i

  // City detection pattern
  const usCityPattern =
    /\b(?:sf|san francisco|nyc|new york|austin|seattle|boston|chicago|denver|miami|atlanta|los angeles|la|toronto)\b/i

  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed || trimmed.length < 5) continue

    if (rolePattern.test(trimmed)) {
      roleCount++
      const segmentLower = trimmed.toLowerCase()

      // Check for on-site patterns or US cities
      if (ON_SITE_PATTERNS.some((p) => p.test(segmentLower))) {
        onSiteRoles++
      } else if (
        usCityPattern.test(segmentLower) &&
        !/\bremote\b/i.test(segmentLower)
      ) {
        // US city mentioned without "remote" = on-site
        onSiteRoles++
      } else if (HYBRID_PATTERNS.some((p) => p.test(segmentLower))) {
        hybridRoles++
      } else if (
        /\bremote\s*(?:friendly|optional)?\b/i.test(segmentLower) ||
        REMOTE_GLOBAL_PATTERNS.some((p) => p.test(segmentLower))
      ) {
        remoteRoles++
      }
    }
  }

  // Multi-role only if we have roles with DIFFERENT location types
  // (e.g., remote AND on-site, not just multiple remote roles)
  const locationTypeCount =
    (remoteRoles > 0 ? 1 : 0) +
    (onSiteRoles > 0 ? 1 : 0) +
    (hybridRoles > 0 ? 1 : 0)

  const isMultiRole = roleCount > 1 && locationTypeCount > 1

  if (!isMultiRole) {
    return { isMultiRole: false }
  }

  return {
    isMultiRole: true,
    roleBreakdown: {
      remoteRoles,
      onSiteRoles,
      hybridRoles,
    },
  }
}

/**
 * Extract on-site locations mentioned in the text
 */
function extractOnSiteLocations(text: string): string[] {
  const locations: string[] = []
  const textLower = text.toLowerCase()

  // Check for EU cities
  for (const city of EU_CITIES) {
    const pattern = new RegExp(`\\b${city}\\b`, 'i')
    if (pattern.test(textLower)) {
      locations.push(city.charAt(0).toUpperCase() + city.slice(1))
    }
  }

  // Check for US cities
  for (const city of US_CITIES) {
    const pattern = new RegExp(`\\b${city}\\b`, 'i')
    if (pattern.test(textLower)) {
      locations.push(city.charAt(0).toUpperCase() + city.slice(1))
    }
  }

  return [...new Set(locations)] // Remove duplicates
}

/**
 * Check if on-site locations are in EU
 */
function hasEUOnSiteLocation(locations: string[]): boolean {
  for (const loc of locations) {
    const locLower = loc.toLowerCase()
    if (EU_CITIES.has(locLower)) {
      return true
    }
  }
  return false
}

/**
 * Main function: Classify job location type and extract location data
 */
export function classifyJobLocation(text: string): ParsedLocationData {
  const normalizedText = text.toLowerCase()
  const onSiteLocations = extractOnSiteLocations(text)

  // Step 1: Check for multi-role posts
  const multiRole = detectMultiRolePost(text)
  if (multiRole.isMultiRole && multiRole.roleBreakdown) {
    const { remoteRoles, onSiteRoles } = multiRole.roleBreakdown

    // If mixed remote/on-site, classify as MIXED_ROLES
    if (remoteRoles > 0 && onSiteRoles > 0) {
      const locationAnalysis = analyzeLocationPriority(text)
      return {
        type: 'MIXED_ROLES',
        primaryRegions: locationAnalysis.primaryRegions,
        secondaryRegions: locationAnalysis.secondaryRegions,
        onSiteLocations,
        excludedRegions: locationAnalysis.excludedRegions,
        confidence: 'medium',
        roleBreakdown: multiRole.roleBreakdown,
      }
    }
  }

  // Step 2: Check for hybrid (remote-friendly but not fully remote)
  // Check BEFORE on-site because hybrid patterns are more specific
  const hasRemoteMention = /\bremote\b/i.test(normalizedText)
  const hasRemoteGlobal = REMOTE_GLOBAL_PATTERNS.some((p) =>
    p.test(normalizedText)
  )
  const isHybrid = HYBRID_PATTERNS.some((p) => p.test(normalizedText))
  if (isHybrid && !hasRemoteGlobal) {
    const locationAnalysis = analyzeLocationPriority(text)
    return {
      type: 'HYBRID',
      primaryRegions: locationAnalysis.primaryRegions,
      secondaryRegions: locationAnalysis.secondaryRegions,
      onSiteLocations,
      excludedRegions: locationAnalysis.excludedRegions,
      confidence: 'medium',
    }
  }

  // Step 3: Check for explicit on-site (no remote mention or explicit on-site keywords)
  const hasOnSiteKeywords = ON_SITE_PATTERNS.some((p) => p.test(normalizedText))
  if (hasOnSiteKeywords && !hasRemoteGlobal) {
    const locationAnalysis = analyzeLocationPriority(text)
    return {
      type: 'ON_SITE',
      primaryRegions: locationAnalysis.primaryRegions,
      secondaryRegions: locationAnalysis.secondaryRegions,
      onSiteLocations,
      excludedRegions: locationAnalysis.excludedRegions,
      confidence: 'high',
    }
  }

  // Step 4: Check for fully remote (global)
  if (hasRemoteGlobal) {
    const locationAnalysis = analyzeLocationPriority(text)

    // If no regional restrictions, it's truly global
    if (
      locationAnalysis.primaryRegions.length === 0 &&
      !appearsUSCentric(text)
    ) {
      return {
        type: 'REMOTE_GLOBAL',
        primaryRegions: [],
        secondaryRegions: [],
        onSiteLocations: [],
        excludedRegions: locationAnalysis.excludedRegions,
        confidence: 'high',
      }
    }
  }

  // Step 5: Check for regional remote
  if (hasRemoteMention) {
    const locationAnalysis = analyzeLocationPriority(text)

    // If has regional restrictions, it's regional remote
    if (
      locationAnalysis.primaryRegions.length > 0 ||
      locationAnalysis.excludedRegions.length > 0 ||
      appearsUSCentric(text)
    ) {
      // If appears US-centric without explicit regions, add Americas as primary
      if (
        locationAnalysis.primaryRegions.length === 0 &&
        appearsUSCentric(text)
      ) {
        locationAnalysis.primaryRegions.push('Americas')
      }

      return {
        type: 'REMOTE_REGIONAL',
        primaryRegions: locationAnalysis.primaryRegions,
        secondaryRegions: locationAnalysis.secondaryRegions,
        onSiteLocations: [],
        excludedRegions: locationAnalysis.excludedRegions,
        confidence:
          locationAnalysis.primaryRegions.length > 0 ? 'high' : 'medium',
      }
    }

    // Remote mentioned but no restrictions found - treat as global
    return {
      type: 'REMOTE_GLOBAL',
      primaryRegions: [],
      secondaryRegions: [],
      onSiteLocations: [],
      excludedRegions: [],
      confidence: 'medium',
    }
  }

  // Step 6: No remote mention - check if on-site locations exist
  if (onSiteLocations.length > 0) {
    return {
      type: 'ON_SITE',
      primaryRegions: [],
      secondaryRegions: [],
      onSiteLocations,
      excludedRegions: [],
      confidence: 'medium',
    }
  }

  // Step 7: Unknown - no clear location signals
  return {
    type: 'UNKNOWN',
    primaryRegions: [],
    secondaryRegions: [],
    onSiteLocations: [],
    excludedRegions: [],
    confidence: 'low',
  }
}

// ============================================================================
// FILTER MATCHING FUNCTIONS
// ============================================================================

/**
 * Check if job matches "Remote (Global)" filter
 * Only REMOTE_GLOBAL jobs - available worldwide with no restrictions
 */
export function matchesRemoteGlobalFilter(
  locationData: ParsedLocationData
): boolean {
  return locationData.type === 'REMOTE_GLOBAL'
}

/**
 * Check if job matches "Remote (EU)" filter
 * REMOTE_GLOBAL + REMOTE_REGIONAL where EU is PRIMARY
 */
export function matchesRemoteEUFilter(
  locationData: ParsedLocationData,
  userRegion: Region = 'EU'
): boolean {
  const { type, primaryRegions, secondaryRegions, excludedRegions } =
    locationData

  // Exclude if EU is explicitly excluded
  if (excludedRegions.includes(userRegion)) {
    return false
  }

  // REMOTE_GLOBAL always matches
  if (type === 'REMOTE_GLOBAL') {
    return true
  }

  // REMOTE_REGIONAL: EU must be PRIMARY (not secondary)
  if (type === 'REMOTE_REGIONAL') {
    // If EU is only secondary, exclude
    if (
      secondaryRegions.includes(userRegion) &&
      !primaryRegions.includes(userRegion)
    ) {
      return false
    }
    // EU is primary or no regional restrictions (benefit of doubt)
    if (primaryRegions.includes(userRegion) || primaryRegions.length === 0) {
      return true
    }
  }

  return false
}

/**
 * Check if job matches "On-site (EU)" filter
 * ON_SITE + HYBRID jobs in EU countries
 */
export function matchesOnSiteEUFilter(
  locationData: ParsedLocationData
): boolean {
  const { type, onSiteLocations } = locationData

  // Only ON_SITE and HYBRID types
  if (type !== 'ON_SITE' && type !== 'HYBRID') {
    return false
  }

  // Check if on-site locations include EU
  return hasEUOnSiteLocation(onSiteLocations)
}

/**
 * Check if job matches "Any (EU)" filter
 * All jobs available to EU: remote-global + remote-eu + onsite-eu
 */
export function matchesAnyEUFilter(
  locationData: ParsedLocationData,
  userRegion: Region = 'EU'
): boolean {
  // Check remote global
  if (matchesRemoteGlobalFilter(locationData)) {
    return true
  }

  // Check remote EU
  if (matchesRemoteEUFilter(locationData, userRegion)) {
    return true
  }

  // Check on-site EU
  if (matchesOnSiteEUFilter(locationData)) {
    return true
  }

  // MIXED_ROLES: include if any part is EU-available
  if (locationData.type === 'MIXED_ROLES') {
    const { primaryRegions, excludedRegions, onSiteLocations } = locationData

    // Exclude if EU is explicitly excluded
    if (excludedRegions.includes(userRegion)) {
      return false
    }

    // Include if EU is primary
    if (primaryRegions.includes(userRegion)) {
      return true
    }

    // Include if has EU on-site location
    if (hasEUOnSiteLocation(onSiteLocations)) {
      return true
    }

    // If has on-site locations but none in EU, exclude (clearly regional to those locations)
    if (onSiteLocations.length > 0) {
      return false
    }

    // No on-site locations and no primary regions - give benefit of doubt
    if (primaryRegions.length === 0) {
      return true
    }
  }

  return false
}

/**
 * Apply location filter to a job
 * Main entry point for filtering
 */
export function matchesLocationFilter(
  locationData: ParsedLocationData,
  filter: 'all' | 'remote-global' | 'remote-eu' | 'onsite-eu' | 'any-eu',
  userRegion: Region = 'EU'
): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'remote-global':
      return matchesRemoteGlobalFilter(locationData)
    case 'remote-eu':
      return matchesRemoteEUFilter(locationData, userRegion)
    case 'onsite-eu':
      return matchesOnSiteEUFilter(locationData)
    case 'any-eu':
      return matchesAnyEUFilter(locationData, userRegion)
    default:
      return true
  }
}
