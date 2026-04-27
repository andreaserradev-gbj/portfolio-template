import { skillCategories, skillsSection } from '@/config/loader'
import { normalizeSkill } from '@/config/schema'
import { Label, SectionHeader } from './atoms'

export function ConcreteSkillsIndex() {
  if (!skillCategories.length) return null

  return (
    <section
      id="skills"
      style={{
        padding: '110px 40px',
        borderBottom: '2px solid var(--color-foreground)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <SectionHeader
          eyebrow={skillsSection.eyebrow}
          title={skillsSection.headline}
          lede={skillsSection.description}
        />
        {skillCategories.map((cat, i) => (
          <div
            key={cat.name}
            className="concrete-skill-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '240px 1fr',
              gap: 64,
              padding: '40px 0',
              borderTop: '2px solid var(--color-foreground)',
              borderBottom:
                i === skillCategories.length - 1
                  ? '2px solid var(--color-foreground)'
                  : 'none',
              alignItems: 'start',
            }}
          >
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: 'var(--color-foreground)',
                }}
              >
                {cat.name}
              </h3>
              <div style={{ marginTop: 10 }}>
                <Label>{cat.skills.length} entries</Label>
              </div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cat.skills.map((rawSkill, j) => {
                const skill = normalizeSkill(rawSkill)
                return (
                  <li
                    key={skill.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '28px minmax(160px, 200px) 1fr',
                      gap: 18,
                      alignItems: 'baseline',
                      padding: '14px 0',
                      borderBottom:
                        '1px solid var(--color-concrete-rule-faint, var(--color-border))',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--color-muted-foreground)',
                        letterSpacing: '0.1em',
                        fontWeight: 500,
                      }}
                    >
                      {String(j + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        color: 'var(--color-foreground)',
                      }}
                    >
                      {skill.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 300,
                        fontSize: '0.92rem',
                        color: 'var(--color-muted-foreground)',
                        lineHeight: 1.45,
                        textWrap: 'pretty',
                      }}
                    >
                      {skill.context ?? ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
