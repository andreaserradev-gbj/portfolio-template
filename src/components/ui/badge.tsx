import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-badge px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-navy-900 dark:bg-brass-500 text-white dark:text-navy-950',
        secondary:
          'bg-slate-100 dark:bg-navy-800 text-navy-800 dark:text-slate-300',
        outline: 'border border-border text-muted-foreground bg-transparent',
        accent:
          'bg-brass-100 dark:bg-brass-900/30 text-brass-800 dark:text-brass-400',
        muted:
          'bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants }
