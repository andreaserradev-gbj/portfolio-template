import { projects, projectsSection, sections } from '@/config/loader'
import { Chip, Label, OrdinalColumn, SectionHeader } from './atoms'
import { ordinalFor } from './utils'

export function ConcreteProjects() {
  if (!projects.length) return null

  // Featured projects render full-width across both columns of the 2-col grid
  const featured = projects.filter((p) => p.featured)
  const regular = projects.filter((p) => !p.featured)

  return (
    <section
      id="projects"
      style={{
        padding: '110px 40px',
        background: 'var(--color-concrete-elev, var(--color-muted))',
        borderBottom: '2px solid var(--color-foreground)',
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
        <OrdinalColumn num={ordinalFor('projects', sections)} name="Projects" />
        <div>
          <SectionHeader
            eyebrow={projectsSection.eyebrow}
            title={projectsSection.headline}
            lede={projectsSection.description}
          />
          <div
            className="concrete-projects-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              borderTop: '2px solid var(--color-foreground)',
            }}
          >
            {featured.map((p, i) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="concrete-project-card"
                style={{
                  gridColumn: '1 / -1',
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '40px 0',
                  borderBottom: '2px solid var(--color-foreground)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  background: 'transparent',
                  transition: 'background 200ms',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-accent)',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  ★ Featured · No. {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '2.4rem',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    color: 'var(--color-foreground)',
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 300,
                    fontSize: '0.98rem',
                    lineHeight: 1.55,
                    color: 'var(--color-foreground)',
                    margin: 0,
                    maxWidth: 720,
                    textWrap: 'pretty',
                  }}
                >
                  {p.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  {p.tags && p.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {p.tags.map((t) => (
                        <Chip key={t}>{t}</Chip>
                      ))}
                    </div>
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-foreground)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      borderBottom: '2px solid var(--color-accent)',
                      paddingBottom: 2,
                    }}
                  >
                    Visit ↗
                  </span>
                </div>
              </a>
            ))}
            {regular.map((p, i) => {
              const isOdd = i % 2 === 0
              return (
                <a
                  key={p.id}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="concrete-project-card"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '36px 32px 36px 0',
                    borderBottom: '2px solid var(--color-foreground)',
                    borderRight: isOdd
                      ? '1px solid var(--color-concrete-rule-faint, var(--color-border))'
                      : 'none',
                    paddingLeft: isOdd ? 0 : 32,
                    paddingRight: isOdd ? 32 : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    background: 'transparent',
                    transition: 'background 200ms',
                  }}
                >
                  <Label
                    style={{
                      color: 'var(--color-accent)',
                      fontWeight: 700,
                    }}
                  >
                    No. {String(featured.length + i + 1).padStart(2, '0')}
                  </Label>
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: '1.6rem',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      margin: 0,
                      color: 'var(--color-foreground)',
                    }}
                  >
                    {p.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 300,
                      fontSize: '0.95rem',
                      lineHeight: 1.55,
                      color: 'var(--color-foreground)',
                      margin: 0,
                      maxWidth: 540,
                      textWrap: 'pretty',
                    }}
                  >
                    {p.description}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: 12,
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    {p.tags && p.tags.length > 0 && (
                      <div
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
                      >
                        {p.tags.map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        color: 'var(--color-foreground)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        borderBottom: '2px solid var(--color-accent)',
                        paddingBottom: 2,
                      }}
                    >
                      Visit ↗
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
