/**
 * Design System Configuration
 *
 * Loads design system list from JSON configuration.
 * NOTE: When modifying design systems, edit src/config/design-systems.json
 * and also update the inline script in index.html to prevent flash.
 */

import { designSystemsConfig } from '@/config/loader'

/**
 * Validates that an array has at least one element and returns it as a non-empty tuple.
 * Throws an error if the array is empty.
 */
function ensureNonEmpty<T>(
  arr: T[],
  errorMessage: string
): readonly [T, ...T[]] {
  if (arr.length === 0) {
    throw new Error(errorMessage)
  }
  // After the length check, we know arr[0] exists
  return arr as unknown as readonly [T, ...T[]]
}

// Derive design systems array from JSON configuration
// Runtime validation ensures this is a non-empty tuple
const systemIds = designSystemsConfig.systems.map((s) => s.id)
export const DESIGN_SYSTEMS = ensureNonEmpty(
  systemIds,
  'Invalid design-systems.json: At least one design system is required'
)

// Type derived from the design systems array
export type DesignSystem = (typeof DESIGN_SYSTEMS)[number]

// Validate defaultSystem exists in the systems array
// (Zod now validates this, but we check at runtime for type safety)
if (!systemIds.includes(designSystemsConfig.defaultSystem)) {
  throw new Error(
    `Invalid design-systems.json: defaultSystem "${designSystemsConfig.defaultSystem}" not found in systems`
  )
}

// Default system from JSON configuration (validated above)
export const DEFAULT_DESIGN_SYSTEM =
  designSystemsConfig.defaultSystem as DesignSystem

/**
 * Type guard to check if a value is a valid design system ID.
 */
export function isDesignSystem(value: unknown): value is DesignSystem {
  return (
    typeof value === 'string' && DESIGN_SYSTEMS.includes(value as DesignSystem)
  )
}

/**
 * Get design system metadata by ID.
 */
export function getDesignSystemInfo(id: DesignSystem) {
  return designSystemsConfig.systems.find((s) => s.id === id)
}

/**
 * Get all design system metadata.
 */
export function getAllDesignSystems() {
  return designSystemsConfig.systems
}
