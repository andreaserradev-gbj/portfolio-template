import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { LeadershipHighlights } from '@/components/LeadershipHighlights'
import { Experience } from '@/components/Experience'
import { Competencies } from '@/components/Competencies'
import { Skills } from '@/components/Skills'
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
  contact: Contact,
}

function PortfolioView() {
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
            if (import.meta.env.DEV) {
              console.error(
                `Unknown section "${sectionId}" in content.json sections array. ` +
                  `Available sections: ${Object.keys(sectionComponents).join(', ')}`
              )
            }
            return null
          }
          return <Component key={sectionId} />
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
