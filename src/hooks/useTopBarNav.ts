import { useEffect, useState } from 'react'
import {
  achievementsSection,
  experienceSection,
  metricsSection,
  projectsSection,
  sections,
  skillsSection,
} from '@/config/loader'

const SECTION_LABEL: Record<string, () => string> = {
  metrics: () => metricsSection.eyebrow,
  experience: () => experienceSection.eyebrow,
  achievements: () => achievementsSection.eyebrow,
  skills: () => skillsSection.eyebrow,
  projects: () => projectsSection.eyebrow,
}

const SECTION_ANCHOR: Record<string, string> = {
  metrics: '#impact',
  experience: '#experience',
  achievements: '#achievements',
  skills: '#skills',
  projects: '#projects',
}

interface TopBarNavItem {
  label: string
  href: string
}

/**
 * Shared top-bar nav logic for the editorial and concrete layouts:
 * scroll/mobile-menu state plus the section-derived nav items. The two
 * top bars render deliberately different JSX but drive it from this hook.
 */
export function useTopBarNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileOpen])

  const navItems: TopBarNavItem[] = sections
    .filter((id) => id !== 'hero' && id !== 'contact' && SECTION_LABEL[id])
    .slice(0, 5)
    .map((id) => ({
      label: SECTION_LABEL[id](),
      href: SECTION_ANCHOR[id],
    }))

  const showContactCTA = sections.includes('contact')
  const barOpaque = scrolled || mobileOpen

  return { mobileOpen, setMobileOpen, navItems, showContactCTA, barOpaque }
}
