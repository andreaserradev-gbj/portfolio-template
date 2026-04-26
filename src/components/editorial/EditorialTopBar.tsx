import { useEffect, useState } from 'react'
import { hero, sections } from '@/config/loader'
import { ordinalFor } from './utils'

const SECTION_LABEL: Record<string, string> = {
  metrics: 'Numbers',
  experience: 'Two careers',
  achievements: 'Selected work',
  skills: 'Skills index',
  projects: 'Open source',
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = sections
    .filter((id) => id !== 'hero' && id !== 'contact' && SECTION_LABEL[id])
    .slice(0, 5)
    .map((id) => ({
      ordinal: ordinalFor(id, sections),
      label: SECTION_LABEL[id],
      href: SECTION_ANCHOR[id],
    }))

  const showContactCTA = sections.includes('contact')

  return (
    <div
      className="editorial-topbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: scrolled
          ? 'color-mix(in oklab, var(--color-background) 92%, transparent)'
          : 'transparent',
        backdropFilter: scrolled ? 'saturate(140%) blur(8px)' : 'none',
        borderBottom: `1px solid ${
          scrolled ? 'var(--color-border)' : 'transparent'
        }`,
        transition: 'background 200ms, border-color 200ms',
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <a
          href="#hero"
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 12,
            textDecoration: 'none',
            color: 'var(--color-foreground)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            {hero.name}
          </span>
          {hero.title && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'var(--color-muted-foreground)',
                textTransform: 'uppercase',
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
              <span style={{ opacity: 0.5, marginRight: 6 }}>
                {item.ordinal}
              </span>
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
      </div>
    </div>
  )
}
