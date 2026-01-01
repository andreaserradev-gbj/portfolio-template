import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { LeadershipHighlights } from '@/components/LeadershipHighlights'
import { Experience } from '@/components/Experience'
import { Competencies } from '@/components/Competencies'
import { Skills } from '@/components/Skills'
import { Projects } from '@/components/Projects'
import { Contact } from '@/components/Contact'
import { SectionNav } from '@/components/SectionNav'
import { ThemeChooserFAB } from '@/components/ThemeChooserFAB'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ThemeProvider } from '@/hooks/useTheme'
import { DesignSystemProvider } from '@/hooks/useDesignSystem'
import { useRouteView, RouteViewProvider } from '@/hooks/useRouteView'
import { JobsPage } from '@/components/jobs'
import { sections } from '@/config/loader'

// Map section IDs to components
// Components handle their own empty data checks internally
const sectionComponents: Record<string, React.FC> = {
  hero: Hero,
  metrics: LeadershipHighlights,
  experience: Experience,
  achievements: Competencies,
  skills: Skills,
  projects: Projects,
  contact: Contact,
}

// Sections that don't participate in background alternation (have their own unique backgrounds)
const FIXED_BACKGROUND_SECTIONS = new Set(['hero'])

/**
 * Get alternating background class for a section based on its visual position.
 * Only counts sections that participate in alternation (excludes hero, etc.)
 */
function getSectionBackground(
  sectionId: string,
  alternatingIndex: number
): string {
  if (FIXED_BACKGROUND_SECTIONS.has(sectionId)) {
    return '' // These sections have their own backgrounds
  }
  // Alternate: odd = card, even = slate
  return alternatingIndex % 2 === 1 ? 'section-bg-card' : 'section-bg-slate'
}

function PortfolioView() {
  // Track alternating index (only for sections that participate)
  let alternatingIndex = 0

  return (
    <>
      <a href="#hero" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <SectionNav />
      <ThemeChooserFAB />
      <main>
        {sections.map((sectionId) => {
          const Component = sectionComponents[sectionId]
          if (!Component) {
            console.error(`[Config] Unknown section: "${sectionId}"`)
            if (import.meta.env.DEV) {
              console.error(
                `Available sections: ${Object.keys(sectionComponents).join(', ')}`
              )
            }
            return null
          }

          // Get background class and increment counter for alternating sections
          const bgClass = getSectionBackground(sectionId, alternatingIndex)
          if (!FIXED_BACKGROUND_SECTIONS.has(sectionId)) {
            alternatingIndex++
          }

          return (
            <div key={sectionId} className={bgClass}>
              <Component />
            </div>
          )
        })}
      </main>
    </>
  )
}

function AppContent() {
  const { view } = useRouteView()

  if (view === 'jobs') {
    return <JobsPage />
  }

  return <PortfolioView />
}

function App() {
  return (
    <ErrorBoundary>
      <DesignSystemProvider>
        <ThemeProvider>
          <RouteViewProvider>
            <AppContent />
          </RouteViewProvider>
        </ThemeProvider>
      </DesignSystemProvider>
    </ErrorBoundary>
  )
}

export default App
