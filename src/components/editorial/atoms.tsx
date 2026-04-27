import type { CSSProperties, ReactNode } from 'react'

export function SmallCaps({
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
        fontSize: '0.72rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--color-muted-foreground)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

export function Rule({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div
        style={{
          width: 1,
          alignSelf: 'stretch',
          background: 'var(--color-border)',
        }}
      />
    )
  }
  return (
    <div
      style={{ height: 1, flex: 1, background: 'var(--color-border)' }}
      aria-hidden
    />
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
    <header style={{ marginBottom: 56 }}>
      <SmallCaps>{eyebrow}</SmallCaps>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '12px 0 0',
          color: 'var(--color-foreground)',
          maxWidth: 880,
          textWrap: 'balance',
        }}
      >
        {title}
      </h2>
      {lede && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.1rem',
            lineHeight: 1.55,
            color: 'var(--color-muted-foreground)',
            maxWidth: 720,
            margin: '16px 0 0',
            textWrap: 'pretty',
          }}
        >
          {lede}
        </p>
      )}
    </header>
  )
}
