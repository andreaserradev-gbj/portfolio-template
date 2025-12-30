import { useState, useCallback } from 'react'

const STORAGE_KEY = 'portfolio-theme-chooser-seen'

function getInitialShowPulse(): boolean {
  if (typeof window === 'undefined') return false
  return !localStorage.getItem(STORAGE_KEY)
}

export function useFirstVisit() {
  const [showPulse, setShowPulse] = useState(getInitialShowPulse)

  const dismissPulse = useCallback(() => {
    setShowPulse(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }, [])

  return { showPulse, dismissPulse }
}
