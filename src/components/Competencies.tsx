import { useState, useRef, useEffect } from 'react'
import { Handshake, Layers, Users, Trophy, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { achievements, achievementsSection } from '@/config/loader'
import { cn } from '@/lib/utils'

const categoryConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
  }
> = {
  partnership: {
    icon: Handshake,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
  },
  architecture: {
    icon: Layers,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  leadership: {
    icon: Users,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/50',
  },
  motorsport: {
    icon: Trophy,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
  },
}

export function Competencies() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Return null if no achievements to display
  if (achievements.length === 0) return null

  return (
    <section id="achievements" className="section-padding">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            {achievementsSection.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold text-foreground mb-4">
            {achievementsSection.headline}
          </h2>
          <p className="text-lg text-muted-foreground">
            {achievementsSection.description}
          </p>
        </div>

        {/* Cards Grid */}
        <div
          ref={sectionRef}
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {achievements.map((achievement, index) => {
            const config = categoryConfig[achievement.category]
            const Icon = config?.icon || Layers
            const isExpanded = expandedId === achievement.id

            return (
              <Card
                key={achievement.id}
                className={cn(
                  'overflow-hidden border-border transition-all duration-300 cursor-pointer',
                  isExpanded && 'ring-1 ring-border',
                  isVisible && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() =>
                  setExpandedId(isExpanded ? null : achievement.id)
                }
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
                        config?.bgColor
                      )}
                    >
                      <Icon className={cn('w-6 h-6', config?.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Badge
                        variant="muted"
                        className="mb-2 capitalize text-xs"
                      >
                        {achievement.category}
                      </Badge>
                      <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.summary}
                      </p>
                    </div>

                    {/* Expand button */}
                    <button
                      className="shrink-0 w-8 h-8 rounded-button bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </button>
                  </div>
                </CardHeader>

                {/* Expandable content */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isExpanded ? 'max-h-[800px]' : 'max-h-0'
                  )}
                >
                  <CardContent className="pt-0 border-t border-border">
                    {/* Impact */}
                    <div className="py-4 bg-muted -mx-6 px-6 mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Impact
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {achievement.impact}
                      </p>
                    </div>

                    {/* Details */}
                    <ul className="space-y-2 mb-4">
                      {achievement.details.map((detail, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-accent font-bold shrink-0">
                            &rarr;
                          </span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Metrics */}
                    {achievement.metrics && (
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                        {achievement.metrics.map((metric) => (
                          <div key={metric.label} className="text-center">
                            <p className="text-xl font-display font-bold text-foreground">
                              {metric.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
