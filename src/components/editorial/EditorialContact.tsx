import { contact, hero, userLocation } from '@/config/loader'

export function EditorialContact() {
  const linkedinHandle = contact.linkedin
    .replace(/^\/?in\//, '')
    .replace(/^\/+|\/+$/g, '')
  const location =
    contact.location ||
    [userLocation.locality, userLocation.country].filter(Boolean).join(', ')

  const cells: Array<{ key: string; value: string; href?: string }> = []
  if (contact.email)
    cells.push({
      key: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
    })
  if (linkedinHandle)
    cells.push({
      key: 'LinkedIn',
      value: linkedinHandle,
      href: contact.linkedinUrl || undefined,
    })
  if (location) cells.push({ key: 'Location', value: location })
  if (contact.availability)
    cells.push({ key: 'Status', value: contact.availability })

  const headlineParts = (
    contact.headline ||
    hero.title ||
    'Get in touch'
  ).split(/\s+/)
  const headlineLast = headlineParts[headlineParts.length - 1]
  const headlineRest = headlineParts.slice(0, -1).join(' ')

  return (
    <section
      id="contact"
      style={{
        padding: '120px 40px 60px',
        background: 'var(--color-foreground)',
        color: 'var(--color-background)',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color:
                'color-mix(in oklab, var(--color-background) 60%, transparent)',
            }}
          >
            {contact.eyebrow || 'Get in touch'}
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(2.6rem, 6vw, 5rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              margin: '16px 0 0',
              color: 'var(--color-background)',
              textWrap: 'balance',
            }}
          >
            {headlineRest && (
              <>
                {headlineRest}
                <br />
              </>
            )}
            {headlineLast}
            <span
              style={{
                color:
                  'var(--color-editorial-accent-soft, var(--color-accent))',
              }}
            >
              .
            </span>
          </h2>
          {contact.description && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.15rem',
                lineHeight: 1.55,
                color:
                  'color-mix(in oklab, var(--color-background) 80%, transparent)',
                maxWidth: 600,
                margin: '24px 0 0',
                textWrap: 'pretty',
              }}
            >
              {contact.description}
            </p>
          )}

          {cells.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 0,
                marginTop: 56,
                borderTop:
                  '1px solid color-mix(in oklab, var(--color-background) 25%, transparent)',
              }}
            >
              {cells.map(({ key, value, href }) => {
                const inner = (
                  <>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color:
                          'color-mix(in oklab, var(--color-background) 55%, transparent)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {key}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 22,
                        color: 'var(--color-background)',
                        marginTop: 8,
                        display: 'block',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {value}
                    </span>
                  </>
                )
                const sharedStyle = {
                  padding: '28px 24px 28px 0',
                  borderBottom:
                    '1px solid color-mix(in oklab, var(--color-background) 25%, transparent)',
                } as const
                return href ? (
                  <a
                    key={key}
                    href={href}
                    style={{ ...sharedStyle, textDecoration: 'none' }}
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={key} style={sharedStyle}>
                    {inner}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 80,
            paddingTop: 24,
            borderTop:
              '1px solid color-mix(in oklab, var(--color-background) 15%, transparent)',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color:
                'color-mix(in oklab, var(--color-background) 50%, transparent)',
              letterSpacing: '0.08em',
            }}
          >
            © {new Date().getFullYear()} {hero.name.toUpperCase()}
          </span>
          {location && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color:
                  'color-mix(in oklab, var(--color-background) 50%, transparent)',
                letterSpacing: '0.08em',
              }}
            >
              {location.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
