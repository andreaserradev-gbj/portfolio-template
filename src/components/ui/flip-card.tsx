import * as React from 'react'
import { cn } from '@/lib/utils'

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  isFlipped: boolean
  front: React.ReactNode
  back: React.ReactNode
  onFlip?: () => void
}

const FlipCard = React.forwardRef<HTMLDivElement, FlipCardProps>(
  ({ className, isFlipped, front, back, onFlip, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onFlip?.()
      }
    }

    return (
      <div
        ref={ref}
        className={cn('flip-card', className)}
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        onClick={onFlip}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <div className={cn('flip-card-inner', isFlipped && 'flipped')}>
          <div className="flip-card-front">{front}</div>
          <div className="flip-card-back">{back}</div>
        </div>
      </div>
    )
  }
)
FlipCard.displayName = 'FlipCard'

export { FlipCard }
export type { FlipCardProps }
