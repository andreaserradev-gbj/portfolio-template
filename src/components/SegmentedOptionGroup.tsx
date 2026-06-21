import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon: LucideIcon
}

interface SegmentedOptionGroupProps<T extends string> {
  title: string
  ariaLabel: string
  options: readonly SegmentedOption<T>[]
  selected: T
  onSelect: (value: T) => void
}

/**
 * Labeled segmented control: a titled row of mutually-exclusive
 * icon+label buttons backed by a radiogroup. Used for the theme/layout
 * pickers in ThemeChooserPanel.
 */
export function SegmentedOptionGroup<T extends string>({
  title,
  ariaLabel,
  options,
  selected,
  onSelect,
}: SegmentedOptionGroupProps<T>) {
  return (
    <section>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        {title}
      </h3>
      <div className="flex gap-2" role="radiogroup" aria-label={ariaLabel}>
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = selected === option.value
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4',
                'rounded-button border-ds border transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                isSelected
                  ? 'bg-accent/10 border-accent text-accent'
                  : 'bg-card border-border text-muted-foreground hover:border-accent/50 hover:text-card-foreground'
              )}
              role="radio"
              aria-checked={isSelected}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
