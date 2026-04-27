import {
  hero,
  contact,
  experience,
  userLocation,
  yearsOfExperience,
} from '@/config/loader'
import { SmallCaps, Rule } from './atoms'

function splitName(full: string): { rest: string; last: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length <= 1) return { rest: '', last: full }
  const last = parts[parts.length - 1]
  return { rest: parts.slice(0, -1).join(' '), last }
}

function buildQuickFacts(): Array<[string, string]> {
  const rows: Array<[string, string]> = []
  const latest = experience[0]

  if (contact.availability) rows.push(['Status', contact.availability])
  if (latest) rows.push(['Now', `${latest.role}, ${latest.company}`])
  if (latest?.span) {
    rows.push(['Tenure', `${latest.span} at ${latest.company}`])
  }

  if (yearsOfExperience > 0) {
    const startYear = new Date().getFullYear() - yearsOfExperience
    rows.push(['Career', `${yearsOfExperience}+ yrs total, since ${startYear}`])
  }

  const loc = [userLocation.locality, userLocation.country]
    .filter(Boolean)
    .join(', ')
  if (loc) rows.push(['Location', `${loc} · Remote`])

  return rows
}

export function EditorialHero() {
  const { rest, last } = splitName(hero.name)
  const status = hero.statusBadge?.text ?? contact.availability
  const locationShort = [userLocation.locality, userLocation.country]
    .filter(Boolean)
    .join(' · ')
  const facts = buildQuickFacts()

  return (
    <section
      id="hero"
      style={{
        padding: '140px 40px 80px',
        maxWidth: 1240,
        margin: '0 auto',
      }}
    >
      {status && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 56,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              boxShadow:
                '0 0 0 4px color-mix(in oklab, var(--color-accent) 18%, transparent)',
            }}
            aria-hidden
          />
          <SmallCaps style={{ color: 'var(--color-foreground)' }}>
            {status}
          </SmallCaps>
          <Rule />
          {locationShort && <SmallCaps>{locationShort}</SmallCaps>}
        </div>
      )}

      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(3.4rem, 9vw, 8rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
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

        <div
          className="editorial-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 56,
            marginTop: 56,
            alignItems: 'start',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(1.4rem, 2.2vw, 1.85rem)',
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
                color: 'var(--color-foreground)',
                margin: 0,
                textWrap: 'pretty',
              }}
            >
              {hero.tagline}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 24,
                marginTop: 40,
                flexWrap: 'wrap',
              }}
            >
              <a
                href="#experience"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--color-background)',
                  background: 'var(--color-foreground)',
                  textDecoration: 'none',
                  padding: '16px 24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {hero.cta?.primary ?? 'Read the work'}{' '}
                <span aria-hidden>↓</span>
              </a>
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-foreground)',
                    textDecoration: 'none',
                    padding: '16px 24px',
                    border: '1px solid var(--color-foreground)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {contact.email}
                </a>
              )}
            </div>
          </div>

          {facts.length > 0 && (
            <div
              style={{
                borderTop: '1px solid var(--color-foreground)',
                paddingTop: 16,
              }}
            >
              {facts.map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr',
                    gap: 16,
                    padding: '14px 0',
                    borderBottom: '1px solid var(--color-border)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                  }}
                >
                  <span
                    style={{
                      color: 'var(--color-muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontSize: 11,
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ color: 'var(--color-foreground)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
