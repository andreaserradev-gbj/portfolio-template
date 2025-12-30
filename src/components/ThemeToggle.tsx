import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    const order: Array<'system' | 'light' | 'dark'> = [
      'system',
      'light',
      'dark',
    ]
    const currentIndex = order.indexOf(theme)
    const nextIndex = (currentIndex + 1) % order.length
    setTheme(order[nextIndex])
  }

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return resolvedTheme === 'dark' ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )
  }

  const getLabel = () => {
    switch (theme) {
      case 'system':
        return 'System theme'
      case 'light':
        return 'Light theme'
      case 'dark':
        return 'Dark theme'
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={getLabel()}
      className={cn(
        'relative overflow-hidden',
        'text-foreground',
        'hover:bg-muted',
        'transition-all duration-200'
      )}
    >
      <span className="transition-transform duration-300">{getIcon()}</span>
    </Button>
  )
}
