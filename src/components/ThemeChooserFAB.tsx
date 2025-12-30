import { useState, useEffect, useRef } from 'react'
import { Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeChooserPanel } from '@/components/ThemeChooserPanel'
import { useFirstVisit } from '@/hooks/useFirstVisit'
import { cn } from '@/lib/utils'

export function ThemeChooserFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const { showPulse, dismissPulse } = useFirstVisit()
  const [isPulsing, setIsPulsing] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const touchRevealedAt = useRef<number>(0)

  // Track if user has ever scrolled - hide FAB after first scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 50) {
        setHasScrolled(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Start pulse animation after a short delay on first visit
  useEffect(() => {
    if (showPulse) {
      const timer = setTimeout(() => {
        setIsPulsing(true)
      }, 1000) // Delay before starting pulse

      return () => clearTimeout(timer)
    }
  }, [showPulse])

  // Stop pulsing and mark as seen after animation completes or on interaction
  useEffect(() => {
    if (isPulsing) {
      const timer = setTimeout(() => {
        setIsPulsing(false)
        dismissPulse()
      }, 4500) // 3 pulses at 1.5s each

      return () => clearTimeout(timer)
    }
  }, [isPulsing, dismissPulse])

  const handleTouchReveal = () => {
    // Record when touch revealed the FAB (only if it was hidden)
    if (hasScrolled && !isHovered) {
      touchRevealedAt.current = Date.now()
    }
    setIsHovered(true)
  }

  const handleClick = () => {
    // If FAB was just revealed by touch, don't open panel on the same tap
    // Require a second tap to actually open
    const timeSinceReveal = Date.now() - touchRevealedAt.current
    if (timeSinceReveal < 300) {
      return
    }

    // Stop pulsing immediately on click
    if (isPulsing) {
      setIsPulsing(false)
      dismissPulse()
    }
    setIsOpen(true)
  }

  // After first scroll, hide completely unless hovered or pulsing
  const shouldShow = !hasScrolled || isHovered || isPulsing || isOpen

  return (
    <>
      {/* Invisible hover/touch zone - always active to reveal hidden FAB */}
      <div
        className="fixed bottom-0 left-0 z-30 w-24 h-24"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchReveal}
        aria-hidden="true"
      />
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        size="icon"
        className={cn(
          'fixed bottom-4 left-4 z-40',
          'h-14 w-14 rounded-full',
          'shadow-lg hover:shadow-xl',
          'bg-card/90 backdrop-blur-sm border-ds border-border text-card-foreground',
          'hover:bg-card hover:border-accent/50',
          'transition-all duration-300',
          isPulsing && 'fab-pulse',
          shouldShow ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        )}
        aria-label="Open theme customizer"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Palette className="h-6 w-6" />
      </Button>

      <ThemeChooserPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
