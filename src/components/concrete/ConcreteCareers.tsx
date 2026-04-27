import { experience, experienceSection } from '@/config/loader'
import { Chip, Label, SectionHeader } from './atoms'

export function ConcreteCareers() {
  if (!experience.length) return null

  return (
    <section
      id="experience"
      style={{
        padding: '110px 40px',
        borderBottom: '2px solid var(--color-foreground)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          eyebrow={experienceSection.eyebrow}
          title={experienceSection.headline}
          lede={experienceSection.description}
        />
        {experience.map((exp, i) => (
          <article
            key={`${exp.company}-${exp.period}`}
            className="concrete-career-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              gap: 64,
              padding: '40px 0',
              borderTop: '2px solid var(--color-foreground)',
              borderBottom:
                i === experience.length - 1
                  ? '2px solid var(--color-foreground)'
                  : 'none',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 88,
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                  color: 'var(--color-accent)',
                }}
              >
                {exp.label}
              </div>
              <div style={{ marginTop: 12 }}>
                <Label>{exp.period}</Label>
              </div>
              {exp.span && (
                <div style={{ marginTop: 4 }}>
                  <Label style={{ color: 'var(--color-foreground)' }}>
                    {exp.span}
                  </Label>
                </div>
              )}
            </div>
            <div>
              <Label
                style={{
                  display: 'block',
                  marginBottom: 8,
                  letterSpacing: '0.14em',
                }}
              >
                {exp.role}
                {exp.location ? ` · ${exp.location}` : ''}
              </Label>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 2.6vw, 2.4rem)',
                  lineHeight: 1,
                  letterSpacing: '-0.025em',
                  margin: 0,
                  color: 'var(--color-foreground)',
                }}
              >
                {exp.company}
              </h3>

              {exp.highlights.length > 0 && (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '22px 0 0',
                    maxWidth: 640,
                  }}
                >
                  {exp.highlights.map((h, j) => (
                    <li
                      key={j}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 1fr',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom:
                          '1px solid var(--color-concrete-rule-faint, var(--color-border))',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        color: 'var(--color-foreground)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--color-accent)',
                          fontWeight: 700,
                          paddingTop: 4,
                          letterSpacing: '0.1em',
                        }}
                      >
                        {String(j + 1).padStart(2, '0')}
                      </span>
                      <span style={{ textWrap: 'pretty' }}>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 24,
                  marginTop: 28,
                }}
              >
                {exp.techStack && exp.techStack.length > 0 && (
                  <div style={{ minWidth: 180 }}>
                    <Label>Stack</Label>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        marginTop: 10,
                      }}
                    >
                      {exp.techStack.map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                    </div>
                  </div>
                )}
                {exp.clients && exp.clients.length > 0 && (
                  <div style={{ minWidth: 180 }}>
                    <Label>Worked with</Label>
                    <div
                      style={{
                        marginTop: 12,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 500,
                        fontSize: 18,
                        color: 'var(--color-foreground)',
                        lineHeight: 1.4,
                      }}
                    >
                      {exp.clients.join(' · ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
