import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import {
  isDesignSystem,
  DESIGN_SYSTEMS,
  DEFAULT_DESIGN_SYSTEM,
  type DesignSystem,
} from './designSystemConfig'

export type { DesignSystem }

interface DesignSystemContextType {
  designSystem: DesignSystem
  setDesignSystem: (ds: DesignSystem) => void
}

const DesignSystemContext = createContext<DesignSystemContextType | undefined>(
  undefined
)

const STORAGE_KEY = 'portfolio-design-system'
const URL_PARAM = 'design'

function getUrlDesignSystem(): DesignSystem | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const urlDesign = params.get(URL_PARAM)
  if (urlDesign && isDesignSystem(urlDesign)) {
    return urlDesign
  }
  return null
}

function getStoredDesignSystem(): DesignSystem {
  if (typeof window === 'undefined') return DEFAULT_DESIGN_SYSTEM
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      if (isDesignSystem(stored)) {
        return stored
      }
      // Invalid stored value - log and clear it
      console.warn(
        `Invalid design system value "${stored}" found in localStorage. ` +
          `Valid options: ${DESIGN_SYSTEMS.join(', ')}. Using default.`
      )
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.warn(
      'localStorage unavailable, using default design system:',
      error
    )
  }
  return DEFAULT_DESIGN_SYSTEM
}

function getInitialDesignSystem(): {
  designSystem: DesignSystem
  fromUrl: boolean
} {
  const urlDesign = getUrlDesignSystem()
  if (urlDesign) {
    return { designSystem: urlDesign, fromUrl: true }
  }
  return { designSystem: getStoredDesignSystem(), fromUrl: false }
}

function updateUrlParam(designSystem: DesignSystem) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(URL_PARAM, designSystem)
  window.history.replaceState(null, '', url.toString())
}

// Compute initial state once at module load time
const initialDesignSystemState = getInitialDesignSystem()

export function DesignSystemProvider({ children }: { children: ReactNode }) {
  const fromUrlRef = useRef(initialDesignSystemState.fromUrl)
  const [designSystem, setDesignSystemState] = useState<DesignSystem>(
    initialDesignSystemState.designSystem
  )

  // Apply design system attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-design-system', designSystem)
  }, [designSystem])

  const setDesignSystem = (ds: DesignSystem) => {
    setDesignSystemState(ds)

    // Update URL param
    updateUrlParam(ds)

    // Only persist to localStorage if not initially loaded from URL
    if (!fromUrlRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY, ds)
      } catch (error) {
        console.warn('Could not persist design system preference:', error)
      }
    }
  }

  return (
    <DesignSystemContext.Provider value={{ designSystem, setDesignSystem }}>
      {children}
    </DesignSystemContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDesignSystem() {
  const context = useContext(DesignSystemContext)
  if (context === undefined) {
    throw new Error(
      'useDesignSystem must be used within a DesignSystemProvider'
    )
  }
  return context
}
