import { Fragment } from 'react'
import { projects, projectsSection, sections } from '@/config/loader'
import { SectionHeader, SmallCaps } from './atoms'
import { ordinalFor } from './utils'

export function EditorialProjects() {
  if (!projects.length) return null

  return (
    <section
      id="projects"
      style={{ padding: '120px 40px', maxWidth: 1240, margin: '0 auto' }}
    >
      <SectionHeader
        num={ordinalFor('projects', sections)}
        eyebrow={projectsSection.eyebrow}
        title={projectsSection.headline}
        lede={projectsSection.description}
      />
      <div
        style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}
      >
        <div />
        <div
          className="editorial-projects-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
            borderTop: '1px solid var(--color-foreground)',
          }}
        >
          {projects.map((p, i) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-project-card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                padding: '32px 24px',
                borderRight:
                  i === projects.length - 1
                    ? 'none'
                    : '1px solid var(--color-border)',
                borderBottom: '1px solid var(--color-foreground)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: 'transparent',
                transition: 'background 200ms',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <SmallCaps>{`Project ${String(i + 1).padStart(2, '0')}`}</SmallCaps>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    color: 'var(--color-accent)',
                  }}
                  aria-hidden
                >
                  ↗
                </span>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: '1.7rem',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  lineHeight: 1.55,
                  color: 'var(--color-foreground)',
                  margin: 0,
                  textWrap: 'pretty',
                }}
              >
                {p.description}
              </p>
              {p.tags && p.tags.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 'auto',
                    paddingTop: 12,
                  }}
                >
                  {p.tags.map((t, idx) => (
                    <Fragment key={t}>
                      {idx > 0 && (
                        <span
                          aria-hidden
                          style={{
                            color: 'var(--color-muted-foreground)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                          }}
                        >
                          ·
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: 'var(--color-muted-foreground)',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {t}
                      </span>
                    </Fragment>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
