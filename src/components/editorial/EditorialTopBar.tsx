import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import {
  achievementsSection,
  experienceSection,
  hero,
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

export function EditorialTopBar() {
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

  const navItems = sections
    .filter((id) => id !== 'hero' && id !== 'contact' && SECTION_LABEL[id])
    .slice(0, 5)
    .map((id) => ({
      label: SECTION_LABEL[id](),
      href: SECTION_ANCHOR[id],
    }))

  const showContactCTA = sections.includes('contact')
  const barOpaque = scrolled || mobileOpen

  return (
    <div
      className="editorial-topbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: barOpaque
          ? 'color-mix(in oklab, var(--color-background) 92%, transparent)'
          : 'transparent',
        backdropFilter: barOpaque ? 'saturate(140%) blur(8px)' : 'none',
        borderBottom: `1px solid ${
          barOpaque ? 'var(--color-border)' : 'transparent'
        }`,
        transition: 'background 200ms, border-color 200ms',
      }}
    >
      <div
        className="editorial-topbar-inner"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <a
          href="#hero"
          onClick={() => setMobileOpen(false)}
          className="editorial-topbar-brand"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            textDecoration: 'none',
            color: 'var(--color-foreground)',
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            {hero.name}
          </span>
          {hero.title && (
            <span
              className="editorial-topbar-subtitle"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--color-muted-foreground)',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
              }}
            >
              {hero.title}
            </span>
          )}
        </a>

        <nav
          className="editorial-topnav"
          style={{ display: 'flex', gap: 28, alignItems: 'center' }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.06em',
                color: 'var(--color-muted-foreground)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'color 150ms',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--color-accent)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--color-muted-foreground)'
              }}
            >
              {item.label}
            </a>
          ))}
          {showContactCTA && (
            <a
              href="#contact"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-background)',
                background: 'var(--color-foreground)',
                textDecoration: 'none',
                padding: '10px 16px',
              }}
            >
              Get in touch →
            </a>
          )}
        </nav>

        <button
          type="button"
          className="editorial-mobile-toggle"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="editorial-mobile-menu"
          onClick={() => setMobileOpen((v) => !v)}
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            background: 'transparent',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        id="editorial-mobile-menu"
        className="editorial-mobile-menu"
        data-open={mobileOpen}
        style={{
          display: 'none',
          borderTop: mobileOpen
            ? '1px solid var(--color-border)'
            : '1px solid transparent',
        }}
      >
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '16px 24px 24px',
            gap: 4,
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: '0.06em',
                color: 'var(--color-foreground)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                padding: '14px 0',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {item.label}
            </a>
          ))}
          {showContactCTA && (
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-background)',
                background: 'var(--color-foreground)',
                textDecoration: 'none',
                padding: '16px 20px',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              Get in touch →
            </a>
          )}
        </nav>
      </div>
    </div>
  )
}
