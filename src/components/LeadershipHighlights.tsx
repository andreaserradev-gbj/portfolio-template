import { useRef, useState, useEffect } from 'react'
import { Handshake, TrendingUp, Globe, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressRing } from '@/components/ui/progress-ring'
import { FlipCard } from '@/components/ui/flip-card'
import { useDesignSystem } from '@/hooks/useDesignSystem'
import { metrics, achievements, type Metric } from '@/config/loader'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Years Atlassian Partnership': Handshake,
  'Revenue Growth': TrendingUp,
  'Daily API Requests': Globe,
  'Years Experience': Calendar,
}

// Bauhaus shape badges for metrics
const bauhausShapes = ['circle', 'square', 'diamond', 'circle'] as const

function BauhausShapeBadge({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  const shape = bauhausShapes[index % bauhausShapes.length]
  return (
    <div
      className={cn(
        'bauhaus-shape-badge',
        shape === 'circle' && 'bauhaus-shape-badge--circle',
        shape === 'square' && 'bauhaus-shape-badge--square',
        shape === 'diamond' && 'bauhaus-shape-badge--diamond'
      )}
    >
      <span>{children}</span>
    </div>
  )
}

function AnimatedCounter({
  value,
  suffix,
  isVisible,
}: {
  value: number
  suffix: string
  isVisible: boolean
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepValue = value / steps
    const stepDuration = duration / steps
    let current = 0

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, isVisible])

  return (
    <span className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
}

// Helper to get back content from metric's backContent or achievement
function getBackContent(metric: Metric) {
  // Prioritize custom backContent if provided
  if (metric.backContent) {
    return {
      title: metric.backContent.title,
      category: metric.backContent.category,
      impact: metric.backContent.impact,
      stats: metric.backContent.stats || [],
      details: metric.backContent.details.slice(0, 2),
    }
  }
  // Fall back to linked achievement
  const achievement = achievements.find((a) => a.id === metric.achievementId)
  if (achievement) {
    return {
      title: achievement.title,
      category: achievement.category,
      impact: achievement.impact,
      stats: achievement.metrics || [],
      details: achievement.details.slice(0, 2),
    }
  }
  return {
    title: metric.label,
    category: 'achievement' as const,
    impact: metric.description || '',
    stats: [],
    details: [],
  }
}

// Category badge color mapping
const categoryColors: Record<string, string> = {
  partnership:
    'bg-brass-100 text-brass-700 dark:bg-brass-900/30 dark:text-brass-400',
  architecture: 'bg-navy-200 text-navy-800 dark:bg-navy-800 dark:text-navy-300',
  leadership:
    'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  motorsport: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  growth:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export function LeadershipHighlights() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)
  const { designSystem } = useDesignSystem()
  const isBauhaus = designSystem === 'bauhaus'

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleFlip = (index: number) => {
    setFlippedIndex(flippedIndex === index ? null : index)
  }

  // Return null if no metrics to display
  if (metrics.length === 0) return null

  return (
    <section id="impact" className="section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-brass-600 dark:text-brass-400 uppercase tracking-wider mb-3">
            Leadership Impact
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-navy-900 dark:text-slate-100 mb-4">
            Numbers That Matter
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A track record of driving measurable results through technical
            excellence and strategic leadership.
          </p>
        </div>

        {/* Metrics Grid */}
        <div
          ref={sectionRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {metrics.map((metric, index) => {
            const Icon = iconMap[metric.label] || Calendar
            const backContent = getBackContent(metric)
            const isFlipped = flippedIndex === index

            return (
              <FlipCard
                key={metric.label}
                isFlipped={isFlipped}
                onFlip={() => handleFlip(index)}
                className={cn(
                  'h-[200px] md:h-[220px] cursor-pointer',
                  isVisible && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-label={`${metric.label}: ${metric.value}${metric.suffix}. ${isFlipped ? 'Press to show metric' : 'Press to show details'}`}
                front={
                  <Card
                    className={cn(
                      'group relative overflow-hidden border-border hover:border-accent card-hover h-full'
                    )}
                  >
                    <CardContent className="p-6 text-center relative h-full flex flex-col justify-center">
                      {/* Progress Ring - positioned behind content */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                        <ProgressRing
                          value={metric.value}
                          max={metric.max || metric.value}
                          size={100}
                          strokeWidth={6}
                          isVisible={isVisible}
                        />
                      </div>

                      {/* Icon or Bauhaus Shape Badge */}
                      {isBauhaus ? (
                        <div className="relative mb-4">
                          <BauhausShapeBadge index={index}>
                            {index + 1}
                          </BauhausShapeBadge>
                        </div>
                      ) : (
                        <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-400 group-hover:bg-brass-50 dark:group-hover:bg-brass-900/30 group-hover:text-brass-600 dark:group-hover:text-brass-400 transition-colors mb-4 mx-auto">
                          <Icon className="w-6 h-6" />
                        </div>
                      )}

                      {/* Value */}
                      <p className="relative text-3xl md:text-4xl font-mono font-bold text-navy-900 dark:text-slate-100 mb-1">
                        <AnimatedCounter
                          value={metric.value}
                          suffix={metric.suffix}
                          isVisible={isVisible}
                        />
                      </p>

                      {/* Label */}
                      <p className="relative text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {metric.label}
                      </p>

                      {/* Click hint */}
                      <p className="relative text-xs text-slate-400 dark:text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click for details
                      </p>
                    </CardContent>
                    {/* Hover accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brass-400 to-brass-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Card>
                }
                back={
                  <Card className="group relative overflow-hidden border-border border-accent h-full bg-card">
                    <CardContent className="p-4 md:p-5 h-full flex flex-col">
                      {/* Category Badge */}
                      <Badge
                        className={cn(
                          'w-fit text-xs mb-2',
                          categoryColors[backContent.category] ||
                            categoryColors.leadership
                        )}
                      >
                        {backContent.category}
                      </Badge>

                      {/* Title */}
                      <h4 className="font-display font-semibold text-sm md:text-base text-navy-900 dark:text-slate-100 mb-1 line-clamp-2">
                        {backContent.title}
                      </h4>

                      {/* Impact */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                        {backContent.impact}
                      </p>

                      {/* Stats */}
                      {backContent.stats.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {backContent.stats.slice(0, 2).map((stat) => (
                            <div
                              key={stat.label}
                              className="text-center bg-slate-50 dark:bg-navy-800 rounded px-2 py-1"
                            >
                              <p className="text-xs font-mono font-bold text-brass-600 dark:text-brass-400">
                                {stat.value}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {stat.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Details */}
                      {backContent.details.length > 0 && (
                        <ul className="space-y-1 mt-auto">
                          {backContent.details.map((detail, i) => (
                            <li
                              key={i}
                              className="flex gap-1.5 text-[11px] text-slate-600 dark:text-slate-400"
                            >
                              <span className="text-brass-500 shrink-0">
                                &rarr;
                              </span>
                              <span className="line-clamp-2">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Click hint */}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
                        Click to flip back
                      </p>
                    </CardContent>
                    {/* Accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brass-400 to-brass-500" />
                  </Card>
                }
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
