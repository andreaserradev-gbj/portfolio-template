import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DesignSystemPreviewCard } from '@/components/DesignSystemPreviewCard'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { useTheme } from '@/hooks/useTheme'
import { DESIGN_SYSTEMS } from '@/hooks/designSystemConfig'
import { cn } from '@/lib/utils'

interface ThemeChooserPanelProps {
  isOpen: boolean
  onClose: () => void
}

const THEME_OPTIONS = [
  { value: 'system' as const, label: 'System', icon: Monitor },
  { value: 'light' as const, label: 'Light', icon: Sun },
  { value: 'dark' as const, label: 'Dark', icon: Moon },
]

export function ThemeChooserPanel({ isOpen, onClose }: ThemeChooserPanelProps) {
  const { designSystem, setDesignSystem } = useDesignSystem()
  const { theme, setTheme } = useTheme()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [isClosing, setIsClosing] = useState(false)

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 200) // Match animation duration
  }, [onClose])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen || !panelRef.current) return

    // Focus the close button when panel opens
    closeButtonRef.current?.focus()

    // Lock body scroll
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  if (!isOpen && !isClosing) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50',
        isClosing ? 'backdrop-fade-out' : 'backdrop-fade-in'
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-chooser-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'absolute inset-y-0 left-0 w-full max-w-sm md:max-w-md',
          'bg-card border-r border-border shadow-xl',
          'flex flex-col',
          isClosing ? 'panel-slide-out' : 'panel-slide-in'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2
            id="theme-chooser-title"
            className="text-lg font-semibold text-card-foreground"
          >
            Customize Theme
          </h2>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close theme chooser"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Design System Section */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Design System
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {DESIGN_SYSTEMS.map((ds) => (
                <DesignSystemPreviewCard
                  key={ds}
                  designSystem={ds}
                  isSelected={designSystem === ds}
                  onClick={() => setDesignSystem(ds)}
                />
              ))}
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Color Mode
            </h3>
            <div
              className="flex gap-2"
              role="radiogroup"
              aria-label="Color mode"
            >
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = theme === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
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
        </div>

        {/* Footer hint */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Your preferences are saved automatically
          </p>
        </div>
      </div>
    </div>
  )
}
