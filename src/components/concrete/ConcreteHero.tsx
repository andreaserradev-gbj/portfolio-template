import {
  hero,
  contact,
  experience,
  userLocation,
  yearsOfExperience,
} from '@/config/loader'
import { Label } from './atoms'

function splitName(full: string): { rest: string; last: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length <= 1) return { rest: '', last: full }
  const last = parts[parts.length - 1]
  return { rest: parts.slice(0, -1).join(' '), last }
}

function buildFacts(): Array<[string, string]> {
  const rows: Array<[string, string]> = []
  const latest = experience[0]

  if (contact.availability) rows.push(['Status', contact.availability])
  if (latest) rows.push(['Now', `${latest.role}, ${latest.company}`])
  if (latest?.span) rows.push(['Tenure', latest.span])
  if (yearsOfExperience > 0) {
    rows.push(['Career', `${yearsOfExperience}+ yrs`])
  }
  const loc = [userLocation.locality, userLocation.country]
    .filter(Boolean)
    .join(', ')
  if (loc) rows.push(['Location', `${loc} · Remote`])

  return rows.slice(0, 5)
}

export function ConcreteHero() {
  const { rest, last } = splitName(hero.name)
  const status = hero.statusBadge?.text ?? contact.availability
  const locationShort = [userLocation.locality, userLocation.country]
    .filter(Boolean)
    .join(' · ')
  const facts = buildFacts()

  return (
    <section
      id="hero"
      style={{
        padding: '160px 40px 110px',
        borderBottom: '2px solid var(--color-foreground)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {status && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 56,
              flexWrap: 'wrap',
            }}
          >
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                background: 'var(--color-accent)',
              }}
            />
            <Label
              style={{
                color: 'var(--color-foreground)',
                fontWeight: 700,
              }}
            >
              {status}
            </Label>
            <div
              aria-hidden
              style={{
                height: 2,
                flex: 1,
                minWidth: 32,
                background: 'var(--color-foreground)',
              }}
            />
            {locationShort && <Label>{locationShort}</Label>}
          </div>
        )}

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(3.4rem, 11vw, 9rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: 'var(--color-foreground)',
            margin: 0,
          }}
        >
          {rest && (
            <>
              {rest}
              <br />
            </>
          )}
          {last}
          <span style={{ color: 'var(--color-accent)' }}>.</span>
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(1.05rem, 1.7vw, 1.45rem)',
            lineHeight: 1.4,
            color: 'var(--color-foreground)',
            margin: '48px 0 0',
            maxWidth: 580,
            textWrap: 'pretty',
          }}
        >
          {hero.tagline}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 48,
            flexWrap: 'wrap',
          }}
        >
          <a
            href="#experience"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-background)',
              background: 'var(--color-foreground)',
              textDecoration: 'none',
              padding: '16px 24px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {hero.cta?.primary ?? 'See My Impact'}
            <span aria-hidden>↓</span>
          </a>
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-foreground)',
                textDecoration: 'none',
                padding: '14px 22px',
                border: '2px solid var(--color-foreground)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {contact.email}
            </a>
          )}
        </div>

        {facts.length > 0 && (
          <div
            className="concrete-facts-row"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${facts.length}, 1fr)`,
              marginTop: 64,
              borderTop: '2px solid var(--color-foreground)',
            }}
          >
            {facts.map(([k, v], i) => (
              <div
                key={k}
                className="concrete-fact"
                style={{
                  padding: '22px 18px 22px 0',
                  borderRight:
                    i === facts.length - 1
                      ? 'none'
                      : '1px solid var(--color-concrete-rule-faint, var(--color-border))',
                  paddingLeft: i === 0 ? 0 : 18,
                }}
              >
                <Label>{k}</Label>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--color-foreground)',
                    marginTop: 10,
                    lineHeight: 1.4,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
