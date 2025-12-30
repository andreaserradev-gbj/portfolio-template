import { useState, useEffect } from 'react'
import { Menu, X, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ThemeToggle } from '@/components/ThemeToggle'
import { DesignSystemToggle } from '@/components/DesignSystemToggle'
import { ShareButton } from '@/components/ShareButton'
import { navLinks, branding, hero, siteConfig } from '@/config/loader'
import { useRouteView } from '@/hooks/useRouteView'
import { cn } from '@/lib/utils'

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const { setView, isJobsEnabled } = useRouteView()

  useEffect(() => {
    const handleScroll = () => {
      // Update active section based on scroll position
      const sections = navLinks.map((link) => link.href.replace('#', ''))
      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md shadow-card border-b border-border">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo / Name */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              handleNavClick('#hero')
            }}
            className="group flex items-center gap-3"
          >
            <span className="font-display text-xl font-semibold text-card-foreground tracking-tight">
              {branding?.name || hero.name}
            </span>
            <span className="hidden sm:inline-block h-5 w-px bg-border" />
            <span className="hidden sm:inline-block text-sm text-muted-foreground font-medium">
              {hero.title}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.slice(1).map((link) => {
              const isActive = activeSection === link.href.replace('#', '')
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(link.href)
                  }}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                    isActive
                      ? 'text-card-foreground'
                      : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-accent rounded-full" />
                  )}
                </a>
              )
            })}
            <div className="ml-4 pl-4 border-l border-border flex items-center gap-2">
              <DesignSystemToggle />
              <ThemeToggle />
              <ShareButton />
              {isJobsEnabled && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setView('jobs')}
                        aria-label="View Job Board"
                      >
                        <Briefcase className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Job Board</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {siteConfig.navigation.cta && (
                <Button
                  size="sm"
                  onClick={() =>
                    handleNavClick(siteConfig.navigation.cta!.href)
                  }
                >
                  {siteConfig.navigation.cta.text}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden transition-all duration-300',
            isMobileMenuOpen
              ? 'max-h-[calc(100vh-4rem)] overflow-y-auto pb-8'
              : 'max-h-0 overflow-hidden'
          )}
        >
          <div className="flex flex-col gap-1 pt-4 border-t border-border">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '')
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(link.href)
                  }}
                  className={cn(
                    'px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    isActive
                      ? 'text-card-foreground bg-muted'
                      : 'text-muted-foreground hover:text-card-foreground hover:bg-muted'
                  )}
                >
                  {link.label}
                </a>
              )
            })}
            <div className="mt-4 px-4 flex items-center gap-3">
              <DesignSystemToggle />
              <ThemeToggle />
              <ShareButton />
              {isJobsEnabled && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setView('jobs')
                    setIsMobileMenuOpen(false)
                  }}
                  aria-label="View Job Board"
                >
                  <Briefcase className="h-5 w-5" />
                </Button>
              )}
              {siteConfig.navigation.cta && (
                <Button
                  className="flex-1"
                  onClick={() =>
                    handleNavClick(siteConfig.navigation.cta!.href)
                  }
                >
                  {siteConfig.navigation.cta.text}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
