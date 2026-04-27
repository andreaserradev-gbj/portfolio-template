import { metrics, metricsSection, sections } from '@/config/loader'
import { Label, OrdinalColumn, SectionHeader } from './atoms'
import { ordinalFor } from './utils'

export function ConcreteNumbers() {
  if (!metrics.length) return null

  return (
    <section
      id="impact"
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
        <OrdinalColumn num={ordinalFor('metrics', sections)} name="Impact" />
        <div>
          <SectionHeader
            eyebrow={metricsSection.eyebrow}
            title={metricsSection.headline}
            lede={metricsSection.description}
          />
          <div
            className="concrete-stats"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
            }}
          >
            {metrics.map((m, i) => (
              <div
                key={m.label}
                className="concrete-stat"
                style={{
                  padding: '32px 24px 32px 0',
                  borderTop: '2px solid var(--color-foreground)',
                  borderRight:
                    i === metrics.length - 1
                      ? 'none'
                      : '1px solid var(--color-concrete-rule-faint, var(--color-border))',
                  paddingLeft: i === 0 ? 0 : 28,
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 'clamp(3rem, 5.5vw, 4.6rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
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
                <div style={{ marginTop: 14 }}>
                  <Label>{m.label}</Label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
