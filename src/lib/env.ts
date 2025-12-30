/**
 * Check if the HN Job Board feature is enabled.
 *
 * Priority:
 * 1. VITE_HN_JOB_BOARD=true → enabled
 * 2. VITE_HN_JOB_BOARD=false → disabled
 * 3. Not set → enabled in dev, disabled in production
 */
export function isJobBoardEnabled(): boolean {
  const envValue = import.meta.env.VITE_HN_JOB_BOARD

  if (envValue === 'true') return true
  if (envValue === 'false') return false

  // Default: enabled in development, disabled in production
  return import.meta.env.DEV
}
