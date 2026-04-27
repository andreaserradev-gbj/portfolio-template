import { achievements, achievementsSection } from '@/config/loader'
import { SectionHeader, SmallCaps } from './atoms'

export function EditorialSelectedWork() {
  if (!achievements.length) return null

  return (
    <section
      id="achievements"
      style={{ padding: '120px 40px', maxWidth: 1240, margin: '0 auto' }}
    >
      <SectionHeader
        eyebrow={achievementsSection.eyebrow}
        title={achievementsSection.headline}
        lede={achievementsSection.description}
      />

      <div>
        {achievements.map((a, i) => (
          <article
            key={a.id}
            className="editorial-work-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '200px 1fr 280px',
              gap: 32,
              padding: '40px 0',
              borderTop: '1px solid var(--color-foreground)',
              borderBottom:
                i === achievements.length - 1
                  ? '1px solid var(--color-foreground)'
                  : 'none',
              alignItems: 'start',
            }}
          >
            <div>
              <SmallCaps>{a.tag}</SmallCaps>
            </div>
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 'clamp(1.6rem, 2.6vw, 2.1rem)',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: 'var(--color-foreground)',
                }}
              >
                {a.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.05rem',
                  lineHeight: 1.55,
                  color: 'var(--color-foreground)',
                  margin: '12px 0 0',
                  maxWidth: 560,
                  textWrap: 'pretty',
                }}
              >
                {a.summary}
              </p>
              {a.impact && (
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'var(--color-muted-foreground)',
                    margin: '16px 0 0',
                    maxWidth: 560,
                    textWrap: 'pretty',
                  }}
                >
                  {a.impact}
                </p>
              )}
            </div>
            <div>
              {(a.metrics ?? []).map((m) => (
                <div
                  key={m.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '10px 0',
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 20,
                      color: 'var(--color-foreground)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
