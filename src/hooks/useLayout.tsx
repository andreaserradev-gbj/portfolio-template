import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { features } from '@/config/loader'

export type Layout = 'cards' | 'editorial'

const LAYOUTS: readonly Layout[] = ['cards', 'editorial']
const STORAGE_KEY = 'portfolio-layout'
const URL_PARAM = 'layout'

const CONFIG_DEFAULT_LAYOUT: Layout =
  features?.layout === 'editorial' ? 'editorial' : 'cards'

interface LayoutContextType {
  layout: Layout
  setLayout: (next: Layout) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

function isLayout(value: unknown): value is Layout {
  return typeof value === 'string' && LAYOUTS.includes(value as Layout)
}

function getUrlLayout(): Layout | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const urlLayout = params.get(URL_PARAM)
  return isLayout(urlLayout) ? urlLayout : null
}

function getStoredLayout(): Layout {
  if (typeof window === 'undefined') return CONFIG_DEFAULT_LAYOUT
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      if (isLayout(stored)) return stored
      console.warn(
        `Invalid layout value "${stored}" in localStorage. ` +
          `Valid: ${LAYOUTS.join(', ')}. Using config default.`
      )
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.warn(
      'localStorage unavailable, using config default layout:',
      error
    )
  }
  return CONFIG_DEFAULT_LAYOUT
}

function getInitialLayout(): { layout: Layout; fromUrl: boolean } {
  const fromUrl = getUrlLayout()
  if (fromUrl) return { layout: fromUrl, fromUrl: true }
  return { layout: getStoredLayout(), fromUrl: false }
}

function updateUrlParam(layout: Layout) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(URL_PARAM, layout)
  window.history.replaceState(null, '', url.toString())
}

const initialLayoutState = getInitialLayout()

export function LayoutProvider({ children }: { children: ReactNode }) {
  const fromUrlRef = useRef(initialLayoutState.fromUrl)
  const [layout, setLayoutState] = useState<Layout>(initialLayoutState.layout)

  // Reflect on the html element so CSS or feature gates can target it
  useEffect(() => {
    document.documentElement.setAttribute('data-layout', layout)
  }, [layout])

  const setLayout = (next: Layout) => {
    setLayoutState(next)
    updateUrlParam(next)
    if (!fromUrlRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch (error) {
        console.warn('Could not persist layout preference:', error)
      }
    }
  }

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (ctx === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return ctx
}
