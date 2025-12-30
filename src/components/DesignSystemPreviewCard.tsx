import type { DesignSystem } from '@/hooks/designSystemConfig'
import { cn } from '@/lib/utils'

interface DesignSystemPreviewCardProps {
  designSystem: DesignSystem
  isSelected: boolean
  onClick: () => void
}

const DESIGN_SYSTEM_INFO: Record<
  DesignSystem,
  { label: string; description: string }
> = {
  corporate: {
    label: 'Corporate',
    description: 'Professional & clean',
  },
  'hand-drawn': {
    label: 'Hand-Drawn',
    description: 'Sketchy & playful',
  },
  automotive: {
    label: 'Automotive',
    description: 'Industrial & sleek',
  },
  bauhaus: {
    label: 'Bauhaus',
    description: 'Geometric & bold',
  },
}

function CorporatePreview() {
  return (
    <div className="w-full h-16 relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-50">
      {/* Navy header bar */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-navy-800" />
      {/* Content blocks */}
      <div className="absolute top-5 left-2 right-2 flex gap-1">
        <div className="w-4 h-4 rounded bg-navy-200" />
        <div className="flex-1 space-y-1">
          <div className="h-1.5 bg-slate-300 rounded-full w-3/4" />
          <div className="h-1.5 bg-slate-200 rounded-full w-1/2" />
        </div>
      </div>
      {/* Brass accent */}
      <div className="absolute bottom-2 left-2 h-1 w-8 bg-brass-400 rounded-full" />
    </div>
  )
}

function HandDrawnPreview() {
  return (
    <div className="w-full h-16 relative overflow-hidden bg-amber-50 border-2 border-dashed border-slate-400">
      {/* Wavy header */}
      <svg
        className="absolute top-0 left-0 right-0 h-4 text-slate-600"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
      >
        <path
          d="M0 10 Q 10 5, 20 10 T 40 10 T 60 10 T 80 10 T 100 10 V 0 H 0 Z"
          fill="currentColor"
          opacity="0.3"
        />
      </svg>
      {/* Sketchy content */}
      <div className="absolute top-6 left-2 right-2 flex gap-1.5">
        <div className="w-4 h-4 rounded-sm bg-slate-300 rotate-2" />
        <div className="flex-1 space-y-1.5">
          <div className="h-1.5 bg-slate-400 w-2/3 -rotate-1" />
          <div className="h-1.5 bg-slate-300 w-1/2 rotate-1" />
        </div>
      </div>
      {/* Red marker underline */}
      <div className="absolute bottom-2 left-2 h-1 w-6 bg-red-400 -rotate-2 rounded-full" />
    </div>
  )
}

function AutomotivePreview() {
  return (
    <div className="w-full h-16 relative overflow-hidden rounded-lg bg-slate-200">
      {/* Neumorphic card */}
      <div
        className="absolute top-2 left-2 right-2 bottom-2 rounded-md bg-slate-100"
        style={{
          boxShadow: 'inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff',
        }}
      >
        {/* Gauge-like element */}
        <div className="absolute top-1.5 left-2 w-3 h-3 rounded-full bg-slate-300 border border-slate-400" />
        {/* Content lines */}
        <div className="absolute top-2 left-7 right-2 space-y-1">
          <div className="h-1 bg-slate-400 rounded w-3/4" />
          <div className="h-1 bg-slate-300 rounded w-1/2" />
        </div>
        {/* Red accent */}
        <div className="absolute bottom-1.5 right-2 w-2 h-2 rounded bg-red-500" />
      </div>
    </div>
  )
}

function BauhausPreview() {
  return (
    <div className="w-full h-16 relative overflow-hidden bg-slate-50 border-2 border-slate-900">
      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-around pt-1.5">
            {[...Array(8)].map((_, j) => (
              <div key={j} className="w-0.5 h-0.5 bg-slate-900 rounded-full" />
            ))}
          </div>
        ))}
      </div>
      {/* Geometric shapes */}
      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-red-500" />
      <div className="absolute top-2 left-8 w-4 h-4 bg-blue-600" />
      <div className="absolute bottom-2 left-2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-yellow-400" />
      {/* Black bar */}
      <div className="absolute top-2 right-2 bottom-2 w-1.5 bg-slate-900" />
    </div>
  )
}

export function DesignSystemPreviewCard({
  designSystem,
  isSelected,
  onClick,
}: DesignSystemPreviewCardProps) {
  const info = DESIGN_SYSTEM_INFO[designSystem]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-card border-ds border text-left transition-all duration-200',
        'hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        isSelected
          ? 'bg-accent/10 border-accent ring-2 ring-accent ring-offset-2 ring-offset-card'
          : 'bg-card border-border hover:border-accent/50 hover:bg-muted/50'
      )}
      aria-pressed={isSelected}
    >
      {/* Preview visualization */}
      <div className="mb-2 overflow-hidden rounded-button">
        {designSystem === 'corporate' && <CorporatePreview />}
        {designSystem === 'hand-drawn' && <HandDrawnPreview />}
        {designSystem === 'automotive' && <AutomotivePreview />}
        {designSystem === 'bauhaus' && <BauhausPreview />}
      </div>

      {/* Label and description */}
      <div className="space-y-0.5">
        <div className="font-medium text-sm text-card-foreground">
          {info.label}
        </div>
        <div className="text-xs text-muted-foreground">{info.description}</div>
      </div>
    </button>
  )
}
