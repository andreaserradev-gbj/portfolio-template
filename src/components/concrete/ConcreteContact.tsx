import { contact, hero, sections, userLocation } from '@/config/loader'
import { Label, OrdinalColumn } from './atoms'
import { ordinalFor } from './utils'

export function ConcreteContact() {
  const linkedinHandle = contact.linkedin
    .replace(/^\/?in\//, '')
    .replace(/^\/+|\/+$/g, '')
  const location =
    contact.location ||
    [userLocation.locality, userLocation.country].filter(Boolean).join(', ')

  const cells: Array<{ key: string; value: string; href?: string }> = []
  if (location) cells.push({ key: 'Location', value: location })
  if (contact.availability)
    cells.push({ key: 'Status', value: contact.availability })
  if (linkedinHandle)
    cells.push({
      key: 'LinkedIn',
      value: linkedinHandle,
      href: contact.linkedinUrl || undefined,
    })

  const headlineParts = (
    contact.headline ||
    hero.title ||
    "Let's Connect"
  ).split(/\s+/)
  const headlineLast = headlineParts[headlineParts.length - 1]
  const headlineRest = headlineParts.slice(0, -1).join(' ')

  return (
    <section
      id="contact"
      style={{
        padding: '110px 40px 60px',
      }}
    >
      <div
        className="concrete-section-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 1fr',
          gap: 64,
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <OrdinalColumn num={ordinalFor('contact', sections)} name="Contact" />
        <div>
          <Label>{contact.eyebrow || 'Get in touch'}</Label>
          <div
            className="concrete-contact-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 64,
              alignItems: 'end',
              paddingTop: 32,
              marginTop: 24,
              borderTop: '2px solid var(--color-foreground)',
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.035em',
                  margin: 0,
                  color: 'var(--color-foreground)',
                }}
              >
                {headlineRest && (
                  <>
                    {headlineRest}
                    <br />
                  </>
                )}
                {headlineLast}
                <span style={{ color: 'var(--color-accent)' }}>.</span>
              </h2>
            </div>
            <div>
              {contact.description && (
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: '1.1rem',
                    lineHeight: 1.55,
                    color: 'var(--color-foreground)',
                    margin: '0 0 28px',
                    maxWidth: 460,
                    textWrap: 'pretty',
                  }}
                >
                  {contact.description}
                </p>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    textDecoration: 'none',
                    padding: '22px 32px',
                    background: 'var(--color-foreground)',
                    color: 'var(--color-background)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  {contact.email}
                  <span aria-hidden>→</span>
                </a>
              )}
              {cells.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 32,
                    flexWrap: 'wrap',
                    marginTop: 28,
                    paddingTop: 22,
                    borderTop:
                      '1px solid var(--color-concrete-rule-faint, var(--color-border))',
                  }}
                >
                  {cells.map(({ key, value, href }) => {
                    const inner = (
                      <>
                        <Label>{key}</Label>
                        <span
                          style={{
                            display: 'block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 13,
                            color: 'var(--color-foreground)',
                            marginTop: 6,
                          }}
                        >
                          {value}
                        </span>
                      </>
                    )
                    return href ? (
                      <a
                        key={key}
                        href={href}
                        style={{ textDecoration: 'none' }}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div key={key}>{inner}</div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 80,
              paddingTop: 24,
              borderTop:
                '1px solid var(--color-concrete-rule-faint, var(--color-border))',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <Label>
              © {new Date().getFullYear()} {hero.name.toUpperCase()}
            </Label>
            {location && <Label>{location.toUpperCase()}</Label>}
          </div>
        </div>
      </div>
    </section>
  )
}
