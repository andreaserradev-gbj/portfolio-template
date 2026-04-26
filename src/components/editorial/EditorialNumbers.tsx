import { metrics, metricsSection, sections } from '@/config/loader'
import { SmallCaps } from './atoms'
import { ordinalFor } from './utils'

export function EditorialNumbers() {
  if (!metrics.length) return null

  return (
    <section
      id="impact"
      style={{
        padding: '120px 40px',
        background: 'var(--color-editorial-accent-wash, var(--color-muted))',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto' }}>
        <div
          className="editorial-section-header"
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            gap: 32,
            marginBottom: 56,
          }}
        >
          <div style={{ paddingTop: 8 }}>
            <SmallCaps>§ {ordinalFor('metrics', sections)}</SmallCaps>
          </div>
          <div>
            <SmallCaps>{metricsSection.eyebrow}</SmallCaps>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                margin: '12px 0 0',
                color: 'var(--color-foreground)',
                maxWidth: 720,
                textWrap: 'balance',
              }}
            >
              {metricsSection.headline}
            </h2>
            {metricsSection.description && (
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.05rem',
                  lineHeight: 1.55,
                  color: 'var(--color-muted-foreground)',
                  maxWidth: 640,
                  margin: '12px 0 0',
                  textWrap: 'pretty',
                }}
              >
                {metricsSection.description}
              </p>
            )}
          </div>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}
        >
          <div />
          <div
            className="editorial-numbers-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
              gap: 0,
            }}
          >
            {metrics.map((m, i) => (
              <div
                key={m.label}
                style={{
                  padding: '32px 24px 32px 0',
                  borderTop: '1px solid var(--color-foreground)',
                  borderRight:
                    i === metrics.length - 1
                      ? 'none'
                      : '1px solid var(--color-border)',
                  paddingLeft: i === 0 ? 0 : 24,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'clamp(3rem, 5.5vw, 4.5rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: 'var(--color-foreground)',
                  }}
                >
                  {m.value}
                  {m.suffix && (
                    <span style={{ color: 'var(--color-accent)' }}>
                      {m.suffix}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-muted-foreground)',
                    marginTop: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    lineHeight: 1.4,
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
