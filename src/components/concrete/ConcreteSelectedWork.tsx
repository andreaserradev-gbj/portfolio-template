import { achievements, achievementsSection } from '@/config/loader'
import { Label, SectionHeader } from './atoms'

export function ConcreteSelectedWork() {
  if (!achievements.length) return null

  return (
    <section
      id="achievements"
      style={{
        padding: '110px 40px',
        background: 'var(--color-concrete-elev, var(--color-muted))',
        borderBottom: '2px solid var(--color-foreground)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          eyebrow={achievementsSection.eyebrow}
          title={achievementsSection.headline}
          lede={achievementsSection.description}
        />
        {achievements.map((a, i) => (
          <article
            key={a.id}
            className="concrete-work-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 1fr',
              gap: 48,
              padding: '48px 0',
              borderTop: '2px solid var(--color-foreground)',
              borderBottom:
                i === achievements.length - 1
                  ? '2px solid var(--color-foreground)'
                  : 'none',
              alignItems: 'start',
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  fontWeight: 700,
                }}
              >
                {a.tag ?? a.category}
              </span>
              <div style={{ marginTop: 18 }}>
                <Label>No. {String(i + 1).padStart(2, '0')}</Label>
              </div>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(1.6rem, 2.4vw, 2.2rem)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.025em',
                  margin: 0,
                  color: 'var(--color-foreground)',
                }}
              >
                {a.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: '1.05rem',
                  lineHeight: 1.55,
                  color: 'var(--color-foreground)',
                  margin: '14px 0 0',
                  maxWidth: 640,
                  textWrap: 'pretty',
                }}
              >
                {a.summary}
              </p>
              {a.impact && (
                <div
                  style={{
                    margin: '22px 0 0',
                    padding: '16px 20px',
                    background: 'var(--color-background)',
                    borderLeft: '4px solid var(--color-accent)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: '1rem',
                    lineHeight: 1.4,
                    color: 'var(--color-foreground)',
                    maxWidth: 640,
                  }}
                >
                  {a.impact}
                </div>
              )}
              {a.details.length > 0 && (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '22px 0 0',
                    maxWidth: 640,
                  }}
                >
                  {a.details.map((d, j) => (
                    <li
                      key={j}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 1fr',
                        gap: 12,
                        padding: '10px 0',
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
                          color: 'var(--color-muted-foreground)',
                          fontWeight: 500,
                          paddingTop: 4,
                          letterSpacing: '0.1em',
                        }}
                      >
                        {String(j + 1).padStart(2, '0')}
                      </span>
                      <span style={{ textWrap: 'pretty' }}>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
              {a.metrics && a.metrics.length > 0 && (
                <div
                  className="concrete-work-metrics"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${a.metrics.length}, 1fr)`,
                    marginTop: 28,
                    maxWidth: 640,
                    borderTop: '2px solid var(--color-foreground)',
                  }}
                >
                  {a.metrics.map((m, j) => (
                    <div
                      key={m.label}
                      style={{
                        padding: '16px 16px 0 0',
                        borderRight:
                          j === a.metrics!.length - 1
                            ? 'none'
                            : '1px solid var(--color-concrete-rule-faint, var(--color-border))',
                        paddingLeft: j === 0 ? 0 : 16,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          fontSize: '1.8rem',
                          lineHeight: 1,
                          letterSpacing: '-0.03em',
                          color: 'var(--color-foreground)',
                        }}
                      >
                        {m.value}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Label>{m.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
