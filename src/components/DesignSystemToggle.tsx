import { Grid3X3, PenTool, Gauge, Shapes } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import {
  DESIGN_SYSTEMS,
  DEFAULT_DESIGN_SYSTEM,
} from '@/hooks/designSystemConfig'
import type { DesignSystem } from '@/hooks/designSystemConfig'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const DESIGN_SYSTEM_CONFIG: Record<
  DesignSystem,
  { icon: LucideIcon; label: string }
> = {
  corporate: { icon: Grid3X3, label: 'Switch to hand-drawn style' },
  'hand-drawn': { icon: PenTool, label: 'Switch to automotive style' },
  automotive: { icon: Gauge, label: 'Switch to bauhaus style' },
  bauhaus: { icon: Shapes, label: 'Switch to corporate style' },
}

export function DesignSystemToggle() {
  const { designSystem, setDesignSystem } = useDesignSystem()

  const toggle = () => {
    const currentIndex = DESIGN_SYSTEMS.indexOf(designSystem)
    if (currentIndex === -1) {
      console.warn(
        `Invalid design system: "${designSystem}". Resetting to default.`
      )
      setDesignSystem(DEFAULT_DESIGN_SYSTEM)
      return
    }
    const nextIndex = (currentIndex + 1) % DESIGN_SYSTEMS.length
    setDesignSystem(DESIGN_SYSTEMS[nextIndex])
  }

  const config = DESIGN_SYSTEM_CONFIG[designSystem]
  const Icon = config?.icon ?? Grid3X3
  const label = config?.label ?? 'Switch design style'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={label}
            className="relative overflow-hidden"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
