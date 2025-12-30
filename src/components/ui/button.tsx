import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-button',
  {
    variants: {
      variant: {
        default:
          'bg-navy-900 dark:bg-brass-500 text-white dark:text-navy-950 shadow-sm hover:bg-navy-800 dark:hover:bg-brass-400 active:bg-navy-950 dark:active:bg-brass-600',
        secondary:
          'bg-slate-100 dark:bg-navy-800 text-navy-900 dark:text-slate-100 shadow-sm hover:bg-slate-200 dark:hover:bg-navy-700 active:bg-slate-300 dark:active:bg-navy-600',
        outline:
          'border-2 border-navy-900 dark:border-slate-300 text-navy-900 dark:text-slate-100 bg-transparent hover:bg-navy-900 dark:hover:bg-slate-100 hover:text-white dark:hover:text-navy-900',
        ghost:
          'text-navy-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-800 active:bg-slate-200 dark:active:bg-navy-700',
        link: 'text-navy-900 dark:text-slate-100 underline-offset-4 hover:underline',
        accent:
          'bg-brass-500 text-white shadow-sm hover:bg-brass-600 active:bg-brass-700',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
