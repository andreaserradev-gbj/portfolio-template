import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { navLinks } from '@/config/loader'

export function SectionNav() {
  const [visible, setVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past 80% of viewport height
      setVisible(window.scrollY > window.innerHeight * 0.8)

      // Determine active section based on scroll position
      const sections = navLinks.map((link) => link.href.slice(1))

      for (const section of sections.reverse()) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= window.innerHeight / 2) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <nav
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:block"
      aria-label="Section navigation"
    >
      <div className="flex flex-col gap-2 bg-card/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-border">
        {navLinks.map((link) => {
          const sectionId = link.href.slice(1)
          const isActive = activeSection === sectionId

          return (
            <button
              key={link.href}
              onClick={() => scrollToSection(sectionId)}
              className={cn(
                'group relative w-3 h-3 rounded-full transition-all duration-200',
                isActive
                  ? 'bg-brass-500 scale-125'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-brass-400 dark:hover:bg-brass-500'
              )}
              aria-label={`Navigate to ${link.label}`}
              aria-current={isActive ? 'true' : undefined}
            >
              {/* Tooltip */}
              <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-navy-900 dark:bg-white text-white dark:text-navy-900 text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                {link.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
