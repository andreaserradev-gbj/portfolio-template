import { skillCategories, skillsSection, sections } from '@/config/loader'
import { SectionHeader, SmallCaps } from './atoms'
import { ordinalFor } from './utils'

export function EditorialSkillsIndex() {
  if (!skillCategories.length) return null

  return (
    <section
      id="skills"
      style={{ padding: '120px 40px', maxWidth: 1240, margin: '0 auto' }}
    >
      <SectionHeader
        num={ordinalFor('skills', sections)}
        eyebrow={skillsSection.eyebrow}
        title={skillsSection.headline}
        lede={skillsSection.description}
      />

      <div
        style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}
      >
        <div />
        <div>
          {skillCategories.map((cat, i) => (
            <div
              key={cat.name}
              className="editorial-skills-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                gap: 32,
                padding: '28px 0',
                borderTop: '1px solid var(--color-foreground)',
                borderBottom:
                  i === skillCategories.length - 1
                    ? '1px solid var(--color-foreground)'
                    : 'none',
                alignItems: 'start',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: '1.6rem',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                    margin: 0,
                    color: 'var(--color-foreground)',
                  }}
                >
                  {cat.name}
                </h3>
                <SmallCaps style={{ display: 'block', marginTop: 4 }}>
                  {`${String(i + 1).padStart(2, '0')} / ${String(
                    skillCategories.length
                  ).padStart(2, '0')}`}
                </SmallCaps>
              </div>
              <div>
                {cat.skills.map((skill, j) => (
                  <div
                    key={skill.name}
                    className="editorial-skill-line"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(200px, 1fr) 2fr',
                      gap: 24,
                      padding: '10px 0',
                      borderBottom:
                        j === cat.skills.length - 1
                          ? 'none'
                          : '1px dashed var(--color-border)',
                      alignItems: 'baseline',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.05rem',
                        color: 'var(--color-foreground)',
                      }}
                    >
                      {skill.name}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.95rem',
                        color: 'var(--color-muted-foreground)',
                        lineHeight: 1.5,
                      }}
                    >
                      {skill.context ?? ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
