import { experience, experienceSection, sections } from '@/config/loader'
import { SectionHeader, SmallCaps } from './atoms'
import { ordinalFor } from './utils'

export function EditorialCareers() {
  if (!experience.length) return null

  return (
    <section
      id="experience"
      style={{ padding: '120px 40px', maxWidth: 1240, margin: '0 auto' }}
    >
      <SectionHeader
        num={ordinalFor('experience', sections)}
        eyebrow={experienceSection.eyebrow}
        title={experienceSection.headline}
        lede={experienceSection.description}
      />

      <div
        className="editorial-section-row"
        style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}
      >
        <div />
        <div>
          {experience.map((exp, i) => (
            <article
              key={`${exp.company}-${exp.period}`}
              className="editorial-career-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 32,
                padding: '48px 0',
                borderTop: '1px solid var(--color-foreground)',
                borderBottom:
                  i === experience.length - 1
                    ? '1px solid var(--color-foreground)'
                    : 'none',
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 64,
                    lineHeight: 1,
                    color: 'var(--color-accent)',
                    fontWeight: 400,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {exp.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-muted-foreground)',
                    marginTop: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {exp.period}
                </div>
                {exp.span && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--color-foreground)',
                      marginTop: 4,
                    }}
                  >
                    {exp.span}
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-muted-foreground)',
                    marginBottom: 8,
                  }}
                >
                  {exp.role}
                  {exp.location ? ` · ${exp.location}` : ''}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
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
                      margin: '24px 0 0',
                      maxWidth: 640,
                    }}
                  >
                    {exp.highlights.map((h, j) => (
                      <li
                        key={j}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '32px 1fr',
                          gap: 8,
                          padding: '10px 0',
                          fontFamily: 'var(--font-body)',
                          fontSize: '0.98rem',
                          lineHeight: 1.55,
                          color: 'var(--color-foreground)',
                          borderBottom: '1px dashed var(--color-border)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: 'var(--color-muted-foreground)',
                            paddingTop: 4,
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
                    <div>
                      <SmallCaps>Stack</SmallCaps>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        {exp.techStack.map((s) => (
                          <span
                            key={s}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 12,
                              color: 'var(--color-foreground)',
                              border: '1px solid var(--color-border)',
                              padding: '4px 10px',
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {exp.clients && exp.clients.length > 0 && (
                    <div>
                      <SmallCaps>Worked with</SmallCaps>
                      <div
                        style={{
                          marginTop: 12,
                          fontFamily: 'var(--font-display)',
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
      </div>
    </section>
  )
}
