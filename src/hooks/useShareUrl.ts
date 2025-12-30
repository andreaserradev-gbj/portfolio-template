import { useCallback } from 'react'
import { useTheme } from './useTheme'
import { useDesignSystem } from './useDesignSystem'

interface CopyResult {
  success: boolean
  url: string
  error?: string
}

export function useShareUrl() {
  const { theme } = useTheme()
  const { designSystem } = useDesignSystem()

  const getShareUrl = useCallback(() => {
    const url = new URL(window.location.href)
    url.hash = '' // Remove hash/anchor
    url.searchParams.set('theme', theme)
    url.searchParams.set('design', designSystem)
    return url.toString()
  }, [theme, designSystem])

  const copyShareUrl = useCallback(async (): Promise<CopyResult> => {
    const url = getShareUrl()

    // Check for clipboard API availability
    if (!navigator.clipboard?.writeText) {
      return {
        success: false,
        url,
        error: 'Clipboard API not available in this browser',
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      return { success: true, url }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown clipboard error'
      return { success: false, url, error: message }
    }
  }, [getShareUrl])

  return { getShareUrl, copyShareUrl }
}
