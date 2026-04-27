import type { CSSProperties, ReactNode } from 'react'

export function Label({
  children,
  style,
}: {
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--color-muted-foreground)',
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string
  title: ReactNode
  lede?: ReactNode
}) {
  return (
    <header style={{ marginBottom: 48 }}>
      <Label>{eyebrow}</Label>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(2.2rem, 3.6vw, 3rem)',
          lineHeight: 1,
          letterSpacing: '-0.025em',
          margin: '12px 0 0',
          color: 'var(--color-foreground)',
          maxWidth: 720,
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: '1.05rem',
            lineHeight: 1.5,
            color: 'var(--color-muted-foreground)',
            margin: '16px 0 0',
            maxWidth: 600,
            textWrap: 'pretty',
          }}
        >
          {lede}
        </p>
      )}
    </header>
  )
}

/**
 * 2px-bordered chip (tech stack tags, project tags).
 */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--color-foreground)',
        border: '2px solid var(--color-foreground)',
        padding: '4px 10px',
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  )
}
