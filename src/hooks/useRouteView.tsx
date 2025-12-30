import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { isJobBoardEnabled } from '@/lib/env'

export type ViewType = 'portfolio' | 'jobs'

const VIEW_PARAM = 'view'
const isFeatureEnabled = isJobBoardEnabled()

interface RouteViewContextType {
  view: ViewType
  setView: (view: ViewType) => void
  isJobsEnabled: boolean
}

const RouteViewContext = createContext<RouteViewContextType | undefined>(
  undefined
)

function getUrlView(): ViewType | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const urlView = params.get(VIEW_PARAM)
  if (urlView === 'jobs') {
    return 'jobs'
  }
  return null
}

function getInitialView(): ViewType {
  if (!isFeatureEnabled) {
    return 'portfolio'
  }

  const urlView = getUrlView()
  return urlView ?? 'portfolio'
}

// Compute initial state once at module load time
const initialView = getInitialView()

export function RouteViewProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<ViewType>(initialView)

  const setView = useCallback((newView: ViewType) => {
    if (!isFeatureEnabled) return

    setViewState(newView)
    const url = new URL(window.location.href)
    if (newView === 'jobs') {
      url.searchParams.set(VIEW_PARAM, 'jobs')
    } else {
      url.searchParams.delete(VIEW_PARAM)
    }
    window.history.pushState(null, '', url.toString())
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    if (!isFeatureEnabled) return

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setViewState(params.get(VIEW_PARAM) === 'jobs' ? 'jobs' : 'portfolio')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const contextValue: RouteViewContextType = {
    view: isFeatureEnabled ? view : 'portfolio',
    setView,
    isJobsEnabled: isFeatureEnabled,
  }

  return (
    <RouteViewContext.Provider value={contextValue}>
      {children}
    </RouteViewContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRouteView() {
  const context = useContext(RouteViewContext)
  if (context === undefined) {
    throw new Error('useRouteView must be used within a RouteViewProvider')
  }
  return context
}
