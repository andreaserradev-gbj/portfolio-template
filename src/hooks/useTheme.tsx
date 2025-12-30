import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react'
import { isTheme, THEMES, type Theme, type ResolvedTheme } from './themeConfig'

export type { Theme, ResolvedTheme }

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'portfolio-theme'
const URL_PARAM = 'theme'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getUrlTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const urlTheme = params.get(URL_PARAM)
  if (urlTheme && isTheme(urlTheme)) {
    return urlTheme
  }
  return null
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      if (isTheme(stored)) {
        return stored
      }
      // Invalid stored value - log and clear it
      console.warn(
        `Invalid theme value "${stored}" found in localStorage. ` +
          `Valid options: ${THEMES.join(', ')}. Using default.`
      )
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (error) {
    console.warn('localStorage unavailable, using default theme:', error)
  }
  return 'system'
}

function getInitialTheme(): { theme: Theme; fromUrl: boolean } {
  const urlTheme = getUrlTheme()
  if (urlTheme) {
    return { theme: urlTheme, fromUrl: true }
  }
  return { theme: getStoredTheme(), fromUrl: false }
}

function updateUrlParam(theme: Theme) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(URL_PARAM, theme)
  window.history.replaceState(null, '', url.toString())
}

// Compute initial state once at module load time
const initialThemeState = getInitialTheme()

export function ThemeProvider({ children }: { children: ReactNode }) {
  const fromUrlRef = useRef(initialThemeState.fromUrl)
  const [theme, setThemeState] = useState<Theme>(initialThemeState.theme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  // Resolve theme
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement

    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)

    // Update URL param
    updateUrlParam(newTheme)

    // Only persist to localStorage if not initially loaded from URL
    if (!fromUrlRef.current) {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme)
      } catch (error) {
        console.warn('Could not persist theme preference:', error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
